# v0 Prompt Index: Dallas AI Direct Alpha

## Goal
Generate the Dallas AI Direct alpha demo quickly and safely using v0. Keep scope minimal. Optimize for live demo reliability. Enforce privacy by design. Never expose email on any public surface.

## Non-goals
- Do not redesign schema.
- Do not add OAuth, SSO, or magic links.
- Do not add realtime subscriptions. Use polling.
- Do not add new backend services beyond Neon Postgres.
- Do not change RLS posture or remove attendees_public boundary.

## Recommended execution order
1) 01-app-shell-and-route-structure.md
2) 02-qr-signup-form.md
3) 04-privacy-notice-and-consent-row.md
4) 03-public-room-board.md
5) 05-admin-demo-control-panel-ui-only.md
6) 06-landing-page-and-hero-moment.md
7) 07-room-board-qol-polish.md
8) 08-neon-connection-wiring.md
9) 09-auth-minimal-alpha-gate.md (optional)

Rationale: establish routes and shared layout, build insert path, lock consent and privacy language, then build public read surfaces, add controlled QoL, wire Neon Postgres carefully, and keep auth gate optional.

## Stop immediately if
- v0 proposes schema redesign or new tables not already documented.
- v0 introduces auth flows.
- v0 suggests querying the base attendees table from the client.
- v0 surfaces email in UI, logs, or API responses.
- v0 replaces polling with realtime.

If any occur: revert the change, then re-run the same step with guardrails included.
