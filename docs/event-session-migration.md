# Event-session legacy attendee migration

## Purpose
Provide a backward-compatible path for deployments that already have attendee rows created before `attendees.event_id` existed.

## Migration used
- `db/migrations/202602151125_event_session_legacy_backfill.sql`

## What it does
1. Verifies `public.events` exists and `public.attendees.event_id` exists. If not, exits with no-op.
2. Upserts a deterministic default event session:
   - `slug`: `legacy-default-session`
   - `name`: `Legacy Default Session`
3. Activates that default event **only when no event is active**.
4. Backfills legacy attendee rows with `event_id IS NULL` to the default event id.

## Idempotency / rerun behavior
- Safe to rerun in staging and non-production checks.
- Uses `ON CONFLICT (slug)` for default-event upsert.
- Backfill only targets rows still missing `event_id`.

## Rollback-safe assumptions
- This migration is additive and does not delete attendee rows.
- Existing operator-selected active event is preserved.
- Read compatibility remains in place during rollout via room API fallback (`event_id = active OR event_id IS NULL`).
