# Open TODO (Product vs Docs Completeness)

Last reviewed: 2026-02-16

This list captures remaining non-blocking gaps after the ops-ready beta handoff pass.

## Review summary

### Aligned (P0 + P1 closed)
- Core privacy boundary is implemented and documented: public reads use `attendees_public`; email is not exposed on room board.
- `/admin` is documented as an authenticated operational surface (auditable facilitator actions, privacy-safe payloads).
- Signup UI now supports `other_help_needed` / `other_help_offered` end-to-end using existing API payload fields.
- Traceability exists from `docs/PRD.md` requirements to user stories, use cases, and validation artifacts.
- Signup error-path contract coverage includes duplicate email (`409`), malformed payload (`400`), invalid comfort (`400`), and invalid LinkedIn scheme (`400`).
- Deterministic maintainer bootstrap path is available via `npm run bootstrap:beta`.

### Remaining non-blocking items (P2)
- Add maintainer on-call/demo checklist rehearsal cadence for live event day.
- Add lightweight changelog/release-note template for community maintainers.
- Expand real-device evidence archive for recurring event windows.

---

## Traceability + handoff links

- Requirement traceability matrix: `docs/traceability-matrix.md`
- Maintainer/operator handoff packet: `docs/handoff/README.md`
- Runtime checks: `docs/runtime-validation.md`

---

## Suggested next sequencing

1. Finalize Dallas AI operator names in handoff checklist ownership table.
2. Run event-day dry run using `docs/handoff/operator-checklist.md`.
3. Capture first post-event retro and update TODO with observed operational gaps.

## Skills used

- Source: `~/.codex/skills`
- Applied: `github/SKILL.md`
- Notes: Used for repository workflow follow-through and issue-ready structuring.
