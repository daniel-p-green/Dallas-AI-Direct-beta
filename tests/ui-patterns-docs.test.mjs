import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const uiPatternsPath = path.join(repoRoot, 'docs/ui-patterns.md');

function readUiPatterns() {
  return fs.readFileSync(uiPatternsPath, 'utf8');
}

test('ui-patterns doc includes all required demo pattern sections', () => {
  const content = readUiPatterns();

  assert.match(content, /^## Hero Banner/m);
  assert.match(content, /^## QR Signup Card/m);
  assert.match(content, /^## Public Room Board/m);
  assert.match(content, /^## Privacy Notice Row/m);
});

test('each pattern includes required content and privacy-first constraints', () => {
  const content = readUiPatterns();

  assert.match(content, /Hero Banner[\s\S]*### Required Content[\s\S]*Dallas AI logo lockup[\s\S]*### Do \/ Don't[\s\S]*Don't include attendee email/i);
  assert.match(content, /QR Signup Card[\s\S]*### Required Content[\s\S]*### Do \/ Don't[\s\S]*Don't render submitted email/i);
  assert.match(content, /Public Room Board[\s\S]*### Required Content[\s\S]*Dallas AI logo lockup[\s\S]*### Do \/ Don't[\s\S]*Don't include private identifiers, including email/i);
  assert.match(content, /Privacy Notice Row[\s\S]*### Required Content[\s\S]*Email stays private and is never displayed publicly on the room board\./i);
  assert.match(content, /Public Room Board[\s\S]*### Layout and Visual Spec[\s\S]*Card behavior \| Default `--shadow-card-sm`, hover `--shadow-card-hover`/i);
});

test('doc maintains enterprise active-voice guardrails with no endorsement claims', () => {
  const content = readUiPatterns();

  assert.doesNotMatch(content, /officially endorsed by vercel/i);
  assert.match(content, /does not claim official endorsement by Vercel or Geist\./i);
});
