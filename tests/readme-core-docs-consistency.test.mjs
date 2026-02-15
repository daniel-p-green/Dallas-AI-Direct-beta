import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('README includes required closing sentence exactly', () => {
  const readme = read('README.md');
  assert.match(
    readme,
    /We build this pattern inside organizations around revenue constraints\./
  );
});

test('PLAN, PRD, and security docs stay aligned on privacy boundary and alpha posture', () => {
  const plan = read('docs/PLAN.md');
  const prd = read('docs/PRD.md');
  const security = read('docs/security.md');

  // Public data boundary: email is never public.
  assert.match(plan, /never shows `email`/i);
  assert.match(prd, /Email never appears in public output\./i);
  assert.match(security, /excludes `email`/i);

  // RLS boundary remains the primary control.
  assert.match(plan, /RLS and a\s+public-safe view/i);
  assert.match(prd, /Security-first backend controls with RLS\./i);
  assert.match(security, /Postgres RLS enforces data access in the database\./i);

  // Consent posture for optional title/company is explicit.
  assert.match(plan, /title`, `company` \(displayed only with explicit consent\)/i);
  assert.match(prd, /requires explicit attendee consent before displaying optional `title` or `company`/i);
  assert.match(security, /shown publicly only with explicit attendee consent/i);

  // Alpha auth posture is convenience-only, not trust boundary.
  assert.match(plan, /Alpha gate \| Optional password gate \| Convenience only, not primary security/i);
  assert.match(security, /alpha access controls as convenience, not trust boundary\./i);
});

test('core docs include consistent Skills used footer', () => {
  for (const docPath of ['docs/PLAN.md', 'docs/PRD.md', 'docs/security.md']) {
    const content = read(docPath);
    assert.match(content, /^## Skills used$/m, `${docPath} missing Skills used footer`);
    assert.match(content, /antfarm-workflows\/SKILL\.md/i, `${docPath} footer missing skill reference`);
  }
});
