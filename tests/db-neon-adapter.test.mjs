import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('db server uses Neon serverless pool and websocket constructor', () => {
  const source = read('lib/db/server.ts');

  assert.match(source, /@neondatabase\/serverless/);
  assert.match(source, /import ws from "ws"/);
  assert.match(source, /new Pool\(/);
  assert.match(source, /neonConfig\.webSocketConstructor/);
  assert.doesNotMatch(source, /from ['"]postgres['"]/);
});

test('db server exposes transaction wrapper for atomic route workflows', () => {
  const source = read('lib/db/server.ts');

  assert.match(source, /withTransaction<T>\(callback:/);
  assert.match(source, /await client\.query\("BEGIN"\)/);
  assert.match(source, /await client\.query\("COMMIT"\)/);
  assert.match(source, /await client\.query\("ROLLBACK"\)/);
});

test('event session service uses db transaction helper for active-session toggles', () => {
  const source = read('lib/event-session.ts');

  assert.match(source, /await db\.withTransaction\(async \(tx\)/);
  assert.match(source, /update public\.events set is_active = false where is_active = true/);
  assert.match(source, /set is_active = true/);
});
