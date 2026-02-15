import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

test('remotion demo scaffold files exist under demo/remotion', () => {
  const requiredPaths = [
    'demo/remotion/README.md',
    'demo/remotion/package.json',
    'demo/remotion/remotion.config.js',
    'demo/remotion/src/index.js',
    'demo/remotion/src/Root.jsx',
    'demo/remotion/src/compositions/DallasAIDirectFlow.jsx',
    'demo/remotion/assets/.gitkeep',
  ];

  for (const relativePath of requiredPaths) {
    const absolutePath = path.join(repoRoot, relativePath);
    assert.equal(fs.existsSync(absolutePath), true, `missing scaffold file: ${relativePath}`);
  }
});

test('root package scripts expose reproducible remotion commands', () => {
  const packageJson = readJson(path.join(repoRoot, 'package.json'));

  assert.equal(packageJson.scripts['demo:remotion:install'], 'npm --prefix demo/remotion install');
  assert.equal(
    packageJson.scripts['demo:remotion:preview'],
    'npm run demo:remotion:install && npm --prefix demo/remotion run preview',
  );
  assert.equal(
    packageJson.scripts['demo:remotion:render'],
    'npm run demo:remotion:install && npm --prefix demo/remotion run render',
  );
  assert.equal(
    packageJson.scripts['demo:remotion:still'],
    'npm run demo:remotion:install && npm --prefix demo/remotion run still',
  );
});

test('demo/remotion README documents plan ownership and usage', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'demo/remotion/README.md'), 'utf8');

  assert.match(readme, /plans\/2026-02-15-remotion-readme-demo\.md/);
  assert.match(readme, /npm run demo:remotion:install/);
  assert.match(readme, /npm run demo:remotion:render/);
  assert.match(readme, /Keep demo rendering code isolated from the Next\.js app root\./);
});
