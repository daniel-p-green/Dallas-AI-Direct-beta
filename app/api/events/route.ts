import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../lib/db/server';
import { getActiveEventSession } from '../../../lib/event-session';

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

    const active = rows.find((row) => row.is_active) ?? null;

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

      const shouldActivate = payload.is_active !== false;

      await db`begin`;
      try {
        if (shouldActivate) {
          await db`update public.events set is_active = false where is_active = true`;
        }

        await db`
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
            ${optionalDate(payload.starts_at)},
            ${optionalDate(payload.ends_at)},
            ${optionalDate(payload.check_in_window_start)},
            ${optionalDate(payload.check_in_window_end)},
            ${shouldActivate}
          )
        `;

        await db`commit`;
      } catch (error) {
        await db`rollback`;
        throw error;
      }

      const active = await getActiveEventSession(db);
      return NextResponse.json({ ok: true, active });
    }

    if (body.action === 'activate') {
      const payload = body as ActivateEventPayload;
      const eventId = typeof payload.event_id === 'string' ? payload.event_id.trim() : '';
      const slug = typeof payload.slug === 'string' ? payload.slug.trim() : '';

      if (!eventId && !slug) {
        return NextResponse.json({ error: 'event_id or slug is required.' }, { status: 400 });
      }

      await db`begin`;
      try {
        await db`update public.events set is_active = false where is_active = true`;

        const updated = eventId
          ? await db<{ id: string }[]>`
              update public.events
              set is_active = true
              where id = ${eventId}
              returning id
            `
          : await db<{ id: string }[]>`
              update public.events
              set is_active = true
              where slug = ${slug}
              returning id
            `;

        if (updated.length === 0) {
          await db`rollback`;
          return NextResponse.json({ error: 'Event session not found.' }, { status: 404 });
        }

        await db`commit`;
      } catch (error) {
        await db`rollback`;
        throw error;
      }

      const active = await getActiveEventSession(db);
      return NextResponse.json({ ok: true, active });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Unable to update event sessions.' }, { status: 500 });
  }
}
