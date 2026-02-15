import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('signup route enforces deterministic 429 rate-limit response and headers', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /if \(rateLimitSnapshot\.isLimited\)/);
  assert.match(route, /status: 429/);
  assert.match(route, /Too many signup attempts\. Please try again later\./);
  assert.match(route, /'X-RateLimit-Limit'/);
  assert.match(route, /'X-RateLimit-Remaining'/);
  assert.match(route, /'X-RateLimit-Reset'/);
  assert.match(route, /'Retry-After'/);
  assert.match(route, /headers: getRateLimitHeaders\(rateLimitSnapshot\)/);
});

test('signup route records suspicious attempts into risk events and moderation queue with trigger metadata', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /insert into public\.signup_risk_events/);
  assert.match(route, /insert into public\.signup_moderation_queue/);
  assert.match(route, /triggered_rules/);
  assert.match(route, /eventType: 'rate_limited'/);
  assert.match(route, /eventType: payload\.honeypot\.length > 0 \? 'blocked' : 'flagged'/);
  assert.match(route, /shouldEnqueueModeration =\s*args\.eventType === 'rate_limited' \|\| args\.riskSignal\.riskScore >= config\.riskScoring\.suspiciousScoreThreshold/);
});

test('duplicate signup conflict keeps stable 409 contract while telemetry obeys duplicate policy flag', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /if \(duplicate\)/);
  assert.match(route, /if \(config\.abuseTelemetry\.recordDuplicateAttempts\)/);
  assert.match(route, /reason: 'duplicate_email_conflict'/);
  assert.match(route, /This email has already been used for signup\./);
  assert.match(route, /status: 409/);
});

test('signup route enforces active-event check-in windows with a defined non-2xx contract', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /isWithinCheckInWindow\(/);
  assert.match(route, /checkInWindowStart: activeEvent\.check_in_window_start/);
  assert.match(route, /checkInWindowEnd: activeEvent\.check_in_window_end/);
  assert.match(route, /CHECK_IN_WINDOW_CLOSED/);
  assert.match(route, /Check-in is closed for the active event session\./);
  assert.match(route, /status: 403/);
});

test('valid first-time signup success response contract remains stable', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /await db`[\s\S]*insert into attendees/);
  assert.match(route, /return NextResponse\.json\(\{[\s\S]*ok: true/);
});

test('signup risk persistence remains redacted (no raw email columns in abuse tables)', () => {
  const route = read('app/api/attendees/signup/route.ts');

  const riskInsertStart = route.indexOf('insert into public.signup_risk_events');
  const riskInsertEnd = route.indexOf('returning id', riskInsertStart);
  const riskInsertSection = route.slice(riskInsertStart, riskInsertEnd);

  const queueInsertStart = route.indexOf('insert into public.signup_moderation_queue');
  const queueInsertEnd = route.indexOf('status', queueInsertStart);
  const queueInsertSection = route.slice(queueInsertStart, queueInsertEnd);

  assert.ok(riskInsertStart > -1 && riskInsertEnd > riskInsertStart);
  assert.ok(queueInsertStart > -1 && queueInsertEnd > queueInsertStart);

  assert.match(riskInsertSection, /email_hash/);
  assert.match(riskInsertSection, /email_redacted/);
  assert.doesNotMatch(riskInsertSection, /\n\s*email,\n/);

  assert.match(queueInsertSection, /email_hash/);
  assert.match(queueInsertSection, /email_redacted/);
  assert.doesNotMatch(queueInsertSection, /\n\s*email,\n/);
});

test('signup trust decision logs use stable schema and emit allow/flag/block decisions', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /event: 'signup_trust_decision'/);
  assert.match(route, /schemaVersion: '2026-02-15\.v1'/);
  assert.match(route, /route: '\/api\/attendees\/signup'/);
  assert.match(route, /decision: 'allow'/);
  assert.match(route, /decision: args\.eventType === 'flagged' \? 'flag' : 'block'/);
  assert.match(route, /decision: 'flag'/);
  assert.match(route, /routeOutcome/);
  assert.match(route, /riskScore/);
  assert.match(route, /triggeredRules/);
  assert.match(route, /requestFingerprintHash/);
  assert.match(route, /reason: 'duplicate_email_conflict'/);
});

test('signup trust decision logs redact sensitive values and never log raw email/ip', () => {
  const route = read('app/api/attendees/signup/route.ts');

  const loggerStart = route.indexOf('function emitSignupTrustDecisionLog');
  const loggerEnd = route.indexOf('async function recordRiskEvent', loggerStart);
  const loggerSection = route.slice(loggerStart, loggerEnd);

  assert.ok(loggerStart > -1 && loggerEnd > loggerStart);
  assert.match(loggerSection, /emailHash/);
  assert.match(loggerSection, /emailRedacted/);
  assert.match(loggerSection, /ipHash/);
  assert.match(loggerSection, /userAgentHash/);
  assert.doesNotMatch(loggerSection, /"email"\s*:/i);
  assert.doesNotMatch(loggerSection, /"ip"\s*:/i);
});
