import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../lib/db/server';
import { MATCH_SCORING_VERSION, MATCH_SCORE_WEIGHTS, rankMatches } from '../../../../lib/match-scoring';

type GeneratePayload = {
  topN: number;
  attendeeIds?: string[];
  createdBy: string | null;
};

type AttendeeRow = {
  id: string;
  name: string | null;
  title: string | null;
  company: string | null;
  display_title_company: boolean | null;
  ai_comfort_level: number | null;
  help_needed: string[] | null;
  help_offered: string[] | null;
  created_at: string | null;
};

function toStringArray(values: unknown): string[] {
  return Array.isArray(values) ? values.filter((value): value is string => typeof value === 'string') : [];
}

function parsePayload(body: unknown): { ok: true; payload: GeneratePayload } | { ok: false; message: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'Invalid request body.' };
  }

  const source = body as Record<string, unknown>;
  const rawTopN = Number(source.topN ?? 3);

  if (!Number.isFinite(rawTopN) || rawTopN < 1 || rawTopN > 20) {
    return { ok: false, message: 'topN must be between 1 and 20.' };
  }

  const attendeeIds = Array.isArray(source.attendeeIds)
    ? source.attendeeIds.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : undefined;

  const createdBy = typeof source.createdBy === 'string' && source.createdBy.trim().length > 0 ? source.createdBy.trim() : null;

  return {
    ok: true,
    payload: {
      topN: Math.floor(rawTopN),
      attendeeIds,
      createdBy
    }
  };
}

function toPublicCandidate(candidate: AttendeeRow) {
  const allowIdentity = candidate.display_title_company === true;

  return {
    id: candidate.id,
    name: typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name : 'Attendee',
    title: allowIdentity && typeof candidate.title === 'string' ? candidate.title : undefined,
    company: allowIdentity && typeof candidate.company === 'string' ? candidate.company : undefined,
    ai_comfort_level:
      typeof candidate.ai_comfort_level === 'number' && Number.isFinite(candidate.ai_comfort_level)
        ? Math.min(5, Math.max(1, candidate.ai_comfort_level))
        : 1,
    help_offered: toStringArray(candidate.help_offered),
    created_at: typeof candidate.created_at === 'string' ? candidate.created_at : new Date(0).toISOString()
  };
}

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const db = getDb();

  try {
    const body = await request.json();
    const parsed = parsePayload(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    const { payload } = parsed;
    const nowIso = new Date().toISOString();
    const responsePayload = await db.withTransaction(async (tx) => {
      const attendees = payload.attendeeIds?.length
        ? await tx<AttendeeRow[]>`
            select
              id,
              name,
              title,
              company,
              display_title_company,
              ai_comfort_level,
              help_needed,
              help_offered,
              created_at
            from attendees
            where id = any(${payload.attendeeIds}::uuid[])
          `
        : await tx<AttendeeRow[]>`
            select
              id,
              name,
              title,
              company,
              display_title_company,
              ai_comfort_level,
              help_needed,
              help_offered,
              created_at
            from attendees
          `;

      const runRows = await tx<{ id: string; generated_at: string }[]>`
        insert into match_runs (
          algorithm_version,
          scoring_weights,
          run_metadata,
          created_by
        )
        values (
          ${MATCH_SCORING_VERSION},
          ${JSON.stringify(MATCH_SCORE_WEIGHTS)}::jsonb,
          ${JSON.stringify({ topN: payload.topN, attendee_count: attendees.length, generated_from: 'api/matches/generate' })}::jsonb,
          ${payload.createdBy}
        )
        returning id, generated_at
      `;

      const run = runRows[0];
      const byAttendee: Array<{ attendee_id: string; matches: unknown[] }> = [];

      for (const source of attendees) {
        const ranked = rankMatches(source, attendees, { now: nowIso }).slice(0, payload.topN);
        const safeMatches: unknown[] = [];

        for (let index = 0; index < ranked.length; index += 1) {
          const entry = ranked[index];
          const candidate = entry.candidate as AttendeeRow;
          const rankPosition = index + 1;
          const publicCandidate = toPublicCandidate(candidate);

          await tx`
            insert into attendee_matches (
              run_id,
              attendee_id,
              matched_attendee_id,
              overlap_score,
              ai_comfort_proximity_score,
              recency_score,
              consent_visibility_score,
              total_score,
              rank_position,
              status,
              public_profile_snapshot
            )
            values (
              ${run.id}::uuid,
              ${source.id}::uuid,
              ${candidate.id}::uuid,
              ${entry.overlapScore},
              ${entry.comfortProximityScore},
              ${entry.recencyScore},
              ${entry.consentVisibilityScore},
              ${entry.totalScore},
              ${rankPosition},
              'suggested',
              ${JSON.stringify(publicCandidate)}::jsonb
            )
          `;

          safeMatches.push({
            matched_attendee: publicCandidate,
            rank_position: rankPosition,
            score_breakdown: {
              overlap_score: entry.overlapScore,
              ai_comfort_proximity_score: entry.comfortProximityScore,
              recency_score: entry.recencyScore,
              consent_visibility_score: entry.consentVisibilityScore,
              total_score: entry.totalScore
            }
          });
        }

        byAttendee.push({ attendee_id: source.id, matches: safeMatches });
      }

      return {
        run_id: run.id,
        generated_at: run.generated_at,
        algorithm_version: MATCH_SCORING_VERSION,
        scoring_weights: MATCH_SCORE_WEIGHTS,
        top_n: payload.topN,
        attendee_count: attendees.length,
        results: byAttendee
      };
    });

    return NextResponse.json(responsePayload);
  } catch {
    return NextResponse.json({ error: 'Match generation failed.' }, { status: 500 });
  }
}
