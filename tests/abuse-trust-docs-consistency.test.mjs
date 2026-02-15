import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('abuse trust plan artifact exists', () => {
  const planPath = path.join(repoRoot, 'plans/2026-02-15-abuse-trust-layer-v1.md');
  assert.ok(fs.existsSync(planPath), 'expected abuse-trust plan file to exist');

  const plan = fs.readFileSync(planPath, 'utf8');
  assert.match(plan, /Plan — Abuse\/Trust Layer v1/i);
  assert.match(plan, /US-008/i);
});

test('security doc describes configurable limits, scoring factors, and moderation workflow', () => {
  const security = read('docs/security.md');

  assert.match(security, /Configurable signup rate limits/i);
  assert.match(security, /SIGNUP_RATE_LIMIT_WINDOW_MS/i);
  assert.match(security, /SIGNUP_RATE_LIMIT_MAX_REQUESTS/i);
  assert.match(security, /Heuristic risk scoring factors/i);
  assert.match(security, /honeypot_present/i);
  assert.match(security, /velocity_exceeded/i);
  assert.match(security, /malformed_payload_frequency/i);
  assert.match(security, /duplicate_email_conflict/i);
  assert.match(security, /Moderation queue workflow/i);
  assert.match(security, /GET \/api\/moderation\/queue/i);
  assert.match(security, /PATCH \/api\/moderation\/queue/i);
});

test('incident response includes redacted trust log and suspicious record inspection steps', () => {
  const runbook = read('ops/incident-response.md');

  assert.match(runbook, /Inspect redacted signup trust logs/i);
  assert.match(runbook, /signup_trust_decision/i);
  assert.match(runbook, /schemaVersion: 2026-02-15\.v1/i);
  assert.match(runbook, /Confirm suspicious-event persistence/i);
  assert.match(runbook, /signup_risk_events/i);
  assert.match(runbook, /signup_moderation_queue/i);
});

test('runtime validation includes deterministic 429 and suspicious persistence checks', () => {
  const runtime = read('docs/runtime-validation.md');

  assert.match(runtime, /Execute deterministic burst test/i);
  assert.match(runtime, /final response is `429`/i);
  assert.match(runtime, /X-RateLimit-\*/i);
  assert.match(runtime, /Verify suspicious-event persistence/i);
  assert.match(runtime, /signup_risk_events/i);
  assert.match(runtime, /signup_moderation_queue/i);
});
