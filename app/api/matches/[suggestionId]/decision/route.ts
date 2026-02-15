import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../../lib/db/server';

type MatchStatus = 'suggested' | 'approved' | 'rejected';
type DecisionAction = 'approve' | 'reject';

const ACTION_TO_STATUS: Record<DecisionAction, MatchStatus> = {
  approve: 'approved',
  reject: 'rejected'
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

  if (action !== 'approve' && action !== 'reject') {
    return { ok: false, message: 'action must be approve or reject.' };
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
          : {}
    }
  };
}

function toRouteParams(context: { params: Promise<{ suggestionId?: string }> }) {
  return context.params;
}

async function decide(request: Request, context: { params: Promise<{ suggestionId?: string }> }) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
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
    const nextStatus = ACTION_TO_STATUS[payload.action];
    const responsePayload = await db.withTransaction(async (tx) => {
      const rows = await tx<MatchRow[]>`
        select id, run_id, status, reviewed_at, reviewed_by
        from attendee_matches
        where id = ${suggestionId}::uuid
        for update
      `;

      if (rows.length === 0) {
        throw new DecisionHttpError(404, { error: 'Suggestion not found.' });
      }

      const match = rows[0];

      if (match.status !== 'suggested') {
        throw new DecisionHttpError(409, {
          error: 'Suggestion is already finalized.',
          suggestion_id: match.id,
          status: match.status
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
        returning id, run_id, status, reviewed_at, reviewed_by
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
        decision_event: {
          id: eventRows[0].id,
          created_at: eventRows[0].created_at,
          decision: updated.status,
          actor: payload.actor,
          reason: payload.reason
        }
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
