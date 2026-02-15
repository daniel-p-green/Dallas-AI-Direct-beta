import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('core attendees migration is tracked with attendees_public + RLS + grants', () => {
  const migrationPath = path.join(repoRoot, 'db/migrations/202602150320_core_attendees_schema.sql');
  assert.equal(fs.existsSync(migrationPath), true);

  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert.match(sql, /create table if not exists public\.attendees/i);
  assert.match(sql, /create or replace view public\.attendees_public as/i);
  assert.match(sql, /alter table public\.attendees enable row level security/i);
  assert.match(sql, /alter table public\.attendees force row level security/i);
  assert.match(sql, /create policy attendees_insert_anon/i);
  assert.match(sql, /grant insert on table public\.attendees to anon/i);
  assert.match(sql, /grant select on table public\.attendees_public to anon, authenticated, service_role/i);
});

test('signup API rejects unsafe linkedin schemes', () => {
  const signupRoute = read('app/api/attendees/signup/route.ts');

  assert.match(signupRoute, /new URL\(normalized\)/);
  assert.match(signupRoute, /parsed\.protocol !== 'http:' && parsed\.protocol !== 'https:'/);
  assert.match(signupRoute, /LinkedIn URL must use http or https\./);
});

test('room UI only renders clickable linkedin links for safe http/https urls', () => {
  const roomPage = read('app/room/page.tsx');

  assert.match(roomPage, /function getSafeHttpUrl\(/);
  assert.match(roomPage, /parsed\.protocol === 'http:' \|\| parsed\.protocol === 'https:' \? parsed\.toString\(\) : null/);
  assert.match(roomPage, /\{safeLinkedinUrl \? \(/);
  assert.match(roomPage, /href=\{safeLinkedinUrl\}/);
  assert.match(roomPage, /aria-label="LinkedIn profile unavailable"/);
});
