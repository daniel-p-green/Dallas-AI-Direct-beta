-- Public beta attendee auth + intro outcome tracking.
-- Additive-only migration: keeps existing admin/session and attendee privacy boundaries intact.

create extension if not exists pgcrypto;

create table if not exists public.attendee_identities (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists attendee_identities_email_idx
  on public.attendee_identities (lower(email))
  where email is not null;

create table if not exists public.auth_magic_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  identity_id uuid references public.attendee_identities(id) on delete set null,
  email text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  ip_hash text,
  user_agent_hash text,
  delivery_provider text not null default 'clerk',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists auth_magic_links_email_expires_idx
  on public.auth_magic_links (lower(email), expires_at desc)
  where email is not null;

create index if not exists auth_magic_links_identity_idx
  on public.auth_magic_links (identity_id, created_at desc)
  where identity_id is not null;

create table if not exists public.attendee_sessions (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid not null references public.attendee_identities(id) on delete cascade,
  clerk_session_id text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists attendee_sessions_identity_idx
  on public.attendee_sessions (identity_id, created_at desc);

create index if not exists attendee_sessions_active_idx
  on public.attendee_sessions (expires_at desc)
  where revoked_at is null;

alter table public.attendee_matches
  add column if not exists intro_outcome text not null default 'pending'
    check (intro_outcome in ('pending', 'delivered', 'not_delivered'));

alter table public.attendee_matches
  add column if not exists intro_outcome_at timestamptz;

alter table public.attendee_matches
  add column if not exists intro_outcome_by text;

create index if not exists attendee_matches_intro_outcome_idx
  on public.attendee_matches (intro_outcome, created_at desc);

create table if not exists public.match_intro_outcome_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.attendee_matches(id) on delete cascade,
  run_id uuid not null references public.match_runs(id) on delete cascade,
  outcome text not null check (outcome in ('delivered', 'not_delivered')),
  actor text not null,
  event_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists match_intro_outcome_events_match_id_created_at_idx
  on public.match_intro_outcome_events (match_id, created_at desc);
