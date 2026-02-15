import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const reportPath = path.join(repoRoot, 'docs/us-005-remotion-quality-report.md');

test('US-005 remotion quality report documents quality-pass checklist coverage', () => {
  const report = fs.readFileSync(reportPath, 'utf8');

  assert.match(report, /## Quality-Pass Loop/i);
  assert.match(report, /visual clarity/i);
  assert.match(report, /typography/i);
  assert.match(report, /pacing/i);
  assert.match(report, /privacy messaging/i);
  assert.match(report, /Pass 1/i);
  assert.match(report, /Pass 2/i);
  assert.match(report, /Approved/i);
});

test('US-005 remotion quality report includes PR contract sections and command evidence', () => {
  const report = fs.readFileSync(reportPath, 'utf8');

  assert.match(report, /### Intent/i);
  assert.match(report, /### Risk/i);
  assert.match(report, /### Verification Evidence/i);
  assert.match(report, /### Rollback/i);
  assert.match(report, /### Docs Impact/i);

  assert.match(report, /npm run typecheck/);
  assert.match(report, /npm test/);
  assert.match(report, /npm run build/);
  assert.match(report, /npm run demo:remotion:generate/);
  assert.match(report, /Exit code: 0/);
});
