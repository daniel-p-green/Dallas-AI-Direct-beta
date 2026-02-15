import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../../lib/db/server';
import { requireAdminSession } from '../../../../../lib/auth-guard';

type MatchStatus = 'suggested' | 'approved' | 'rejected';
type IntroOutcome = 'pending' | 'delivered' | 'not_delivered';
type DecisionAction = 'approve' | 'reject' | 'delivered' | 'not_delivered';

const ACTION_TO_STATUS: Partial<Record<DecisionAction, MatchStatus>> = {
  approve: 'approved',
  reject: 'rejected',
};

type DecisionPayload = {
  action: DecisionAction;
  actor: string;
  reason: string | null;
  metadata: Record<string, unknown>;
};

type MatchRow = {
  id: string;
  run_id: string;
  status: MatchStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  intro_outcome: IntroOutcome;
  intro_outcome_at: string | null;
  intro_outcome_by: string | null;
};

class DecisionHttpError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown>) {
    super(typeof body.error === 'string' ? body.error : 'decision_request_failed');
    this.status = status;
    this.body = body;
  }
}

function parsePayload(body: unknown): { ok: true; payload: DecisionPayload } | { ok: false; message: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'Invalid request body.' };
  }

  const source = body as Record<string, unknown>;
  const action = source.action;
  const actor = source.actor;
  const reason = source.reason;
  const metadata = source.metadata;

  if (action !== 'approve' && action !== 'reject' && action !== 'delivered' && action !== 'not_delivered') {
    return { ok: false, message: 'action must be approve, reject, delivered, or not_delivered.' };
  }

  if (typeof actor !== 'string' || actor.trim().length === 0) {
    return { ok: false, message: 'actor is required.' };
  }

  return {
    ok: true,
    payload: {
      action,
      actor: actor.trim(),
      reason: typeof reason === 'string' && reason.trim().length > 0 ? reason.trim() : null,
      metadata:
        metadata && typeof metadata === 'object' && !Array.isArray(metadata)
          ? (metadata as Record<string, unknown>)
          : {},
    },
  };
}

function toRouteParams(context: { params: Promise<{ suggestionId?: string }> }) {
  return context.params;
}

