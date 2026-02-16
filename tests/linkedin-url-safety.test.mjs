import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('signup API normalizes linkedin URLs and rejects non-http(s) schemes', () => {
  const source = read('app/api/attendees/signup/route.ts');

  assert.match(source, /function normalizeSafeLinkedinUrl\(/);
  assert.match(source, /new URL\(normalized\)/);
  assert.match(source, /parsed\.protocol !== 'http:' && parsed\.protocol !== 'https:'/);
  assert.match(source, /LinkedIn URL must use http or https\./);
});

test('attendee card only links safe linkedin URLs', () => {
  const source = read('components/attendee-card.tsx');

  assert.match(source, /export function getSafeHttpUrl\(/);
  assert.match(source, /parsed\.protocol === "http:" \|\| parsed\.protocol === "https:"/);
  assert.match(source, /const safeLinkedinUrl = getSafeHttpUrl\(attendee\.linkedin_url\)/);
  assert.match(source, /href=\{safeLinkedinUrl\}/);
  assert.match(source, /aria-label="LinkedIn profile unavailable"/);
});
