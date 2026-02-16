-- Core attendees schema + public-safe projection + RLS/grants.

create extension if not exists pgcrypto;

create table if not exists public.attendees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  linkedin_url text,
  title text,
  company text,
  display_title_company boolean not null default false,
  ai_comfort_level integer not null check (ai_comfort_level between 1 and 5),
  help_needed text[] not null default '{}',
  help_offered text[] not null default '{}',
  honeypot text not null default '',
  other_help_needed text,
  other_help_offered text,
  created_at timestamptz not null default now()
);

create or replace view public.attendees_public as
select
  id,
  name,
  case when display_title_company then title else null end as title,
  case when display_title_company then company else null end as company,
  linkedin_url,
  ai_comfort_level,
  help_offered,
  created_at
from public.attendees;

alter table public.attendees enable row level security;
alter table public.attendees force row level security;

drop policy if exists attendees_insert_anon on public.attendees;
create policy attendees_insert_anon
  on public.attendees
  for insert
  to anon
  with check (true);

drop policy if exists attendees_select_service_role on public.attendees;
create policy attendees_select_service_role
  on public.attendees
  for select
  to service_role
  using (true);

revoke all on table public.attendees from public;
revoke all on table public.attendees from anon;
revoke all on table public.attendees from authenticated;
grant insert on table public.attendees to anon;
grant select on table public.attendees to service_role;
grant usage on schema public to anon, authenticated, service_role;
grant select on table public.attendees_public to anon, authenticated, service_role;
