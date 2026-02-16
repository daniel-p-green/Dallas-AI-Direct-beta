import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../lib/db/server';
import { resolveEventSessionForRequest } from '../../../../lib/event-session';
import { requireAttendeeOrAdminApiAccess } from '../../../../lib/attendee-auth';

type MatchStatus = 'suggested' | 'approved';

type SuggestionRow = {
  id: string;
  run_id: string;
  status: MatchStatus;
  rank_position: number;
  total_score: number;
  created_at: string;
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

function parseLimit(rawLimit: string | null) {
  if (!rawLimit) {
    return 6;
  }

  const parsed = Number(rawLimit);

  if (!Number.isFinite(parsed)) {
    return 6;
  }

  return Math.min(12, Math.max(1, Math.floor(parsed)));
}

function normalizeOptionalText(value: string | null | undefined): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function toStringArray(values: unknown): string[] {
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === 'string') : [];
}

function toComfort(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 1;
  }

  return Math.min(5, Math.max(1, value));
}

function buildWhy(args: {
  attendeeHelpNeeded: string[];
  attendeeHelpOffered: string[];
  matchedHelpNeeded: string[];
  matchedHelpOffered: string[];
  attendeeComfort: number;
  matchedComfort: number;
}) {
  const helpsAttendee = args.attendeeHelpNeeded.filter((value) => args.matchedHelpOffered.includes(value));
  const helpsMatched = args.matchedHelpNeeded.filter((value) => args.attendeeHelpOffered.includes(value));
  const comfortGap = Math.abs(args.attendeeComfort - args.matchedComfort);
  const reasons: string[] = [];

  if (helpsAttendee.length > 0) {
    reasons.push(`${helpsAttendee[0]} support match`);
  }

  if (helpsMatched.length > 0) {
    reasons.push(`Mutual value on ${helpsMatched[0].toLowerCase()}`);
  }

  if (comfortGap <= 1) {
    reasons.push('Similar AI comfort level');
  }

  return reasons.length > 0 ? reasons.slice(0, 2) : ['Strong complementary networking fit'];
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

export async function GET(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const access = await requireAttendeeOrAdminApiAccess();
  if (!access.ok) {
    return access.response;
  }

  try {
    const db = getDb();
    const url = new URL(request.url);
    const eventSlug = url.searchParams.get('event');
    const limit = parseLimit(url.searchParams.get('limit'));
    const activeEvent = await resolveEventSessionForRequest(db, eventSlug);

    const rows = activeEvent
      ? await db<SuggestionRow[]>`
          select
            am.id,
            am.run_id,
            am.status,
            am.rank_position,
            am.total_score,
            am.created_at,
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
          where am.run_id = (
            select am2.run_id
            from attendee_matches am2
            join attendees source2 on source2.id = am2.attendee_id
            join attendees matched2 on matched2.id = am2.matched_attendee_id
            where source2.event_id = ${activeEvent.id}::uuid
              and matched2.event_id = ${activeEvent.id}::uuid
            order by am2.created_at desc
            limit 1
          )
            and am.status in ('approved', 'suggested')
            and source.event_id = ${activeEvent.id}::uuid
            and matched.event_id = ${activeEvent.id}::uuid
          order by
            case when am.status = 'approved' then 0 else 1 end,
            am.total_score desc,
            am.created_at desc
          limit ${Math.max(limit * 8, 24)}
        `
      : await db<SuggestionRow[]>`
          select
            am.id,
            am.run_id,
            am.status,
            am.rank_position,
            am.total_score,
            am.created_at,
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
          where am.run_id = (
            select am2.run_id
            from attendee_matches am2
            join attendees source2 on source2.id = am2.attendee_id
            join attendees matched2 on matched2.id = am2.matched_attendee_id
            where source2.event_id is null
              and matched2.event_id is null
            order by am2.created_at desc
            limit 1
          )
            and am.status in ('approved', 'suggested')
            and source.event_id is null
            and matched.event_id is null
          order by
            case when am.status = 'approved' then 0 else 1 end,
            am.total_score desc,
            am.created_at desc
          limit ${Math.max(limit * 8, 24)}
        `;

    const uniquePairs = new Set<string>();
    const suggestions: Array<{
      suggestion_id: string;
      run_id: string;
      status: MatchStatus;
      rank_position: number;
      total_score: number;
      created_at: string;
      attendee: ReturnType<typeof toSafeProfile>;
      matched_attendee: ReturnType<typeof toSafeProfile>;
      why: string[];
    }> = [];

    for (const row of rows) {
      const key = [row.attendee_id, row.matched_attendee_id].sort().join('|');

      if (uniquePairs.has(key)) {
        continue;
      }

      const attendee = toSafeProfile({
        id: row.attendee_id,
        name: row.attendee_name,
        title: row.attendee_title,
        company: row.attendee_company,
        display_title_company: row.attendee_display_title_company,
        ai_comfort_level: row.attendee_ai_comfort_level,
        help_needed: row.attendee_help_needed,
        help_offered: row.attendee_help_offered
      });
      const matchedAttendee = toSafeProfile({
        id: row.matched_attendee_id,
        name: row.matched_name,
        title: row.matched_title,
        company: row.matched_company,
        display_title_company: row.matched_display_title_company,
        ai_comfort_level: row.matched_ai_comfort_level,
        help_needed: row.matched_help_needed,
        help_offered: row.matched_help_offered
      });

      uniquePairs.add(key);
      suggestions.push({
        suggestion_id: row.id,
        run_id: row.run_id,
        status: row.status,
        rank_position: row.rank_position,
        total_score: Number(row.total_score),
        created_at: row.created_at,
        attendee,
        matched_attendee: matchedAttendee,
        why: buildWhy({
          attendeeHelpNeeded: attendee.help_needed,
          attendeeHelpOffered: attendee.help_offered,
          matchedHelpNeeded: matchedAttendee.help_needed,
          matchedHelpOffered: matchedAttendee.help_offered,
          attendeeComfort: attendee.ai_comfort_level,
          matchedComfort: matchedAttendee.ai_comfort_level
        })
      });

      if (suggestions.length >= limit) {
        break;
      }
    }

    return NextResponse.json({
      data: suggestions,
      event: activeEvent ? { id: activeEvent.id, slug: activeEvent.slug, name: activeEvent.name } : null
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load suggestions.' }, { status: 500 });
  }
}
