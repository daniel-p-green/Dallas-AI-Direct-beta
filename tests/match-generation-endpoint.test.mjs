import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routePath = new URL('../app/api/matches/generate/route.ts', import.meta.url);
const routeSource = readFileSync(routePath, 'utf8');

test('match generation endpoint persists run and attendee matches transactionally', () => {
  assert.match(routeSource, /await db\.withTransaction\(async \(tx\)/);
  assert.match(routeSource, /insert into match_runs/i);
  assert.match(routeSource, /insert into attendee_matches/i);
  assert.match(routeSource, /return NextResponse\.json\(responsePayload\)/);
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
  assert.match(routeSource, /safeMatches\.push\(\{[\s\S]*matched_attendee:[\s\S]*score_breakdown:/);
  assert.doesNotMatch(routeSource, /matched_attendee:\s*\{[^}]*email/s);
  assert.doesNotMatch(routeSource, /\bemail\b/);
});

test('match generation endpoint uses explicit attendee projection and rejects over-broad selects', () => {
  assert.match(routeSource, /select[\s\S]*id,[\s\S]*name,[\s\S]*title,[\s\S]*company,[\s\S]*display_title_company,[\s\S]*ai_comfort_level,[\s\S]*help_needed,[\s\S]*help_offered,[\s\S]*created_at[\s\S]*from attendees/i);
  assert.doesNotMatch(routeSource, /select\s+\*\s+from\s+attendees/i);
  assert.doesNotMatch(routeSource, /\battendees\.[a-z_]*email\b/i);
});
