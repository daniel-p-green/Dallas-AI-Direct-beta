import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../lib/db/server';
import { resolveActiveEventSession, setActiveEventSession } from '../../../lib/event-session';

type EventRow = {
  id: string;
  slug: string;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  check_in_window_start: string | null;
  check_in_window_end: string | null;
  is_active: boolean;
  created_at: string;
};

type CreateEventPayload = {
  action: 'create';
  slug: string;
  name: string;
  starts_at?: string | null;
  ends_at?: string | null;
  check_in_window_start?: string | null;
  check_in_window_end?: string | null;
  is_active?: boolean;
};

type ActivateEventPayload = {
  action: 'activate';
  event_id?: string;
  slug?: string;
};

type EventWindowInput = {
  startsAt: string | null;
  endsAt: string | null;
  checkInWindowStart: string | null;
  checkInWindowEnd: string | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalDate(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toTimestamp(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function validateEventWindows(input: EventWindowInput) {
  const startsAtTs = toTimestamp(input.startsAt);
  const endsAtTs = toTimestamp(input.endsAt);
  const checkInStartTs = toTimestamp(input.checkInWindowStart);
  const checkInEndTs = toTimestamp(input.checkInWindowEnd);

  if (input.startsAt && startsAtTs === null) {
    return 'starts_at must be a valid datetime.';
  }

  if (input.endsAt && endsAtTs === null) {
    return 'ends_at must be a valid datetime.';
  }

  if (input.checkInWindowStart && checkInStartTs === null) {
    return 'check_in_window_start must be a valid datetime.';
  }

  if (input.checkInWindowEnd && checkInEndTs === null) {
    return 'check_in_window_end must be a valid datetime.';
  }

  if (startsAtTs !== null && endsAtTs !== null && startsAtTs > endsAtTs) {
    return 'starts_at must be before ends_at.';
  }

  if (checkInStartTs !== null && checkInEndTs !== null && checkInStartTs > checkInEndTs) {
    return 'check_in_window_start must be before check_in_window_end.';
  }

  if (startsAtTs !== null && checkInStartTs !== null && checkInStartTs < startsAtTs) {
    return 'check_in_window_start must be on or after starts_at.';
  }

  if (endsAtTs !== null && checkInEndTs !== null && checkInEndTs > endsAtTs) {
    return 'check_in_window_end must be on or before ends_at.';
  }

  return null;
}

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const db = getDb();
    const rows = await db<EventRow[]>`
      select
        id,
        slug,
        name,
        starts_at,
        ends_at,
        check_in_window_start,
        check_in_window_end,
        is_active,
        created_at
      from public.events
      order by starts_at desc nulls last, created_at desc
      limit 200
    `;

    const active = await resolveActiveEventSession(db);

    return NextResponse.json({
      active,
      events: rows
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load event sessions.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body: unknown = await request.json();

    if (!isObject(body) || typeof body.action !== 'string') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const db = getDb();

    if (body.action === 'create') {
      const payload = body as CreateEventPayload;
      const slug = typeof payload.slug === 'string' ? payload.slug.trim() : '';
      const name = typeof payload.name === 'string' ? payload.name.trim() : '';

      if (!slug || !name) {
        return NextResponse.json({ error: 'slug and name are required.' }, { status: 400 });
      }

      const startsAt = optionalDate(payload.starts_at);
      const endsAt = optionalDate(payload.ends_at);
      const checkInWindowStart = optionalDate(payload.check_in_window_start);
      const checkInWindowEnd = optionalDate(payload.check_in_window_end);
      const windowError = validateEventWindows({
        startsAt,
        endsAt,
        checkInWindowStart,
        checkInWindowEnd,
      });

      if (windowError) {
        return NextResponse.json({ error: windowError }, { status: 422 });
      }

      const shouldActivate = payload.is_active !== false;

      try {
        await db.withTransaction(async (tx) => {
          if (shouldActivate) {
            await tx`update public.events set is_active = false where is_active = true`;
          }

          await tx`
            insert into public.events (
              slug,
              name,
              starts_at,
              ends_at,
              check_in_window_start,
              check_in_window_end,
              is_active
            )
            values (
              ${slug},
              ${name},
              ${startsAt},
              ${endsAt},
              ${checkInWindowStart},
              ${checkInWindowEnd},
              ${shouldActivate}
            )
          `;
        });
      } catch (error) {
        if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
          return NextResponse.json({ error: 'Event session slug already exists.' }, { status: 409 });
        }

        throw error;
      }

      const active = await resolveActiveEventSession(db);
      return NextResponse.json({ ok: true, active });
    }

    if (body.action === 'activate') {
      const payload = body as ActivateEventPayload;
      const active = await setActiveEventSession(db, {
        eventId: payload.event_id,
        slug: payload.slug,
      });

      if (!active) {
        return NextResponse.json({ error: 'Event session not found.' }, { status: 404 });
      }

      return NextResponse.json({ ok: true, active });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Unable to update event sessions.' }, { status: 500 });
  }
}
