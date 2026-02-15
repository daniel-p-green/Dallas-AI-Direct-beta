import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('plan artifact exists with ordered invite + match scope', () => {
  const planPath = path.join(repoRoot, 'plans/2026-02-15-invite-match-engine.md');
  assert.ok(fs.existsSync(planPath), 'expected invite+match plan file to exist');

  const plan = fs.readFileSync(planPath, 'utf8');
  assert.match(plan, /Ordered user-story outline/i);
  assert.match(plan, /Deterministic scoring service/i);
  assert.match(plan, /Backend generation API/i);
  assert.match(plan, /Backend decision API/i);
  assert.match(plan, /Docs updates/i);
});

test('PRD documents deterministic matching, facilitator workflow, and auditability', () => {
  const prd = read('docs/PRD.md');

  assert.match(prd, /Deterministic scoring uses stable weights and tie-breaks/i);
  assert.match(prd, /Facilitator workflow supports queue review, approve\/reject actions/i);
  assert.match(prd, /immutable, auditable trail/i);
  assert.match(prd, /must never expose private fields, including attendee email/i);
});

test('use-cases and user-stories capture facilitator queue and decisions', () => {
  const useCases = read('docs/use-cases.md');
  const userStories = read('docs/user-stories.md');

  assert.match(useCases, /Facilitator queue review/i);
  assert.match(useCases, /Facilitator decision action/i);
  assert.match(userStories, /generate deterministic top-N intro suggestions/i);
  assert.match(userStories, /approve or reject each suggestion/i);
});

test('runtime validation includes reproducibility and decision audit checks', () => {
  const runtimeValidation = read('docs/runtime-validation.md');

  assert.match(runtimeValidation, /Re-run generation and verify ordered scores\/results are identical/i);
  assert.match(runtimeValidation, /Verify each decision creates exactly one immutable audit event/i);
  assert.match(runtimeValidation, /Deterministic match replay returns identical ordered suggestion IDs and score values/i);
});
