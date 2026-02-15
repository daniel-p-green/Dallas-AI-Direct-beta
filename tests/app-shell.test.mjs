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

  assert.match(layout, /NEXT_PUBLIC_SHOW_ENV_BANNER === "true"/);
  assert.match(layout, /BETA DEMO/);
  assert.match(layout, /ENV: STAGE/);
  assert.match(layout, /PUBLIC VIEW SAFE/);
});

test('shared layout uses shared header/footer components', () => {
  const layout = read('app/layout.tsx');

  assert.match(layout, /<SharedHeader \/>/);
  assert.match(layout, /<SharedFooter \/>/);
  assert.match(layout, /Connecting 10,000\+ minds building the future of AI in Dallas\./);
});

test('shared header includes Dallas AI brand logo asset', () => {
  const header = read('components/shared-header.tsx');

  assert.match(header, /\/brand\/dallas-ai-logo-white\.png/);
  assert.match(header, /Dallas AI Direct/);
});

test('Dallas AI logo assets exist in public brand directory', () => {
  assert.equal(fs.existsSync(path.join(repoRoot, 'public/brand/dallas-ai-logo-color.png')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'public/brand/dallas-ai-logo-white.png')), true);
});

test('shared footer renders required privacy text', () => {
  const footer = read('components/shared-footer.tsx');

  assert.match(footer, /Email never displayed/);
});
