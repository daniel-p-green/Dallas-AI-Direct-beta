import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../lib/db/server';

type MatchStatus = 'suggested' | 'approved' | 'rejected';

const ALLOWED_STATUSES: MatchStatus[] = ['suggested', 'approved', 'rejected'];
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

type QueueRow = {
  id: string;
  run_id: string;
  status: MatchStatus;
  rank_position: number;
  total_score: number;
  overlap_score: number;
  ai_comfort_proximity_score: number;
  recency_score: number;
  consent_visibility_score: number;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  attendee_id: string;
  attendee_name: string | null;
  attendee_title: string | null;
  attendee_company: string | null;
  attendee_display_title_company: boolean | null;
  attendee_ai_comfort_level: number | null;
  attendee_help_needed: string[] | null;
  attendee_help_offered: string[] | null;
  matched_attendee_id: string;
  matched_name: string | null;
  matched_title: string | null;
  matched_company: string | null;
  matched_display_title_company: boolean | null;
  matched_ai_comfort_level: number | null;
  matched_help_needed: string[] | null;
  matched_help_offered: string[] | null;
};

function toStringArray(values: unknown): string[] {
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === 'string') : [];
}

function normalizeOptionalText(value: string | null | undefined): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function toComfort(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 1;
  }

  return Math.min(5, Math.max(1, value));
}

function toSafeProfile(row: {
  id: string;
  name: string | null;
  title: string | null;
  company: string | null;
  display_title_company: boolean | null;
  ai_comfort_level: number | null;
  help_needed: string[] | null;
  help_offered: string[] | null;
}) {
  const allowIdentity = row.display_title_company === true;

  return {
    id: row.id,
    name: normalizeOptionalText(row.name) ?? 'Attendee',
    title: allowIdentity ? normalizeOptionalText(row.title) : undefined,
    company: allowIdentity ? normalizeOptionalText(row.company) : undefined,
    ai_comfort_level: toComfort(row.ai_comfort_level),
    help_needed: toStringArray(row.help_needed),
    help_offered: toStringArray(row.help_offered)
  };
}

function parsePositiveInt(value: string | null, fallback: number, min: number, max: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const integer = Math.floor(parsed);
  if (integer < min) {
    return min;
  }

  if (integer > max) {
    return max;
  }

  return integer;
}

function parseStatusFilter(rawStatus: string | null): MatchStatus[] {
  if (!rawStatus || rawStatus.trim().length === 0 || rawStatus === 'all') {
    return ['suggested'];
  }

  const statuses = rawStatus
    .split(',')
    .map((token) => token.trim())
    .filter((token): token is MatchStatus => ALLOWED_STATUSES.includes(token as MatchStatus));

  return statuses.length > 0 ? statuses : ['suggested'];
}

