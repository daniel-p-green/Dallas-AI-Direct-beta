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

test('signup route records abuse telemetry and moderation queue inserts', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /insert into public\.signup_risk_events/);
  assert.match(route, /insert into public\.signup_moderation_queue/);
  assert.match(route, /eventType: 'rate_limited'/);
  assert.match(route, /eventType: payload\.honeypot\.length > 0 \? 'blocked' : 'flagged'/);
});

test('signup route hardens duplicate conflicts with risk-rule signaling and redacted logs', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /duplicateTriggered: true/);
  assert.match(route, /reason: 'duplicate_email_conflict'/);
  assert.match(route, /event: 'signup_security'/);
  assert.match(route, /emailRedacted/);
});
