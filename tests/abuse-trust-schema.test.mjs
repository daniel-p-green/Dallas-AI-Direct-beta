import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const migrationPath = path.join(repoRoot, 'db/migrations/202602150340_abuse_trust_schema.sql');

function readMigration() {
  return fs.readFileSync(migrationPath, 'utf8');
}

test('abuse trust migration file exists', () => {
  assert.equal(fs.existsSync(migrationPath), true);
});

test('migration creates abuse risk event and moderation queue tables', () => {
  const sql = readMigration();

  assert.match(sql, /create table if not exists public\.signup_risk_events/i);
  assert.match(sql, /create table if not exists public\.signup_moderation_queue/i);
});

test('migration includes risk score, trigger reasons, queue status, and audit timestamps', () => {
  const sql = readMigration();

  assert.match(sql, /risk_score integer not null check \(risk_score >= 0 and risk_score <= 100\)/i);
  assert.match(sql, /triggered_rules text\[\] not null default '\{\}'::text\[\]/i);
  assert.match(sql, /status text not null default 'pending' check \(status in \('pending', 'reviewing', 'resolved', 'false_positive'\)\)/i);
  assert.match(sql, /created_at timestamptz not null default now\(\)/i);
  assert.match(sql, /updated_at timestamptz not null default now\(\)/i);
  assert.match(sql, /resolved_at timestamptz/i);
});

test('migration supports event correlation lookups and moderation queue filtering indexes', () => {
  const sql = readMigration();

  assert.match(sql, /create index if not exists signup_risk_events_request_fingerprint_created_at_idx/i);
  assert.match(sql, /create index if not exists signup_moderation_queue_status_created_at_idx/i);
  assert.match(sql, /create index if not exists signup_moderation_queue_status_risk_score_created_at_idx/i);
  assert.match(sql, /create index if not exists signup_moderation_queue_request_fingerprint_created_at_idx/i);
});

test('migration avoids raw email fields and enforces redacted/hash alternatives', () => {
  const sql = readMigration();

  assert.doesNotMatch(sql, /\bemail\s+text\b/i);
  assert.match(sql, /email_hash text/i);
  assert.match(sql, /email_redacted text/i);
  assert.match(sql, /constraint signup_risk_events_redacted_email_mask check/i);
  assert.match(sql, /constraint signup_moderation_queue_redacted_email_mask check/i);
});
