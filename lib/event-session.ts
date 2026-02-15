import type { DbClient } from "./db/server";

export const DEFAULT_EVENT_SESSION_SLUG = 'legacy-default-session';
const DEFAULT_EVENT_SESSION_NAME = 'Legacy Default Session';

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

async function findExplicitActiveEventSession(db: DbClient) {
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

async function findEventSessionBySlug(db: DbClient, slug: string) {
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
    where slug = ${slug}
    order by created_at asc, id asc
    limit 1
  `;

  return rows[0] ?? null;
}

async function findFirstEventSession(db: DbClient) {
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
    order by starts_at asc nulls first, created_at asc, id asc
    limit 1
  `;

  return rows[0] ?? null;
}

async function setActiveEventSessionById(db: DbClient, eventId: string) {
  let foundTarget = false;

  await db.withTransaction(async (tx) => {
    await tx`update public.events set is_active = false where is_active = true`;

    const updated = await tx<{ id: string }[]>`
      update public.events
      set is_active = true,
          updated_at = now()
      where id = ${eventId}
      returning id
    `;

    foundTarget = updated.length > 0;
  });

  if (!foundTarget) {
    return null;
  }

  return findExplicitActiveEventSession(db);
}

async function ensureDefaultEventSession(db: DbClient, defaultSlug: string) {
  const existingDefault = await findEventSessionBySlug(db, defaultSlug);

  if (existingDefault) {
    return existingDefault;
  }

  const inserted = await db<EventSessionRow[]>`
    insert into public.events (slug, name, is_active, metadata)
    values (
      ${defaultSlug},
      ${DEFAULT_EVENT_SESSION_NAME},
      true,
      jsonb_build_object('source', 'runtime_fallback', 'resolver', 'resolveActiveEventSession')
    )
    on conflict (slug) do update
      set name = excluded.name,
          metadata = coalesce(public.events.metadata, '{}'::jsonb) || excluded.metadata
    returning
      id,
      slug,
      name,
      starts_at,
      ends_at,
      check_in_window_start,
      check_in_window_end,
      is_active,
      created_at
  `;

  return inserted[0] ?? findEventSessionBySlug(db, defaultSlug);
}

export async function getActiveEventSession(db: DbClient) {
  return findExplicitActiveEventSession(db);
}

export async function resolveActiveEventSession(
  db: DbClient,
  options: ResolveActiveEventSessionOptions = {},
) {
  const defaultSlug = options.defaultSlug ?? DEFAULT_EVENT_SESSION_SLUG;
  const active = await findExplicitActiveEventSession(db);

  if (active) {
    return active;
  }

  const defaultEvent = await ensureDefaultEventSession(db, defaultSlug);

  if (defaultEvent) {
    if (defaultEvent.is_active) {
      return defaultEvent;
    }

    const activatedDefault = await setActiveEventSessionById(db, defaultEvent.id);
    if (activatedDefault) {
      return activatedDefault;
    }
  }

  const firstEvent = await findFirstEventSession(db);
  if (!firstEvent) {
    return null;
  }

  if (firstEvent.is_active) {
    return firstEvent;
  }

  return setActiveEventSessionById(db, firstEvent.id);
}

export async function resolveEventSessionForRequest(db: DbClient, requestedSlug: string | null) {
  if (typeof requestedSlug === 'string' && requestedSlug.trim().length > 0) {
    const selected = await findEventSessionBySlug(db, requestedSlug.trim());

    if (selected) {
      return selected;
    }
  }

  return resolveActiveEventSession(db);
}

export async function setActiveEventSession(db: DbClient, options: SetActiveEventSessionOptions) {
  const eventId = typeof options.eventId === 'string' ? options.eventId.trim() : '';
  const slug = typeof options.slug === 'string' ? options.slug.trim() : '';

  if (!eventId && !slug) {
    throw new Error('eventId or slug is required to set active session.');
  }

  if (eventId) {
    return setActiveEventSessionById(db, eventId);
  }

  const event = await findEventSessionBySlug(db, slug);
  if (!event) {
    return null;
  }

  return setActiveEventSessionById(db, event.id);
}
