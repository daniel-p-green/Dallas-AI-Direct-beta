import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('event-session service resolves explicit active session first and falls back to default slug', () => {
  const service = read('lib/event-session.ts');

  assert.match(service, /DEFAULT_EVENT_SESSION_SLUG = 'legacy-default-session'/);
  assert.match(service, /findExplicitActiveEventSession/);
  assert.match(service, /resolveActiveEventSession/);
  assert.match(service, /return findDefaultEventSession\(db, options\.defaultSlug \?\? DEFAULT_EVENT_SESSION_SLUG\)/);
  assert.match(service, /where slug = \$\{defaultSlug\}/);
});

test('active-session update helper enforces single-active invariant before enabling target session', () => {
  const service = read('lib/event-session.ts');

  assert.match(service, /export async function setActiveEventSession/);
  assert.match(service, /update public\.events set is_active = false where is_active = true/);
  assert.match(service, /set is_active = true/);
  assert.match(service, /updated_at = now\(\)/);
  assert.match(service, /eventId or slug is required to set active session/);
});

test('signup and room endpoints consume shared resolver helpers', () => {
  const signupRoute = read('app/api/attendees/signup/route.ts');
  const publicRoute = read('app/api/attendees/public/route.ts');

  assert.match(signupRoute, /resolveActiveEventSession\(db\)/);
  assert.match(publicRoute, /resolveEventSessionForRequest\(db, eventSlug\)/);
});

test('events endpoint uses shared active-session helpers instead of duplicate activation logic', () => {
  const eventsRoute = read('app/api/events/route.ts');

  assert.match(eventsRoute, /resolveActiveEventSession/);
  assert.match(eventsRoute, /setActiveEventSession\(db/);
});
