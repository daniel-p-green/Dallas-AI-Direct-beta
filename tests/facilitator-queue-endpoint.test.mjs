import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routePath = new URL('../app/api/matches/facilitator-queue/route.ts', import.meta.url);
const routeSource = readFileSync(routePath, 'utf8');

test('facilitator queue endpoint returns paginated pending suggestions contract', () => {
  assert.match(routeSource, /export async function GET\(request: Request\)/);
  assert.match(routeSource, /const page = parsePositiveInt\(url\.searchParams\.get\('page'\), DEFAULT_PAGE, 1, 10_000\)/);
  assert.match(routeSource, /const pageSize = parsePositiveInt\(url\.searchParams\.get\('pageSize'\), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE\)/);
  assert.match(routeSource, /pagination:\s*\{[\s\S]*page,[\s\S]*page_size:[\s\S]*total,[\s\S]*total_pages:/);
});

test('facilitator queue endpoint supports deterministic status and run filters', () => {
  assert.match(routeSource, /function parseStatusFilter\(rawStatus: string \| null\): MatchStatus\[\]/);
  assert.match(routeSource, /return \['suggested'\]/);
  assert.match(routeSource, /where am\.status = any\(\$\{statusFilter\}::text\[\]\)/);
  assert.match(routeSource, /and am\.run_id = \$\{runId\}::uuid/);
  assert.match(routeSource, /order by am\.created_at desc, am\.id asc/);
});

test('facilitator queue endpoint joins attendees and applies consent-aware public-safe projection', () => {
  assert.match(routeSource, /join attendees source on source\.id = am\.attendee_id/);
  assert.match(routeSource, /join attendees matched on matched\.id = am\.matched_attendee_id/);
  assert.match(routeSource, /function toSafeProfile\(/);
  assert.match(routeSource, /const allowIdentity = row\.display_title_company === true/);
  assert.match(routeSource, /title: allowIdentity \? normalizeOptionalText\(row\.title\) : undefined/);
  assert.match(routeSource, /company: allowIdentity \? normalizeOptionalText\(row\.company\) : undefined/);
});

test('facilitator queue endpoint never selects or returns email fields', () => {
  assert.doesNotMatch(routeSource, /\bemail\b/);
});
