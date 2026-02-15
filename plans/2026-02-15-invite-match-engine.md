# Plan — Invite + Match Engine (Feature Set A)

## Scope
Implement deterministic attendee matching, facilitator approval workflow, audit trail, privacy-safe APIs/UI, and docs/test updates.

## Ordered user-story outline
1. DB schema for match runs, match suggestions, and decision audit events.
2. Deterministic scoring service (overlap + comfort proximity + consent + recency) with unit tests.
3. Backend generation API for top-N per attendee and facilitator queue persistence.
4. Backend decision API for approve/reject actions with immutable audit events.
5. Privacy contract hardening for new APIs (no email/private fields leakage) with tests.
6. Admin UI for facilitator review and approve/reject flow.
7. Docs updates (PRD/use-cases/user-stories/runtime validation) for new workflow.
8. End-to-end integration validation and release-gate evidence update.

## Notes
- Preserve `attendees_public` read boundary for any public surface.
- Keep matching reproducible via deterministic tie-breakers.
- Store scoring inputs/weights used at generation time for auditability.

## Story focus (US-003)
- [x] Add `POST /api/matches/generate` endpoint with `topN` + optional attendee filtering
- [x] Persist `match_runs` + `attendee_matches` inside one DB transaction
- [x] Return privacy-safe response payload (no email/private-only fields)
- [x] Add endpoint contract tests for persistence, deterministic ranking call, and score/audit fields
