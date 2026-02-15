-- US-001: abuse/trust moderation queue and risk event audit trail.

create extension if not exists pgcrypto;

create table if not exists public.signup_risk_events (
  id uuid primary key default gen_random_uuid(),
  request_fingerprint_hash text not null,
  email_hash text,
  email_redacted text,
  ip_hash text,
  user_agent_hash text,
  risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
  triggered_rules text[] not null default '{}'::text[],
  event_type text not null check (event_type in ('flagged', 'rate_limited', 'blocked')),
  malformed_payload_count integer not null default 0 check (malformed_payload_count >= 0),
  payload_shape_hash text,
  event_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint signup_risk_events_redacted_email_mask check (
    email_redacted is null
    or email_redacted not like '%@%'
    or email_redacted like '%***%'
  )
);

create table if not exists public.signup_moderation_queue (
  id uuid primary key default gen_random_uuid(),
  risk_event_id uuid not null references public.signup_risk_events(id) on delete cascade,
  request_fingerprint_hash text not null,
  email_hash text,
  email_redacted text,
  risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
  triggered_rules text[] not null default '{}'::text[],
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'false_positive')),
  resolution text,
  resolution_notes text,
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint signup_moderation_queue_redacted_email_mask check (
    email_redacted is null
    or email_redacted not like '%@%'
    or email_redacted like '%***%'
  )
);

create index if not exists signup_risk_events_request_fingerprint_created_at_idx
  on public.signup_risk_events (request_fingerprint_hash, created_at desc);

create index if not exists signup_risk_events_risk_score_created_at_idx
  on public.signup_risk_events (risk_score desc, created_at desc);

create index if not exists signup_moderation_queue_status_created_at_idx
  on public.signup_moderation_queue (status, created_at desc);

create index if not exists signup_moderation_queue_status_risk_score_created_at_idx
  on public.signup_moderation_queue (status, risk_score desc, created_at desc);

create index if not exists signup_moderation_queue_request_fingerprint_created_at_idx
  on public.signup_moderation_queue (request_fingerprint_hash, created_at desc);