export async function GET(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get('page'), DEFAULT_PAGE, 1, 10_000);
    const pageSize = parsePositiveInt(url.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const statusFilter = parseStatusFilter(url.searchParams.get('status'));
    const runId = url.searchParams.get('runId');
    const offset = (page - 1) * pageSize;

    const db = getDb();

    const countRows = runId
      ? await db<{ count: string }[]>`
          select count(*)::text as count
          from attendee_matches am
          where am.status = any(${statusFilter}::text[])
            and am.run_id = ${runId}::uuid
        `
      : await db<{ count: string }[]>`
          select count(*)::text as count
          from attendee_matches am
          where am.status = any(${statusFilter}::text[])
        `;

    const total = Number(countRows[0]?.count ?? '0');

    const rows: QueueRow[] = runId
      ? await db<QueueRow[]>`
          select
            am.id,
            am.run_id,
            am.status,
            am.rank_position,
            am.total_score,
            am.overlap_score,
            am.ai_comfort_proximity_score,
            am.recency_score,
            am.consent_visibility_score,
            am.created_at,
            am.reviewed_at,
            am.reviewed_by,
            source.id as attendee_id,
            source.name as attendee_name,
            source.title as attendee_title,
            source.company as attendee_company,
            source.display_title_company as attendee_display_title_company,
            source.ai_comfort_level as attendee_ai_comfort_level,
            source.help_needed as attendee_help_needed,
            source.help_offered as attendee_help_offered,
            matched.id as matched_attendee_id,
            matched.name as matched_name,
            matched.title as matched_title,
            matched.company as matched_company,
            matched.display_title_company as matched_display_title_company,
            matched.ai_comfort_level as matched_ai_comfort_level,
            matched.help_needed as matched_help_needed,
            matched.help_offered as matched_help_offered
          from attendee_matches am
          join attendees source on source.id = am.attendee_id
          join attendees matched on matched.id = am.matched_attendee_id
          where am.status = any(${statusFilter}::text[])
            and am.run_id = ${runId}::uuid
          order by am.created_at desc, am.id asc
          limit ${pageSize}
          offset ${offset}
        `
      : await db<QueueRow[]>`
          select
            am.id,
            am.run_id,
            am.status,
            am.rank_position,
            am.total_score,
            am.overlap_score,
            am.ai_comfort_proximity_score,
            am.recency_score,
            am.consent_visibility_score,
            am.created_at,
            am.reviewed_at,
            am.reviewed_by,
            source.id as attendee_id,
            source.name as attendee_name,
            source.title as attendee_title,
            source.company as attendee_company,
            source.display_title_company as attendee_display_title_company,
            source.ai_comfort_level as attendee_ai_comfort_level,
            source.help_needed as attendee_help_needed,
            source.help_offered as attendee_help_offered,
            matched.id as matched_attendee_id,
            matched.name as matched_name,
            matched.title as matched_title,
            matched.company as matched_company,
            matched.display_title_company as matched_display_title_company,
            matched.ai_comfort_level as matched_ai_comfort_level,
            matched.help_needed as matched_help_needed,
            matched.help_offered as matched_help_offered
          from attendee_matches am
          join attendees source on source.id = am.attendee_id
          join attendees matched on matched.id = am.matched_attendee_id
          where am.status = any(${statusFilter}::text[])
          order by am.created_at desc, am.id asc
          limit ${pageSize}
          offset ${offset}
        `;

    const data = rows.map((row) => ({
      suggestion_id: row.id,
      run_id: row.run_id,
      status: row.status,
      rank_position: row.rank_position,
      created_at: row.created_at,
      reviewed_at: row.reviewed_at,
      reviewed_by: normalizeOptionalText(row.reviewed_by),
      score_breakdown: {
        total_score: row.total_score,
        overlap_score: row.overlap_score,
        ai_comfort_proximity_score: row.ai_comfort_proximity_score,
        recency_score: row.recency_score,
        consent_visibility_score: row.consent_visibility_score
      },
      attendee: toSafeProfile({
        id: row.attendee_id,
        name: row.attendee_name,
        title: row.attendee_title,
        company: row.attendee_company,
        display_title_company: row.attendee_display_title_company,
        ai_comfort_level: row.attendee_ai_comfort_level,
        help_needed: row.attendee_help_needed,
        help_offered: row.attendee_help_offered
      }),
      matched_attendee: toSafeProfile({
        id: row.matched_attendee_id,
        name: row.matched_name,
        title: row.matched_title,
        company: row.matched_company,
        display_title_company: row.matched_display_title_company,
        ai_comfort_level: row.matched_ai_comfort_level,
        help_needed: row.matched_help_needed,
        help_offered: row.matched_help_offered
      })
    }));

    return NextResponse.json({
      data,
      filters: {
        status: statusFilter,
        run_id: normalizeOptionalText(runId ?? undefined)
      },
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.max(1, Math.ceil(total / pageSize))
      }
    });
  } catch {
    return NextResponse.json({ error: 'Facilitator queue unavailable' }, { status: 500 });
  }
}
