# Postgres RLS policies and public view SQL

## Schema and view

```sql
create extension if not exists pgcrypto;

create table if not exists public.attendees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null,
  linkedin_url text,
  title text,
  company text,
  display_title_company boolean not null default false,
  ai_comfort_level int not null check (ai_comfort_level between 1 and 5),
  help_needed text[] not null default '{}' check (cardinality(help_needed) <= 20),
  help_offered text[] not null default '{}' check (cardinality(help_offered) <= 20),
  other_help_needed text check (other_help_needed is null or char_length(other_help_needed) <= 500),
  other_help_offered text check (other_help_offered is null or char_length(other_help_offered) <= 500),
  honeypot text not null default ''
);

create unique index if not exists attendees_email_unique_idx
  on public.attendees (lower(email));

create index if not exists attendees_created_at_idx
  on public.attendees (created_at desc);

create or replace view public.attendees_public as
select
  id,
  created_at,
  name,
  linkedin_url,
  case when display_title_company then title else null end as title,
  case when display_title_company then company else null end as company,
  ai_comfort_level,
  help_offered
from public.attendees;
```

## Enable and force RLS

```sql
alter table public.attendees enable row level security;
alter table public.attendees force row level security;
```

## Deny-by-default policy posture

Do not create broad allow policies.
Add only the explicit policies below.

## Insert policy for anon and authenticated

```sql
create policy attendees_insert_anon_auth
on public.attendees
for insert
to anon, authenticated
with check (
  honeypot = ''
  and position('@' in email) > 1
  and char_length(name) > 0
  and ai_comfort_level between 1 and 5
);
```

## Select policy design for direct table reads

```sql
-- Intentionally omit select policies for anon/authenticated users
-- on public.attendees to block direct table reads.
```

## Optional admin/staff select policy

```sql
create policy attendees_select_admin_or_staff
on public.attendees
for select
to authenticated
using (
  auth.jwt() ->> 'role' in ('admin', 'staff')
);
```

## Staff moderation role setup (Dallas AI staff)

Use JWT app metadata roles for staff moderation controls.

```sql
-- Role claim convention:
-- auth.jwt() ->> 'role' in ('staff', 'admin')

create policy attendees_update_staff_only
on public.attendees
for update
to authenticated
using (
  auth.jwt() ->> 'role' in ('staff', 'admin')
)
with check (
  auth.jwt() ->> 'role' in ('staff', 'admin')
);

create policy attendees_delete_admin_only
on public.attendees
for delete
to authenticated
using (
  auth.jwt() ->> 'role' = 'admin'
);
```

Operational guidance:
- Grant staff/admin roles only through trusted backend workflows.
- Keep moderation actions in server-side paths.
- Audit role assignment changes and moderation actions.

## View grants and table revocation

```sql
grant select on public.attendees_public to anon, authenticated;
revoke all on public.attendees from anon, authenticated;
```

## Role model and service role notes

- `anon`: may insert (subject to policy), may select from `attendees_public`.
- `authenticated`: may insert (subject to policy), may select from `attendees_public`.
- `service_role`: server-side only. Never expose in browser code.
- Table owner and service role can bypass RLS semantics in some contexts.
  Keep privileged operations in trusted server execution paths.

## Alpha pattern (explicit)

- UI reads directory data only from `attendees_public`.
- Inserts go to `attendees`.
- RLS remains deny-by-default on `attendees`.
- Alpha password gate is convenience only.

## Target state and test expectation

- Keep all public directory reads on view-only paths.
- Treat any direct table read in app code as release-blocking.
- Enforce this with policy and privacy leak tests.

## Abuse controls

- Unique email constraint blocks duplicate submissions.
- Honeypot field blocks simple bot traffic.
- Server-side validation enforces required fields and ranges.
- Optional throttling strategy:
  - Rate limit by IP and user-agent.
  - Sliding window, e.g. 5 submissions per 10 minutes per IP.
  - Temporary blocklist for repeated abuse signatures.

## Skills used

- Scanned `~/.codex/skills` and found `antfarm-workflows/SKILL.md`.
- No Neon Postgres/RLS-specific skill exists there today.
- Applied repository RLS standards directly.