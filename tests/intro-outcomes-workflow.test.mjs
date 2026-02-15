import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('intro outcome migration adds fields and event table', () => {
  const migrationPath = path.join(
    repoRoot,
    'db/migrations/202602152110_attendee_auth_and_intro_outcomes.sql'
  );

  assert.equal(fs.existsSync(migrationPath), true);
  const migration = read('db/migrations/202602152110_attendee_auth_and_intro_outcomes.sql');

  assert.match(migration, /add column if not exists intro_outcome text/);
  assert.match(migration, /add column if not exists intro_outcome_at/);
  assert.match(migration, /add column if not exists intro_outcome_by/);
  assert.match(migration, /create table if not exists public\.match_intro_outcome_events/);
});

test('decision endpoint supports intro outcome actions and writes outcome events', () => {
  const route = read('app/api/matches/[suggestionId]/decision/route.ts');

  assert.match(route, /action !== 'approve' && action !== 'reject' && action !== 'delivered' && action !== 'not_delivered'/);
  assert.match(route, /Intro outcomes can only be recorded after approval\./);
  assert.match(route, /insert into match_intro_outcome_events/);
  assert.match(route, /intro_outcome/);
  assert.match(route, /outcome_event/);
});

test('admin page includes intro outcome actions and conversion metrics', () => {
  const admin = read('app/admin/page.tsx');

  assert.match(admin, /approvedCount/);
  assert.match(admin, /introConversionPct/);
  assert.match(admin, /Mark delivered/);
  assert.match(admin, /Mark not delivered/);
  assert.match(admin, /You should meet outcomes/);
});
