import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const routeSource = fs.readFileSync(path.join(repoRoot, 'app/api/attendees/public/route.ts'), 'utf8');

test('active event query scopes attendees to selected session only', () => {
  const activeQuery = routeSource.match(/\? await db<PublicAttendeeRow\[\]>`([\s\S]*?)`\s*:\s*await db<PublicAttendeeRow\[\]>`/);

  assert.ok(activeQuery, 'expected active-event SQL query block');
  assert.match(activeQuery[1], /where event_id = \$\{activeEvent\.id\}/);
  assert.doesNotMatch(activeQuery[1], /or event_id is null/);
});

test('room board route keeps public-safe projection with no email fields', () => {
  assert.doesNotMatch(routeSource, /\bemail\b/i);
  assert.doesNotMatch(routeSource, /select\s+\*/i);
});

test('room board aggregates include comfort distribution derived from scoped attendee data', () => {
  assert.match(routeSource, /const attendeeCount = data\.length/);
  assert.match(routeSource, /const averageComfort =/);
  assert.match(routeSource, /const highComfortPct =/);
  assert.match(routeSource, /const comfortDistribution = data\.reduce/);
  assert.match(routeSource, /level1: 0/);
  assert.match(routeSource, /level5: 0/);
});
