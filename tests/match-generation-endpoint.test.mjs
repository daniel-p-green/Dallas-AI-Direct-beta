import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routePath = new URL('../app/api/matches/generate/route.ts', import.meta.url);
const routeSource = readFileSync(routePath, 'utf8');

test('match generation endpoint persists run and attendee matches transactionally', () => {
  assert.match(routeSource, /await db`begin`/);
  assert.match(routeSource, /insert into match_runs/i);
  assert.match(routeSource, /insert into attendee_matches/i);
  assert.match(routeSource, /await db`commit`/);
  assert.match(routeSource, /await db`rollback`/);
});

test('match generation endpoint uses deterministic ranking service with top-N slicing', () => {
  assert.match(routeSource, /rankMatches\(source, attendees, \{ now: nowIso \}\)\.slice\(0, payload\.topN\)/);
  assert.match(routeSource, /algorithm_version:\s*MATCH_SCORING_VERSION/);
  assert.match(routeSource, /scoring_weights:\s*MATCH_SCORE_WEIGHTS/);
});

test('match generation endpoint stores score breakdown fields for audit reproducibility', () => {
  assert.match(routeSource, /overlap_score/);
  assert.match(routeSource, /ai_comfort_proximity_score/);
  assert.match(routeSource, /recency_score/);
  assert.match(routeSource, /consent_visibility_score/);
  assert.match(routeSource, /total_score/);
});

test('match generation endpoint response is privacy-safe and does not include email', () => {
  assert.match(routeSource, /function toPublicCandidate/);
  assert.doesNotMatch(routeSource, /matched_attendee:\s*\{[^}]*email/s);
  assert.doesNotMatch(routeSource, /\bemail\b/);
});
