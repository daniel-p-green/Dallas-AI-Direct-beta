import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const migrationPath = path.join(repoRoot, 'db/migrations/202602150330_match_engine_schema.sql');

function readMigration() {
  return fs.readFileSync(migrationPath, 'utf8');
}

test('match engine migration file exists', () => {
  assert.equal(fs.existsSync(migrationPath), true);
});

test('migration creates required match engine tables', () => {
  const sql = readMigration();

  assert.match(sql, /create table if not exists public\.match_runs/i);
  assert.match(sql, /create table if not exists public\.attendee_matches/i);
  assert.match(sql, /create table if not exists public\.match_decision_events/i);
});

test('migration enforces referential integrity across runs, matches, decisions, and attendees', () => {
  const sql = readMigration();

  assert.match(sql, /run_id uuid not null references public\.match_runs\(id\) on delete cascade/i);
  assert.match(sql, /attendee_id uuid not null references public\.attendees\(id\) on delete cascade/i);
  assert.match(sql, /matched_attendee_id uuid not null references public\.attendees\(id\) on delete cascade/i);
  assert.match(sql, /match_id uuid not null references public\.attendee_matches\(id\) on delete cascade/i);
});

test('migration defines deterministic scoring inputs/outputs and moderation status fields', () => {
  const sql = readMigration();

  assert.match(sql, /algorithm_version text not null/i);
  assert.match(sql, /scoring_weights jsonb not null default '\{\}'::jsonb/i);
  assert.match(sql, /run_metadata jsonb not null default '\{\}'::jsonb/i);
  assert.match(sql, /overlap_score numeric\(6, 4\) not null/i);
  assert.match(sql, /ai_comfort_proximity_score numeric\(6, 4\) not null/i);
  assert.match(sql, /recency_score numeric\(6, 4\) not null/i);
  assert.match(sql, /consent_visibility_score numeric\(6, 4\) not null/i);
  assert.match(sql, /total_score numeric\(6, 4\) not null/i);
  assert.match(sql, /status text not null default 'suggested' check \(status in \('suggested', 'approved', 'rejected'\)\)/i);
  assert.match(sql, /decision text not null check \(decision in \('approved', 'rejected', 'reset'\)\)/i);
});

test('migration includes facilitator queue and top-N indexes', () => {
  const sql = readMigration();

  assert.match(sql, /create index if not exists attendee_matches_status_created_at_idx/i);
  assert.match(sql, /create index if not exists attendee_matches_run_id_status_created_at_idx/i);
  assert.match(sql, /create index if not exists attendee_matches_attendee_id_status_total_score_idx/i);
  assert.match(sql, /create index if not exists attendee_matches_run_id_attendee_id_total_score_idx/i);
  assert.match(sql, /on public\.attendee_matches \(status, created_at desc\)/i);
  assert.match(sql, /on public\.attendee_matches \(run_id, status, created_at desc\)/i);
  assert.match(sql, /on public\.attendee_matches \(attendee_id, status, total_score desc, created_at desc\)/i);
});

test('migration includes auditable timestamps across runs, matches, and decision events', () => {
  const sql = readMigration();

  assert.match(sql, /generated_at timestamptz not null default now\(\)/i);
  assert.match(sql, /created_at timestamptz not null default now\(\)/i);
  assert.match(sql, /updated_at timestamptz not null default now\(\)/i);
  assert.match(sql, /reviewed_at timestamptz/i);
});

test('migration keeps privacy-safe projection boundary for match responses', () => {
  const sql = readMigration();

  assert.match(sql, /public_profile_snapshot jsonb not null default '\{\}'::jsonb/i);
  assert.doesNotMatch(sql, /\bemail\b/i);
});
