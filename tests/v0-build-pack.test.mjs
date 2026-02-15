import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('v0-build workspace includes required directories and files', () => {
  const required = [
    'v0-build/README.md',
    'v0-build/app/README.md',
    'v0-build/docs/01-product-requirements.md',
    'v0-build/docs/02-privacy-security-boundary.md',
    'v0-build/docs/03-brand-and-visual-requirements.md',
    'v0-build/docs/04-v0-execution-guardrails.md',
    'v0-build/prompts/INDEX.md',
    'v0-build/prompts/08-neon-connection-wiring.md',
    'v0-build/prompts/09-auth-minimal-alpha-gate.md',
    'v0-build/brand/dallas-ai-logo-color.png',
    'v0-build/brand/dallas-ai-logo-white.png'
  ];

  for (const file of required) {
    assert.equal(exists(file), true, `Expected ${file} to exist`);
  }
});

test('v0-build docs lock privacy and public-read boundary rules', () => {
  const product = read('v0-build/docs/01-product-requirements.md');
  const security = read('v0-build/docs/02-privacy-security-boundary.md');
  const guardrails = read('v0-build/docs/04-v0-execution-guardrails.md');

  assert.match(product, /Public room board reads attendee rows from `attendees_public` only\./i);
  assert.match(product, /Public room board never renders `email`\./i);
  assert.match(security, /Never query base table `attendees` for public room display\./i);
  assert.match(security, /Never render `email` in public UI, logs, toasts, or debug payloads\./i);
  assert.match(guardrails, /Queries public room data from base table `attendees`\./i);
  assert.match(guardrails, /Exposes `email` in public UI or payload\./i);
});

test('v0-build docs require Dallas AI logo usage on key surfaces', () => {
  const brand = read('v0-build/docs/03-brand-and-visual-requirements.md');
  const product = read('v0-build/docs/01-product-requirements.md');
  const promptIndex = read('v0-build/prompts/INDEX.md');

  assert.match(brand, /Shared shell header \| Show Dallas AI color logo on light surfaces/i);
  assert.match(brand, /Hero section \| Show Dallas AI logo above headline or in top lockup/i);
  assert.match(product, /Shared shell and hero surfaces display approved Dallas AI logo assets\./i);
  assert.match(promptIndex, /Do not remove Dallas AI logo from shared shell or hero surfaces\./i);
});
