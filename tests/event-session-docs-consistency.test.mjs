import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('event-session plan artifact exists and tracks documentation scope', () => {
  const planPath = path.join(repoRoot, 'plans/2026-02-15-event-session-mode.md');
  assert.ok(fs.existsSync(planPath), 'expected event-session plan file to exist');

  const plan = fs.readFileSync(planPath, 'utf8');
  assert.match(plan, /active session selection/i);
  assert.match(plan, /check-in windows/i);
  assert.match(plan, /US-008: Docs updates/i);
});

test('PRD includes active-session selection and check-in window requirements', () => {
  const prd = read('docs/PRD.md');

  assert.match(prd, /switch the active event session/i);
  assert.match(prd, /enforces event check-in windows/i);
  assert.match(prd, /room-board filtering/i);
});

test('use-cases and user-stories include event-scoped organizer + attendee behavior', () => {
  const useCases = read('docs/use-cases.md');
  const userStories = read('docs/user-stories.md');

  assert.match(useCases, /Active event-session management/i);
  assert.match(useCases, /Event-scoped check-in/i);
  assert.match(userStories, /create sessions and select the active event/i);
  assert.match(userStories, /check in during the active event window/i);
});

test('runtime validation and migration docs cover switching and compatibility backfill', () => {
  const runtimeValidation = read('docs/runtime-validation.md');
  const migrationDoc = read('docs/event-session-migration.md');

  assert.match(runtimeValidation, /Switch the active session to a different event/i);
  assert.match(runtimeValidation, /CHECK_IN_WINDOW_CLOSED/i);
  assert.match(runtimeValidation, /selected active event only/i);

  assert.match(migrationDoc, /Deployment runbook/i);
  assert.match(migrationDoc, /legacy-default-session/i);
  assert.match(migrationDoc, /non-null `event_id`/i);
});
