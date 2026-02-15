import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const reportPath = path.join(process.cwd(), 'docs/us-009-event-session-validation-report.md');

test('event-session US-009 validation report exists', () => {
  assert.equal(fs.existsSync(reportPath), true, 'expected report file to exist');
});

test('event-session US-009 validation report captures required gate commands', () => {
  const report = fs.readFileSync(reportPath, 'utf8');

  const requiredCommands = [
    'npm run typecheck',
    'npm test',
    'npm run build',
    'node --test tests/event-session-runtime.test.mjs tests/event-session-selection-service.test.mjs tests/event-session-legacy-migration.test.mjs tests/room-board-event-scope.test.mjs',
  ];

  for (const command of requiredCommands) {
    assert.match(report, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(report, /active-session selection/i);
  assert.match(report, /legacy compatibility/i);
  assert.match(report, /Status: PASS/g);
});
