-- US-001: match generation, suggestions, and facilitator decision audit trail.

create extension if not exists pgcrypto;

create table if not exists public.match_runs (
  id uuid primary key default gen_random_uuid(),
  algorithm_version text not null,
  scoring_weights jsonb not null default '{}'::jsonb,
  run_metadata jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by text
);

create table if not exists public.attendee_matches (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.match_runs(id) on delete cascade,
  attendee_id uuid not null references public.attendees(id) on delete cascade,
  matched_attendee_id uuid not null references public.attendees(id) on delete cascade,
  overlap_score numeric(6, 4) not null check (overlap_score >= 0 and overlap_score <= 1),
  ai_comfort_proximity_score numeric(6, 4) not null check (ai_comfort_proximity_score >= 0 and ai_comfort_proximity_score <= 1),
  recency_score numeric(6, 4) not null check (recency_score >= 0 and recency_score <= 1),
  consent_visibility_score numeric(6, 4) not null check (consent_visibility_score >= 0 and consent_visibility_score <= 1),
  total_score numeric(6, 4) not null check (total_score >= 0 and total_score <= 1),
  rank_position integer not null check (rank_position > 0),
  status text not null default 'suggested' check (status in ('suggested', 'approved', 'rejected')),
  public_profile_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  constraint attendee_matches_no_self_match check (attendee_id <> matched_attendee_id),
  constraint attendee_matches_unique_pair_per_run unique (run_id, attendee_id, matched_attendee_id)
);

create table if not exists public.match_decision_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.attendee_matches(id) on delete cascade,
  run_id uuid not null references public.match_runs(id) on delete cascade,
  attendee_id uuid not null references public.attendees(id) on delete cascade,
  matched_attendee_id uuid not null references public.attendees(id) on delete cascade,
  decision text not null check (decision in ('approved', 'rejected', 'reset')),
  decided_by text not null,
  reason text,
  event_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Facilitator queue + top-N lookup indexes.
create index if not exists attendee_matches_status_created_at_idx
  on public.attendee_matches (status, created_at desc);

create index if not exists attendee_matches_run_id_status_created_at_idx
  on public.attendee_matches (run_id, status, created_at desc);

create index if not exists attendee_matches_attendee_id_status_total_score_idx
  on public.attendee_matches (attendee_id, status, total_score desc, created_at desc);

create index if not exists attendee_matches_run_id_attendee_id_total_score_idx
  on public.attendee_matches (run_id, attendee_id, total_score desc);

create index if not exists match_decision_events_match_id_created_at_idx
  on public.match_decision_events (match_id, created_at desc);

create index if not exists match_decision_events_run_id_created_at_idx
  on public.match_decision_events (run_id, created_at desc);
