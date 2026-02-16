import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('root AGENTS.md exists for harness checks', () => {
  assert.equal(fs.existsSync(path.join(repoRoot, 'AGENTS.md')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'docs/harness/README.md')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'docs/harness/plan-template.md')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'docs/harness/pr-contract.md')), true);
});

test('bootstrap beta script exists and package script is wired', () => {
  assert.equal(fs.existsSync(path.join(repoRoot, 'scripts/bootstrap-beta.mjs')), true);

  const pkg = JSON.parse(read('package.json'));
  assert.equal(typeof pkg.scripts?.['bootstrap:beta'], 'string');

  const bootstrap = read('scripts/bootstrap-beta.mjs');
  assert.match(bootstrap, /attendee_identities/);
  assert.match(bootstrap, /auth_magic_links/);
  assert.match(bootstrap, /attendee_sessions/);
  assert.match(bootstrap, /admin_users/);
});
