import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const migrationPath = path.join(repoRoot, 'db/migrations/202602151125_event_session_legacy_backfill.sql');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('legacy compatibility migration exists', () => {
  assert.equal(fs.existsSync(migrationPath), true);
});

test('migration creates/uses deterministic default event and backfills legacy attendees', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8');

  assert.match(sql, /legacy-default-session/);
  assert.match(sql, /insert into public\.events/i);
  assert.match(sql, /on conflict \(slug\) do update/i);
  assert.match(sql, /update public\.attendees\s+set event_id = default_event_id\s+where event_id is null/i);
});

test('migration is idempotent and rollout-safe for reruns', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8');

  assert.match(sql, /information_schema\.tables/);
  assert.match(sql, /information_schema\.columns/);
  assert.match(sql, /if not exists \(select 1 from public\.events where is_active = true\)/i);
  assert.match(sql, /where event_id is null/i);
});

test('room-board reads preserve legacy attendee visibility during rollout', () => {
  const route = read('app/api/attendees/public/route.ts');

  assert.match(route, /where event_id = \$\{activeEvent\.id\}\s+or event_id is null/);
});
