import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const readmePath = path.join(repoRoot, 'README.md');

function extractDemoSection(readme) {
  const start = readme.indexOf('## README Demo (Remotion)');
  assert.ok(start >= 0, 'README demo section heading is missing');

  const end = readme.indexOf('\n---', start);
  const section = end >= 0 ? readme.slice(start, end) : readme.slice(start);
  return section;
}

test('README demo section includes required privacy-safe caption copy', () => {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const section = extractDemoSection(readme);

  assert.match(section, /QR signup/i);
  assert.match(section, /room board update/i);
  assert.match(section, /privacy-safe public view/i);
  assert.match(section, /email is never shown publicly/i);
});

test('README demo section uses repo-relative demo media paths that exist', () => {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const section = extractDemoSection(readme);

  const markdownImageLink = /\[!\[[^\]]+\]\(([^)]+)\)\]\(([^)]+)\)/m;
  const match = section.match(markdownImageLink);
  assert.ok(match, 'README demo section must include poster image linking to demo video');

  const [, posterPath, videoPath] = match;
  assert.equal(posterPath.startsWith('public/'), true, 'poster path must be repo-relative under public/');
  assert.equal(videoPath.startsWith('public/'), true, 'video path must be repo-relative under public/');

  const posterAbsolute = path.join(repoRoot, posterPath);
  const videoAbsolute = path.join(repoRoot, videoPath);

  assert.equal(fs.existsSync(posterAbsolute), true, `missing README poster asset: ${posterPath}`);
  assert.equal(fs.existsSync(videoAbsolute), true, `missing README video asset: ${videoPath}`);

  assert.ok(fs.statSync(posterAbsolute).size > 0, 'poster asset is empty');
  assert.ok(fs.statSync(videoAbsolute).size > 0, 'video asset is empty');
});

test('README demo section documents reproducible render commands', () => {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const section = extractDemoSection(readme);

  assert.match(section, /npm run demo:remotion:generate/);
  assert.match(section, /npm run demo:remotion:render/);
  assert.match(section, /npm run demo:remotion:still/);
  assert.match(section, /npm run demo:remotion:check/);
});
