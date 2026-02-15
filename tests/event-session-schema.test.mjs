import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const migrationPath = path.join(repoRoot, 'db/migrations/202602150420_event_session_schema.sql');

function readMigration() {
  return fs.readFileSync(migrationPath, 'utf8');
}

test('event session migration file exists', () => {
  assert.equal(fs.existsSync(migrationPath), true);
});

test('migration creates events table with active-session and check-in window fields', () => {
  const sql = readMigration();

  assert.match(sql, /create table if not exists public\.events/i);
  assert.match(sql, /is_active boolean not null default false/i);
  assert.match(sql, /check_in_window_start timestamptz/i);
  assert.match(sql, /check_in_window_end timestamptz/i);
});

test('migration enforces valid event/session and check-in window bounds', () => {
  const sql = readMigration();

  assert.match(sql, /starts_at <= ends_at/i);
  assert.match(sql, /check_in_window_start <= check_in_window_end/i);
  assert.match(sql, /check_in_window_start is not null\s+and check_in_window_end is not null/i);
});

test('migration adds attendee-to-event linkage with referential integrity', () => {
  const sql = readMigration();

  assert.match(sql, /add column event_id uuid references public\.events\(id\) on delete set null/i);
});

test('migration defines active-event and event-scoped attendee indexes', () => {
  const sql = readMigration();

  assert.match(sql, /create unique index if not exists events_single_active_idx/i);
  assert.match(sql, /on public\.events \(\(is_active\)\)\s+where is_active/i);
  assert.match(sql, /create index if not exists events_active_starts_at_idx/i);
  assert.match(sql, /on public\.events \(is_active, starts_at desc, created_at desc\)\s+where is_active/i);
  assert.match(sql, /create index if not exists attendees_event_id_created_at_idx/i);
  assert.match(sql, /on public\.attendees \(event_id, created_at desc\)\s+where event_id is not null/i);
});
