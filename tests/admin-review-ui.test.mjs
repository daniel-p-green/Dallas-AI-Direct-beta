import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('admin page loads facilitator queue and renders review labels', () => {
  const source = read('app/admin/page.tsx');

  assert.match(source, /fetch\('\/api\/matches\/facilitator-queue\?status=suggested&page=1&pageSize=50'/);
  assert.match(source, /Facilitator review queue/);
  assert.match(source, /Pending suggestions/);
});

test('admin page submits approve and reject decisions without full reload', () => {
  const source = read('app/admin/page.tsx');

  assert.match(source, /fetch\(`\/api\/matches\/\$\{suggestionId\}\/decision`/);
  assert.match(source, /submitDecision\(item\.suggestion_id, 'approve'\)/);
  assert.match(source, /submitDecision\(item\.suggestion_id, 'reject'\)/);
  assert.match(source, /setItems\(\(state\) => state\.filter\(/);
});

test('admin page keeps private fields hidden', () => {
  const source = read('app/admin/page.tsx');

  assert.doesNotMatch(source, /\.email\b/);
  assert.doesNotMatch(source, /item\.attendee\.help_needed|item\.attendee\.help_offered/);
  assert.doesNotMatch(source, /item\.matched_attendee\.help_needed|item\.matched_attendee\.help_offered/);
  assert.match(source, /profileHeadline\(profile/);
  assert.match(source, /Profile private/);
  assert.match(source, /Email is never shown\./);
});
