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
- [x] US-003: Active-event selection service/defaults
- [x] US-004: Signup event association
- [x] US-005: Room board event filtering + aggregates
- [ ] US-006+: Remaining organizer/session UX and docs stories

## Notes
- Preserve current flows through a default active event fallback.
- Keep privacy boundary unchanged (`attendees_public` or event-safe projection).
- Ensure event filter logic is deterministic and test covered.
