import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('App Router route files exist for required paths', () => {
  const required = [
    'app/page.tsx',
    'app/signup/page.tsx',
    'app/room/page.tsx',
    'app/admin/page.tsx',
    'app/layout.tsx'
  ];

  for (const file of required) {
    assert.equal(fs.existsSync(path.join(repoRoot, file)), true, `Expected ${file} to exist`);
  }
});

test('shared layout renders environment banner text', () => {
  const layout = read('app/layout.tsx');

  assert.match(layout, /ALPHA DEMO/);
  assert.match(layout, /ENV: STAGE/);
  assert.match(layout, /PUBLIC VIEW SAFE/);
});

test('shared header renders title and subtitle', () => {
  const layout = read('app/layout.tsx');

  assert.match(layout, /Dallas AI Direct Alpha/);
  assert.match(layout, /Fast, private attendee signal for in-room demo moments\./);
});

test('shared header includes Dallas AI brand logo asset', () => {
  const layout = read('app/layout.tsx');

  assert.match(layout, /\/brand\/dallas-ai-logo-color\.png/);
  assert.match(layout, /alt="Dallas AI"/);
});

test('Dallas AI logo assets exist in public brand directory', () => {
  assert.equal(fs.existsSync(path.join(repoRoot, 'public/brand/dallas-ai-logo-color.png')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'public/brand/dallas-ai-logo-white.png')), true);
});

test('shared footer renders required privacy text', () => {
  const layout = read('app/layout.tsx');

  assert.match(layout, /Email stays private and is never displayed publicly on the room board\./);
});
