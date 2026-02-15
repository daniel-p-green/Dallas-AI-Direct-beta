import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routePath = new URL('../app/api/matches/[suggestionId]/decision/route.ts', import.meta.url);
const routeSource = readFileSync(routePath, 'utf8');

test('decision endpoint supports POST and PATCH with strict action validation', () => {
  assert.match(routeSource, /export async function POST\(request: Request, context:/);
  assert.match(routeSource, /export async function PATCH\(request: Request, context:/);
  assert.match(routeSource, /if \(action !== 'approve' && action !== 'reject'\)/);
  assert.match(routeSource, /action must be approve or reject\./);
  assert.match(routeSource, /actor is required\./);
});

test('decision endpoint updates suggestion and inserts one immutable audit event atomically', () => {
  assert.match(routeSource, /await db`begin`/);
  assert.match(routeSource, /select id, run_id, status, reviewed_at, reviewed_by[\s\S]*for update/);
  assert.match(routeSource, /update attendee_matches[\s\S]*status = \$\{nextStatus\}[\s\S]*returning id, run_id, status, reviewed_at, reviewed_by/);
  assert.match(routeSource, /if \(updatedRows\.length !== 1\)/);
  assert.match(routeSource, /insert into match_decision_events/);
  assert.match(routeSource, /if \(eventRows\.length !== 1\)/);
  assert.match(routeSource, /await db`commit`/);
  assert.match(routeSource, /await db`rollback`/);
});

test('decision endpoint enforces finalized-state guardrails with non-2xx response', () => {
  assert.match(routeSource, /if \(match\.status !== 'suggested'\)/);
  assert.match(routeSource, /Suggestion is already finalized\./);
  assert.match(routeSource, /\{ status: 409 \}/);
});

test('decision endpoint response is privacy-safe and excludes attendee private fields', () => {
  assert.match(routeSource, /return NextResponse\.json\(\{[\s\S]*suggestion_id:[\s\S]*decision_event:/);
  assert.doesNotMatch(routeSource, /\bemail\b/);
  assert.doesNotMatch(routeSource, /help_needed|help_offered/);
});

test('decision endpoint uses explicit projection and forbids over-broad select patterns', () => {
  assert.match(routeSource, /select id, run_id, status, reviewed_at, reviewed_by[\s\S]*from attendee_matches/);
  assert.doesNotMatch(routeSource, /select\s+\*\s+from\s+attendee_matches/i);
  assert.doesNotMatch(routeSource, /returning\s+\*/i);
});
