import type postgres from 'postgres';

export const DEFAULT_EVENT_SESSION_SLUG = 'legacy-default-session';

export type EventSession = {
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

type EventSessionRow = EventSession;

type ResolveActiveEventSessionOptions = {
  defaultSlug?: string;
};

type SetActiveEventSessionOptions = {
  eventId?: string;
  slug?: string;
};

async function findExplicitActiveEventSession(db: postgres.Sql) {
  const rows = await db<EventSessionRow[]>`
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
    where is_active = true
    order by starts_at desc nulls last, created_at desc, id asc
    limit 1
  `;

  return rows[0] ?? null;
}

async function findDefaultEventSession(db: postgres.Sql, defaultSlug: string) {
  const defaultRows = await db<EventSessionRow[]>`
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
    where slug = ${defaultSlug}
    order by created_at asc, id asc
    limit 1
  `;

  if (defaultRows[0]) {
    return defaultRows[0];
  }

  const fallbackRows = await db<EventSessionRow[]>`
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
    order by starts_at asc nulls first, created_at asc, id asc
    limit 1
  `;

  return fallbackRows[0] ?? null;
}

export async function getActiveEventSession(db: postgres.Sql) {
  return findExplicitActiveEventSession(db);
}

export async function resolveActiveEventSession(
  db: postgres.Sql,
  options: ResolveActiveEventSessionOptions = {},
) {
  const active = await findExplicitActiveEventSession(db);

  if (active) {
    return active;
  }

  return findDefaultEventSession(db, options.defaultSlug ?? DEFAULT_EVENT_SESSION_SLUG);
}

export async function resolveEventSessionForRequest(db: postgres.Sql, requestedSlug: string | null) {
  if (typeof requestedSlug === 'string' && requestedSlug.trim().length > 0) {
    const rows = await db<EventSessionRow[]>`
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
      where slug = ${requestedSlug.trim()}
      order by created_at asc, id asc
      limit 1
    `;

    if (rows[0]) {
      return rows[0];
    }
  }

  return resolveActiveEventSession(db);
}

export async function setActiveEventSession(db: postgres.Sql, options: SetActiveEventSessionOptions) {
  const eventId = typeof options.eventId === 'string' ? options.eventId.trim() : '';
  const slug = typeof options.slug === 'string' ? options.slug.trim() : '';

  if (!eventId && !slug) {
    throw new Error('eventId or slug is required to set active session.');
  }

  await db`begin`;
  try {
    await db`update public.events set is_active = false where is_active = true`;

    const updated = eventId
      ? await db<{ id: string }[]>`
          update public.events
          set is_active = true,
              updated_at = now()
          where id = ${eventId}
          returning id
        `
      : await db<{ id: string }[]>`
          update public.events
          set is_active = true,
              updated_at = now()
          where slug = ${slug}
          returning id
        `;

    if (updated.length === 0) {
      await db`rollback`;
      return null;
    }

    await db`commit`;
  } catch (error) {
    await db`rollback`;
    throw error;
  }

  return resolveActiveEventSession(db);
}
