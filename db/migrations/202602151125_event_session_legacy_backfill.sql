-- Backfill strategy for legacy attendee rows created before event-session scoping.
-- Rollout assumptions (rollback-safe):
-- 1) The additive event-session schema migration already ran (events table + attendees.event_id).
-- 2) If either table/column is missing, this migration is a no-op so staging reruns stay safe.
-- 3) We only attach attendees with event_id IS NULL to a deterministic default session.

do $$
declare
  default_event_id uuid;
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'events'
  ) then
    return;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendees'
      and column_name = 'event_id'
  ) then
    return;
  end if;

  insert into public.events (slug, name, is_active, metadata)
  values (
    'legacy-default-session',
    'Legacy Default Session',
    false,
    jsonb_build_object(
      'source', 'migration',
      'migration', '202602151125_event_session_legacy_backfill.sql'
    )
  )
  on conflict (slug) do update
    set name = excluded.name,
        metadata = public.events.metadata || excluded.metadata
  returning id into default_event_id;

  if default_event_id is null then
    select id into default_event_id
    from public.events
    where slug = 'legacy-default-session'
    limit 1;
  end if;

  if default_event_id is null then
    return;
  end if;

  -- Keep current operator-selected active event if present.
  if not exists (select 1 from public.events where is_active = true) then
    update public.events
    set is_active = true,
        updated_at = now()
    where id = default_event_id;
  end if;

  -- Idempotent backfill: reruns only target rows that are still null.
  update public.attendees
  set event_id = default_event_id
  where event_id is null;
end $$;
