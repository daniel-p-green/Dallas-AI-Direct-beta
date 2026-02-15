import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('event-session service auto-resolves a default active session when none is configured', () => {
  const service = read('lib/event-session.ts');

  assert.match(service, /DEFAULT_EVENT_SESSION_SLUG = 'legacy-default-session'/);
  assert.match(service, /ensureDefaultEventSession/);
  assert.match(service, /insert into public\.events \(slug, name, is_active, metadata\)/);
  assert.match(service, /'runtime_fallback'/);
  assert.match(service, /const defaultEvent = await ensureDefaultEventSession\(db, defaultSlug\)/);
  assert.match(service, /const activatedDefault = await setActiveEventSessionById\(db, defaultEvent\.id\)/);
});

test('active-session update helper enforces single-active invariant before enabling target session', () => {
  const service = read('lib/event-session.ts');

  assert.match(service, /async function setActiveEventSessionById/);
  assert.match(service, /update public\.events set is_active = false where is_active = true/);
  assert.match(service, /set is_active = true,/);
  assert.match(service, /updated_at = now\(\)/);
  assert.match(service, /eventId or slug is required to set active session/);
});

test('signup and room endpoints consume shared resolver helpers for fallback-safe behavior', () => {
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
