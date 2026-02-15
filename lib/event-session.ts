import type postgres from 'postgres';

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

export async function getActiveEventSession(db: postgres.Sql) {
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
    order by starts_at desc nulls last, created_at desc
    limit 1
  `;

  return rows[0] ?? null;
}
