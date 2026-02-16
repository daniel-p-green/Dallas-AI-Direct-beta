import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('clerk middleware and attendee auth helper files exist', () => {
  assert.equal(fs.existsSync(path.join(repoRoot, 'middleware.ts')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'lib/attendee-auth.ts')), true);

  const middleware = read('middleware.ts');
  assert.match(middleware, /clerkMiddleware/);
  assert.match(middleware, /matcher/);

  const helper = read('lib/attendee-auth.ts');
  assert.match(helper, /isAttendeeAuthRequired/);
  assert.match(helper, /isAttendeeAuthEnabled/);
  assert.match(helper, /requireAttendeeOrAdminApiAccess/);
});

test('attendee auth API routes exist with required contracts', () => {
  const required = [
    'app/api/auth/attendee/request-link/route.ts',
    'app/api/auth/attendee/verify-link/route.ts',
    'app/api/auth/attendee/session/route.ts',
    'app/api/auth/attendee/logout/route.ts',
  ];

  for (const file of required) {
    assert.equal(fs.existsSync(path.join(repoRoot, file)), true, `Expected ${file} to exist`);
  }

  const requestLinkRoute = read('app/api/auth/attendee/request-link/route.ts');
  assert.match(requestLinkRoute, /Too many attempts/);
  assert.match(requestLinkRoute, /auth_magic_links/);
  assert.match(requestLinkRoute, /sign_in_url/);

  const verifyRoute = read('app/api/auth/attendee/verify-link/route.ts');
  assert.match(verifyRoute, /attendee_identities/);
  assert.match(verifyRoute, /attendee_sessions/);
  assert.match(verifyRoute, /NextResponse\.redirect/);

  const logoutRoute = read('app/api/auth/attendee/logout/route.ts');
  assert.match(logoutRoute, /revokeSession/);
  assert.match(logoutRoute, /attendee_auth_session/);
});

test('signup and room pages gate access when attendee auth is enabled', () => {
  const signupPage = read('app/signup/page.tsx');
  const roomPage = read('app/room/page.tsx');

  assert.match(signupPage, /isAttendeeAuthEnabled/);
  assert.match(signupPage, /redirect\('\/sign-in\?redirect_url=\/signup'\)/);
  assert.match(roomPage, /isAttendeeAuthEnabled/);
  assert.match(roomPage, /redirect\('\/sign-in\?redirect_url=\/room'\)/);
});
