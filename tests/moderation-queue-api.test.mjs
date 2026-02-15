import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('moderation queue endpoint returns suspicious records with event linkage and status metadata', () => {
  const route = read('app/api/moderation/queue/route.ts');

  assert.match(route, /export async function GET/);
  assert.match(route, /from signup_moderation_queue mq/);
  assert.match(route, /join signup_risk_events re on re\.id = mq\.risk_event_id/);
  assert.match(route, /triggered_rules/);
  assert.match(route, /status/);
  assert.match(route, /order by mq\.created_at desc, mq\.id asc/);
  assert.match(route, /event:\s*\{/);
  assert.match(route, /created_at: row\.event_created_at/);
});

test('moderation queue payload remains redacted-safe and excludes private attendee fields', () => {
  const route = read('app/api/moderation/queue/route.ts');

  assert.match(route, /identifiers:\s*\{/);
  assert.match(route, /email_redacted/);
  assert.match(route, /request_fingerprint_hash/);
  assert.doesNotMatch(route, /\bemail\b(?!_redacted|_hash)/);
  assert.doesNotMatch(route, /linkedin_url/);
  assert.doesNotMatch(route, /name as/);
});

test('moderation queue status update persists resolution state', () => {
  const route = read('app/api/moderation/queue/route.ts');

  assert.match(route, /export async function PATCH/);
  assert.match(route, /update signup_moderation_queue as mq/);
  assert.match(route, /status = \$\{status\}/);
  assert.match(route, /resolution = \$\{isResolved \? resolution : null\}/);
  assert.match(route, /resolution_notes = \$\{isResolved \? resolutionNotes : null\}/);
  assert.match(route, /resolved_by = \$\{isResolved \? resolvedBy : null\}/);
  assert.match(route, /resolved_at = \$\{isResolved \? new Date\(\)\.toISOString\(\) : null\}/);
  assert.match(route, /updated_at = now\(\)/);
  assert.match(route, /Moderation queue item not found/);
});
