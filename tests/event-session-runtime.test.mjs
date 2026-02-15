import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('organizer event API supports create and active-session selection', () => {
  const route = read('app/api/events/route.ts');

  assert.match(route, /if \(body\.action === 'create'\)/);
  assert.match(route, /if \(body\.action === 'activate'\)/);
  assert.match(route, /update public\.events set is_active = false where is_active = true/);
  assert.match(route, /insert into public\.events/);
  assert.match(route, /set is_active = true/);
});

test('signup API binds new attendees to the active event session', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /getActiveEventSession\(db\)/);
  assert.match(route, /event_id/);
  assert.match(route, /\$\{activeEvent\?\.id \?\? null\}/);
});

test('public room API scopes attendee feed by selected or active event and returns aggregates', () => {
  const route = read('app/api/attendees/public/route.ts');

  assert.match(route, /const eventSlug = url\.searchParams\.get\('event'\)/);
  assert.match(route, /where event_id = \$\{activeEvent\.id\}/);
  assert.match(route, /or event_id is null/);
  assert.match(route, /where event_id is null/);
  assert.match(route, /aggregates:/);
  assert.match(route, /highComfortPct/);
});

test('room UI renders active session context and server-provided scoped aggregates', () => {
  const page = read('app/room/page.tsx');

  assert.match(page, /Session: \$\{activeEvent\.name\}/);
  assert.match(page, /setAggregates\(/);
  assert.match(page, /aggregates\.attendeeCount/);
  assert.match(page, /aggregates\.highComfortPct/);
});
