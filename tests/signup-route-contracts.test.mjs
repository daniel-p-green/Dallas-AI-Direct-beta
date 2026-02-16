import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('signup malformed payload contract is deterministic 400', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /Invalid request body\./);
  assert.match(route, /Name and email are required\./);
  assert.match(route, /if \(!parsed\.ok\)/);
  assert.match(route, /return NextResponse\.json\(\{ error: parsed\.message \}, \{ status: 400 \}\)/);
});

test('signup out-of-range comfort contract is deterministic 400', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /AI comfort level must be between 1 and 5\./);
  assert.match(route, /if \(!Number\.isFinite\(comfort\) \|\| comfort < 1 \|\| comfort > 5\)/);
});

test('signup invalid linkedin scheme contract is deterministic 400', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /LinkedIn URL must use http or https\./);
  assert.match(route, /if \(parsed\.protocol !== 'http:' && parsed\.protocol !== 'https:'\)/);
  assert.match(route, /if \(!normalizedLinkedinUrl\.ok\)/);
});

test('signup duplicate email conflict contract remains deterministic 409', () => {
  const route = read('app/api/attendees/signup/route.ts');

  assert.match(route, /\(error as \{ code\?: string \}\)\.code === '23505'/);
  assert.match(route, /This email has already been used for signup\./);
  assert.match(route, /return NextResponse\.json\(\{ error: 'This email has already been used for signup\.' \}, \{ status: 409 \}\)/);
});
