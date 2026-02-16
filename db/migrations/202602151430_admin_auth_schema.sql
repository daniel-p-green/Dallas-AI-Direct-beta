-- Admin auth schema for organizer/operator access.
-- This migration keeps attendee public/private boundaries unchanged.

create table if not exists public.admin_users (
  id bigint generated always as identity primary key,
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin' check (role in ('admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_users_is_active_idx on public.admin_users (is_active);
