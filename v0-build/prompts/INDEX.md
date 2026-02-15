# v0 Prompt Index: Dallas AI Direct Alpha Production Track

## Goal
Generate the Dallas AI Direct production-track build in `v0-build/app/` using non-code context from `v0-build/docs/` and Dallas AI brand assets from `v0-build/brand/`.

## Required pre-read documents

1) `v0-build/docs/01-product-requirements.md`
2) `v0-build/docs/02-privacy-security-boundary.md`
3) `v0-build/docs/03-brand-and-visual-requirements.md`
4) `v0-build/docs/04-v0-execution-guardrails.md`

## Non-goals
- Do not redesign schema.
- Do not add OAuth, SSO, or magic links.
- Do not add realtime subscriptions. Use polling.
- Do not add new backend services beyond Neon Postgres.
- Do not change RLS posture or remove `attendees_public` boundary.
- Do not remove Dallas AI logo from shared shell or hero surfaces.

## Recommended execution order
1) Build route and shell baseline in `v0-build/app/`.
2) Apply Dallas AI brand lockups from `v0-build/brand/`.
3) Run `08-neon-connection-wiring.md`.
4) Run `09-auth-minimal-alpha-gate.md` (optional).

Rationale: establish structure, enforce brand identity, wire secure data flows, and keep optional gate controls isolated.

## Stop immediately if
- v0 proposes schema redesign or new tables not already documented.
- v0 introduces auth flows.
- v0 suggests querying the base attendees table from the client.
- v0 surfaces email in UI, logs, or API responses.
- v0 replaces polling with realtime.
- v0 removes Dallas AI logo from required surfaces.

If any occur: revert the change, then re-run the same step with guardrails included.

## Skills used

- Source scan attempted: `~/.codex/skills` (directory not present in current environment)
- Applied: repository root standards from `agents.md`
