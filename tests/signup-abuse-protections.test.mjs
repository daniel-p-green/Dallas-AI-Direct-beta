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

test('valid first-time signup success response contract remains stable', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /await db`[\s\S]*insert into attendees/);
  assert.match(route, /return NextResponse\.json\(\{[\s\S]*ok: true/);
});

test('signup risk persistence and logs remain redacted (no raw email columns in abuse tables)', () => {
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

  assert.match(route, /event: 'signup_security'/);
  assert.match(route, /emailRedacted/);
  assert.match(route, /reason: 'duplicate_email_conflict'/);
});