async function decide(request: Request, context: { params: Promise<{ suggestionId?: string }> }) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const adminSession = await requireAdminSession();
  if (!adminSession.ok) {
    return adminSession.response;
  }

  const params = await toRouteParams(context);
  const suggestionId = typeof params.suggestionId === 'string' ? params.suggestionId.trim() : '';

  if (!suggestionId) {
    return NextResponse.json({ error: 'suggestionId is required.' }, { status: 400 });
  }

  const db = getDb();

  try {
    const body = await request.json();
    const parsed = parsePayload(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    const { payload } = parsed;

    const responsePayload = await db.withTransaction(async (tx) => {
      const rows = await tx<MatchRow[]>`
        select
          id,
          run_id,
          status,
          reviewed_at,
          reviewed_by,
          intro_outcome,
          intro_outcome_at,
          intro_outcome_by
        from attendee_matches
        where id = ${suggestionId}::uuid
        for update
      `;

      if (rows.length === 0) {
        throw new DecisionHttpError(404, { error: 'Suggestion not found.' });
      }

      const match = rows[0];

      if (payload.action === 'approve' || payload.action === 'reject') {
        const nextStatus = ACTION_TO_STATUS[payload.action] as MatchStatus;

        if (match.status !== 'suggested') {
          throw new DecisionHttpError(409, {
            error: 'Suggestion is already finalized.',
            suggestion_id: match.id,
            status: match.status,
          });
        }

        const updatedRows = await tx<MatchRow[]>`
          update attendee_matches
          set
            status = ${nextStatus},
            reviewed_at = now(),
            reviewed_by = ${payload.actor}
          where id = ${suggestionId}::uuid
            and status = 'suggested'
          returning
            id,
            run_id,
            status,
            reviewed_at,
            reviewed_by,
            intro_outcome,
            intro_outcome_at,
            intro_outcome_by
        `;

        if (updatedRows.length !== 1) {
          throw new DecisionHttpError(409, { error: 'Invalid status transition.' });
        }

        const updated = updatedRows[0];

        const eventRows = await tx<{ id: string; created_at: string }[]>`
          insert into match_decision_events (
            match_id,
            run_id,
            actor,
            decision,
            metadata
          )
          values (
            ${updated.id}::uuid,
            ${updated.run_id}::uuid,
            ${payload.actor},
            ${updated.status},
            ${JSON.stringify({ reason: payload.reason, ...payload.metadata })}::jsonb
          )
          returning id, created_at
        `;

        if (eventRows.length !== 1) {
          throw new DecisionHttpError(500, { error: 'Decision audit event write failed.' });
        }

        return {
          suggestion_id: updated.id,
          run_id: updated.run_id,
          status: updated.status,
          reviewed_at: updated.reviewed_at,
          reviewed_by: updated.reviewed_by,
          intro_outcome: updated.intro_outcome,
          decision_event: {
            id: eventRows[0].id,
            created_at: eventRows[0].created_at,
            decision: updated.status,
            actor: payload.actor,
            reason: payload.reason,
          },
        };
      }

      if (match.status !== 'approved') {
        throw new DecisionHttpError(409, {
          error: 'Intro outcomes can only be recorded after approval.',
          suggestion_id: match.id,
          status: match.status,
        });
      }

      const nextOutcome = payload.action;

      const updatedRows = await tx<MatchRow[]>`
        update attendee_matches
        set
          intro_outcome = ${nextOutcome},
          intro_outcome_at = now(),
          intro_outcome_by = ${payload.actor}
        where id = ${suggestionId}::uuid
          and status = 'approved'
        returning
          id,
          run_id,
          status,
          reviewed_at,
          reviewed_by,
          intro_outcome,
          intro_outcome_at,
          intro_outcome_by
      `;

      if (updatedRows.length !== 1) {
        throw new DecisionHttpError(409, { error: 'Invalid intro outcome transition.' });
      }

      const updated = updatedRows[0];

      const eventRows = await tx<{ id: string; created_at: string }[]>`
        insert into match_intro_outcome_events (
          match_id,
          run_id,
          outcome,
          actor,
          event_metadata
        )
        values (
          ${updated.id}::uuid,
          ${updated.run_id}::uuid,
          ${updated.intro_outcome},
          ${payload.actor},
          ${JSON.stringify({ reason: payload.reason, ...payload.metadata })}::jsonb
        )
        returning id, created_at
      `;

      if (eventRows.length !== 1) {
        throw new DecisionHttpError(500, { error: 'Intro outcome event write failed.' });
      }

      return {
        suggestion_id: updated.id,
        run_id: updated.run_id,
        status: updated.status,
        reviewed_at: updated.reviewed_at,
        reviewed_by: updated.reviewed_by,
        intro_outcome: updated.intro_outcome,
        intro_outcome_at: updated.intro_outcome_at,
        intro_outcome_by: updated.intro_outcome_by,
        outcome_event: {
          id: eventRows[0].id,
          created_at: eventRows[0].created_at,
          outcome: updated.intro_outcome,
          actor: payload.actor,
          reason: payload.reason,
        },
      };
    });

    return NextResponse.json(responsePayload);
  } catch (error) {
    if (error instanceof DecisionHttpError) {
      if (error.status === 409) {
        return NextResponse.json(error.body, { status: 409 });
      }
      return NextResponse.json(error.body, { status: error.status });
    }

    return NextResponse.json({ error: 'Decision update failed.' }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ suggestionId?: string }> }) {
  return decide(request, context);
}

export async function PATCH(request: Request, context: { params: Promise<{ suggestionId?: string }> }) {
  return decide(request, context);
}
