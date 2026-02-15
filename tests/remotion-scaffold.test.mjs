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

test('demo/remotion workspace includes remotion CLI dependency and v4 config import', () => {
  const workspacePackageJson = readJson(path.join(repoRoot, 'demo/remotion/package.json'));
  const remotionConfig = fs.readFileSync(path.join(repoRoot, 'demo/remotion/remotion.config.js'), 'utf8');

  assert.equal(workspacePackageJson.devDependencies['@remotion/cli'], '^4.0.422');
  assert.match(remotionConfig, /@remotion\/cli\/config/);
});

test('demo/remotion README documents plan ownership and usage', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'demo/remotion/README.md'), 'utf8');

  assert.match(readme, /plans\/2026-02-15-remotion-readme-demo\.md/);
  assert.match(readme, /npm run demo:remotion:install/);
  assert.match(readme, /npm run demo:remotion:render/);
  assert.match(readme, /public\/demo\/dallas-ai-direct-remotion-demo\.mp4/);
  assert.match(readme, /Keep demo rendering code isolated from the Next\.js app root\./);
});

test('README links the remotion demo asset with privacy-safe caption text', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');

  assert.match(readme, /## README Demo \(Remotion\)/);
  assert.match(readme, /public\/demo\/dallas-ai-direct-remotion-demo\.mp4/);
  assert.match(readme, /public\/demo\/dallas-ai-direct-remotion-demo-poster\.png/);
  assert.match(readme, /no email exposure/i);
  assert.match(readme, /npm run demo:remotion:render/);
});

test('rendered README-friendly remotion artifacts exist', () => {
  const artifactPaths = [
    'public/demo/dallas-ai-direct-remotion-demo.mp4',
    'public/demo/dallas-ai-direct-remotion-demo-poster.png',
  ];

  for (const relativePath of artifactPaths) {
    const absolutePath = path.join(repoRoot, relativePath);
    assert.equal(fs.existsSync(absolutePath), true, `missing demo artifact: ${relativePath}`);
    const stats = fs.statSync(absolutePath);
    assert.ok(stats.size > 0, `demo artifact is empty: ${relativePath}`);
  }
});
