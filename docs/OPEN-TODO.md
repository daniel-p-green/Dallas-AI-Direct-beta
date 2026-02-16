# Open TODO (Product vs Docs Completeness)

Last reviewed: 2026-02-15

This list captures gaps between current implementation and documented intent.

## Review summary

### Aligned
- Core privacy boundary is implemented and documented: public reads use `attendees_public`; email is not exposed on room board.
- Signup -> room flow works and build/test gates pass.
- Personas, user stories, and use cases now cover new member, regular member, organizer, ops/security, and maintainer roles.

### Gaps to close
- Data model includes `other_help_needed` / `other_help_offered`, but signup UI currently submits these as `null` only (no input path).
- `/admin` page remains lightweight and should continue to be documented as non-privileged facilitator tooling.
- Pre-demo docs rely on manual SQL/runbook steps; there is no single bootstrap script for repeatable environment setup.

---

## P0 (must close for reliable beta handoff)

- [x] Implement minimal route-level throttling for `POST /api/attendees/signup`.
  - **Owner:** backend/ops
  - **Status:** shipped in `app/api/attendees/signup/route.ts` with configurable window/max limits and deterministic `429` responses.

- [ ] Clarify `/admin` posture in docs and UI (demo-only vs operational).
  - **Owner:** product/docs
  - **Acceptance:** no ambiguity that controls are non-privileged and non-persistent.

- [ ] Add deterministic setup/bootstrap path for new maintainers.
- [x] Add deterministic setup/bootstrap path for new maintainers.
  - **Owner:** maintainers
  - **Acceptance:** one checklist/script verifies env vars, DB readiness, and local smoke paths (`/signup`, `/room`).
  - **Status:** shipped via `npm run bootstrap:beta` (`scripts/bootstrap-beta.mjs`).

## P1 (important completeness)

- [ ] Add UI support for `other_help_needed` and `other_help_offered` (or remove from schema/docs until used).
  - **Owner:** product/frontend
  - **Acceptance:** either fields are fully supported end-to-end, or intentionally de-scoped in docs + schema notes.

- [ ] Add traceability matrix from PRD -> user stories -> use cases -> validation checks.
  - **Owner:** docs/maintainers
  - **Acceptance:** each critical requirement maps to at least one validation artifact.

- [ ] Add API-focused tests for signup route error cases (duplicate email, out-of-range comfort, malformed payload).
  - **Owner:** backend/QA
  - **Acceptance:** automated coverage for expected 4xx/5xx behavior.

## P2 (polish and operations)

- [x] Add structured logging guidance and sample redacted event format for runtime incidents.
  - **Status:** redacted `signup_security` event format documented and emitted by signup abuse path (hashes + masked email only).
- [ ] Add maintainer on-call/demo checklist for live event day.
- [ ] Add lightweight changelog/release note template for community maintainers.

---

## Suggested sequencing

1. P0 throttling + admin clarification
2. P0 bootstrap setup path
3. P1 `other_help_*` decision (implement vs de-scope)
4. P1 traceability + API tests
5. P2 operational polish

## Skills used

- Source: `~/.codex/skills`
- Applied: `github/SKILL.md`
- Notes: Used for repository workflow follow-through and issue-ready structuring.
