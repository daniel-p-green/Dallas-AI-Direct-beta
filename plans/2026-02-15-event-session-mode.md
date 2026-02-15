# Plan — Event Session Mode

## Scope
Add multi-event support with active session selection, event-scoped signup/room flows, check-in windows, and backward-compatible migration path.

## Ordered user-story outline
1. Schema for events and attendee-event linkage with migration/backfill strategy.
2. Active-event selection service and defaults.
3. Signup flow update to bind attendee records to active event.
4. Room board API/UI filtering by event with scoped aggregates.
5. Organizer/admin controls for event session lifecycle and check-in windows.
6. Compatibility handling for legacy attendee rows.
7. Docs updates for migration, runtime validation, and operations.
8. Final verification evidence (typecheck/test/build).

## Story tracking
- [x] US-001: Add event-session schema and attendee-to-event linkage
- [x] US-002: Implement backward-compatible data migration for existing attendee records
- [x] US-003: Active-event selection service/defaults (shared resolver + single-active setter)
- [x] US-004: Signup event association + active check-in window enforcement (`403 CHECK_IN_WINDOW_CLOSED`)
- [x] US-005: Room board event filtering + aggregates (event-only active-session query + comfort distribution aggregate)
- [x] US-006: Organizer admin UI for create-session, active-session switching, and check-in window validation/errors
- [x] US-007: Ensure default active-event fallback keeps existing flows functional
- [x] US-008: Docs updates for PRD/use-cases/user-stories/runtime-validation + migration runbook guidance
- [ ] US-009: Final verification evidence (typecheck/test/build)

## Notes
- Preserve current flows through a default active event fallback.
- Keep privacy boundary unchanged (`attendees_public` or event-safe projection).
- Ensure event filter logic is deterministic and test covered.
