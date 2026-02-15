import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('storyboard composition encodes required narrative beats in order', () => {
  const source = read('demo/remotion/src/compositions/DallasAIDirectFlow.jsx');

  assert.match(source, /label:\s*'QR signup'/);
  assert.match(source, /label:\s*'Room board update'/);
  assert.match(source, /label:\s*'Privacy-safe public view'/);
  assert.match(source, /STORYBOARD_SCENES\.map\(\(scene\) => scene\.label\)\.join\(' → '\)/);
});

test('privacy messaging explicitly states no public email exposure', () => {
  const source = read('demo/remotion/src/compositions/DallasAIDirectFlow.jsx');

  assert.match(source, /attendee email is never shown publicly/i);
  assert.match(source, /no public email exposure/i);
});

test('composition defaults are lightweight and documented for README usage', () => {
  const rootSource = read('demo/remotion/src/Root.jsx');
  const readme = read('demo/remotion/README.md');

  assert.match(rootSource, /durationInFrames:\s*216/);
  assert.match(rootSource, /fps:\s*24/);
  assert.match(rootSource, /width:\s*960/);
  assert.match(rootSource, /height:\s*540/);

  assert.match(readme, /Duration:\s*`216`/);
  assert.match(readme, /FPS:\s*`24`/);
  assert.match(readme, /Dimensions:\s*`960x540`/);
});
