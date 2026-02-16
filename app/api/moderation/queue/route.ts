import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../lib/db/server';
import { assertAdminRequest } from '../../../../lib/security';

type ModerationStatus = 'pending' | 'reviewing' | 'resolved' | 'false_positive';

type QueueRow = {
  id: string;
  risk_event_id: string;
  request_fingerprint_hash: string;
  email_redacted: string | null;
  risk_score: number;
  triggered_rules: string[];
  status: ModerationStatus;
  resolution: string | null;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  event_type: string;
  event_created_at: string;
  event_triggered_rules: string[];
  malformed_payload_count: number;
};

const ALLOWED_STATUSES: ModerationStatus[] = ['pending', 'reviewing', 'resolved', 'false_positive'];
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

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

function parseStatusFilter(rawStatus: string | null): ModerationStatus[] {
  if (!rawStatus || rawStatus.trim().length === 0 || rawStatus === 'all') {
    return ['pending', 'reviewing'];
  }

  const statuses = rawStatus
    .split(',')
    .map((token) => token.trim())
    .filter((token): token is ModerationStatus => ALLOWED_STATUSES.includes(token as ModerationStatus));

  return statuses.length > 0 ? statuses : ['pending', 'reviewing'];
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toQueueItem(row: QueueRow) {
  return {
    queue_id: row.id,
    status: row.status,
    risk_score: row.risk_score,
    triggered_rules: row.triggered_rules,
    created_at: row.created_at,
    updated_at: row.updated_at,
    resolution: normalizeOptionalText(row.resolution),
    resolution_notes: normalizeOptionalText(row.resolution_notes),
    resolved_by: normalizeOptionalText(row.resolved_by),
    resolved_at: row.resolved_at,
    identifiers: {
      email_redacted: row.email_redacted,
      request_fingerprint_hash: row.request_fingerprint_hash,
    },
    event: {
      id: row.risk_event_id,
      type: row.event_type,
      created_at: row.event_created_at,
      triggered_rules: row.event_triggered_rules,
      malformed_payload_count: row.malformed_payload_count,
    },
  };
}

export async function GET(request: Request) {
  const authError = assertAdminRequest(request);
  if (authError) {
    return authError;
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get('page'), DEFAULT_PAGE, 1, 10_000);
    const pageSize = parsePositiveInt(url.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const statusFilter = parseStatusFilter(url.searchParams.get('status'));
    const offset = (page - 1) * pageSize;

    const db = getDb();

    const countRows = await db<{ count: string }[]>`
      select count(*)::text as count
      from signup_moderation_queue mq
      where mq.status = any(${statusFilter}::text[])
    `;

    const total = Number(countRows[0]?.count ?? '0');

    const rows = await db<QueueRow[]>`
      select
        mq.id,
        mq.risk_event_id,
        mq.request_fingerprint_hash,
        mq.email_redacted,
        mq.risk_score,
        mq.triggered_rules,
        mq.status,
        mq.resolution,
        mq.resolution_notes,
        mq.resolved_by,
        mq.resolved_at,
        mq.created_at,
        mq.updated_at,
        re.event_type,
        re.created_at as event_created_at,
        re.triggered_rules as event_triggered_rules,
        re.malformed_payload_count
      from signup_moderation_queue mq
      join signup_risk_events re on re.id = mq.risk_event_id
      where mq.status = any(${statusFilter}::text[])
      order by mq.created_at desc, mq.id asc
      limit ${pageSize}
      offset ${offset}
    `;

    return NextResponse.json({
      data: rows.map(toQueueItem),
      filters: {
        status: statusFilter,
      },
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Moderation queue unavailable' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authError = assertAdminRequest(request);
  if (authError) {
    return authError;
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const queueId = typeof body.queueId === 'string' ? body.queueId.trim() : '';
    const status = typeof body.status === 'string' ? body.status.trim() : '';

    if (!queueId) {
      return NextResponse.json({ error: 'queueId is required' }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status as ModerationStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const resolution = normalizeOptionalText(body.resolution) ?? null;
    const resolutionNotes = normalizeOptionalText(body.resolutionNotes) ?? null;
    const resolvedBy = normalizeOptionalText(body.resolvedBy) ?? null;
    const isResolved = status === 'resolved' || status === 'false_positive';

    const db = getDb();

    const rows = await db<QueueRow[]>`
      update signup_moderation_queue as mq
      set
        status = ${status},
        resolution = ${isResolved ? resolution : null},
        resolution_notes = ${isResolved ? resolutionNotes : null},
        resolved_by = ${isResolved ? resolvedBy : null},
        resolved_at = ${isResolved ? new Date().toISOString() : null},
        updated_at = now()
      from signup_risk_events re
      where mq.id = ${queueId}::uuid
        and re.id = mq.risk_event_id
      returning
        mq.id,
        mq.risk_event_id,
        mq.request_fingerprint_hash,
        mq.email_redacted,
        mq.risk_score,
        mq.triggered_rules,
        mq.status,
        mq.resolution,
        mq.resolution_notes,
        mq.resolved_by,
        mq.resolved_at,
        mq.created_at,
        mq.updated_at,
        re.event_type,
        re.created_at as event_created_at,
        re.triggered_rules as event_triggered_rules,
        re.malformed_payload_count
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Moderation queue item not found' }, { status: 404 });
    }

    return NextResponse.json({ data: toQueueItem(rows[0]) });
  } catch {
    return NextResponse.json({ error: 'Moderation queue update failed' }, { status: 500 });
  }
}
