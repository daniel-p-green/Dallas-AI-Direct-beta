import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('you-should-meet endpoint exists and scopes suggestions by active event', () => {
  const routePath = path.join(repoRoot, 'app/api/matches/you-should-meet/route.ts');
  assert.equal(fs.existsSync(routePath), true, 'Expected you-should-meet endpoint file to exist');

  const route = read('app/api/matches/you-should-meet/route.ts');
  assert.match(route, /resolveEventSessionForRequest\(db, eventSlug\)/);
  assert.match(route, /source\.event_id = \$\{activeEvent\.id\}::uuid/);
  assert.match(route, /matched\.event_id = \$\{activeEvent\.id\}::uuid/);
  assert.match(route, /source\.event_id is null/);
  assert.match(route, /matched\.event_id is null/);
});

test('you-should-meet endpoint keeps projection privacy-safe', () => {
  const route = read('app/api/matches/you-should-meet/route.ts');

  assert.match(route, /status in \('approved', 'suggested'\)/);
  assert.doesNotMatch(route, /\bemail\b/i);
  assert.match(route, /toSafeProfile/);
  assert.match(route, /buildWhy/);
});

test('room board requests the you-should-meet endpoint for introductions', () => {
  const room = read('components/room-board.tsx');

  assert.match(room, /\/api\/matches\/you-should-meet\?/);
  assert.match(room, /You Should Meet\.\.\./);
  assert.match(room, /meetSuggestions/);
});
