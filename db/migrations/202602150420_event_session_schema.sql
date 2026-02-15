create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 160),
  starts_at timestamptz,
  ends_at timestamptz,
  check_in_window_start timestamptz,
  check_in_window_end timestamptz,
  is_active boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  check (
    starts_at is null
    or ends_at is null
    or starts_at <= ends_at
  ),
  check (
    (check_in_window_start is null and check_in_window_end is null)
    or (
      check_in_window_start is not null
      and check_in_window_end is not null
      and check_in_window_start <= check_in_window_end
    )
  )
);

create unique index if not exists events_single_active_idx
  on public.events ((is_active))
  where is_active;

create index if not exists events_active_starts_at_idx
  on public.events (is_active, starts_at desc, created_at desc)
  where is_active;

create index if not exists events_check_in_window_idx
  on public.events (check_in_window_start, check_in_window_end)
  where check_in_window_start is not null;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendees'
      and column_name = 'event_id'
  ) then
    alter table public.attendees
      add column event_id uuid references public.events(id) on delete set null;
  end if;
end $$;

create index if not exists attendees_event_id_created_at_idx
  on public.attendees (event_id, created_at desc)
  where event_id is not null;
