import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const scriptPath = path.join(repoRoot, 'tests', 'validate-scope-lock.sh');

function initTempRepo() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scope-lock-'));
  execSync('git init', { cwd: tmp, stdio: 'ignore' });
  execSync('git config user.email "scope-lock@example.com"', { cwd: tmp });
  execSync('git config user.name "Scope Lock Test"', { cwd: tmp });

  fs.mkdirSync(path.join(tmp, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'tests'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'README.md'), '# temp\n', 'utf8');
  fs.writeFileSync(path.join(tmp, 'docs', 'baseline.md'), 'baseline\n', 'utf8');

  execSync('git add .', { cwd: tmp, stdio: 'ignore' });
  execSync('git commit -m "baseline"', { cwd: tmp, stdio: 'ignore' });
  return tmp;
}

function runScopeLock(cwd) {
  return spawnSync('bash', [scriptPath], { cwd, encoding: 'utf8' });
}

test('scope-lock exits zero when only allowed paths are changed', () => {
  const tmp = initTempRepo();
  fs.writeFileSync(path.join(tmp, 'docs', 'allowed-change.md'), 'ok\n', 'utf8');

  const result = runScopeLock(tmp);
  assert.equal(result.status, 0, result.stdout || result.stderr);
  assert.match(result.stdout, /PASS: only allowed paths are changed/);
});

test('scope-lock exits non-zero when forbidden paths are changed', () => {
  const tmp = initTempRepo();
  fs.mkdirSync(path.join(tmp, 'src'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'src', 'forbidden.ts'), 'export {}\n', 'utf8');

  const result = runScopeLock(tmp);
  assert.notEqual(result.status, 0, 'expected scope-lock script to fail for forbidden files');
  assert.match(result.stdout, /FAIL: scope-lock violation/);
  assert.match(result.stdout, /src\/forbidden\.ts/);
});
