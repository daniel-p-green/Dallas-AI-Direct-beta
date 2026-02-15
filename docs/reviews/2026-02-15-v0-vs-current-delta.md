# v0 vs Current Repo Delta Appendix

## Scope
- v0 primary source: `/tmp/dallas-ai-direct-v0-review/source`
- current repo target: `/Users/danielgreen/Documents/GitHub/Dallas-AI-Direct-beta`

## Branch Context
- Current working branch: `codex/v0-ui-neon-merge-refactor`
- Promotion target (policy): `origin/test`
- Long-lived branches present: `main`, `origin/test`, `origin/main`

## Migration Risk Matrix
| Area | v0 State | Current State | Risk | Notes |
|---|---|---|---|---|
| UI drift | Strong visual polish and clearer hero/signup ergonomics, but broken brand assets in runtime package | v0-style shell merged with valid brand assets and route-specific adapters | Medium | Safe path is visual-layer import only; do not copy v0 assets blindly. |
| API/route drift | Monolithic attendee API (`/api/attendees`) + admin/auth routes | Hardened split contracts (`/api/attendees/signup`, `/api/attendees/public`, events/matches/moderation flows) | High | Directly adopting v0 API surface would drop event-session and match/moderation behavior. |
| Privacy/security hardening | Basic boundaries documented; runtime lacks key controls (role guard, safe link validation, strong session secret handling) | Hardened signup protections, event session scoping, moderation queue, safer link handling, Neon transaction wrapper | High | Regressions likely if v0 backend/auth code is merged back into current branch. |
| Test coverage drift | 5 `*.test.mjs` + 1 `*.spec.ts`; baseline failures present | 30 `*.test.mjs` + 1 `*.spec.ts`; full gate pass in current branch | High | v0 tests are mostly doc/shell checks and currently fail, so they are not release-grade signal. |
| Docs/process drift | Good v0 guardrail docs, but incomplete prompt index and no harness contract enforcement | Harness preflight + plan/pr-contract workflow and richer runtime validation artifacts | Medium | Keep v0 docs for intent; keep current harness for execution governance. |

## High-Risk Regressions if Adopting v0 Visuals into Current
1. Reintroducing weaker auth/session handling from v0 (`SESSION_SECRET` fallback behavior).
2. Losing admin role authorization checks by inheriting v0 admin route patterns.
3. Reintroducing unsafe public link rendering if v0 attendee-card/link handling is copied without safe URL normalization.
4. Breaking deterministic CI confidence by carrying over v0 lock/test drift.
5. Dropping event-session and matchmaking moderation capabilities if v0 route model replaces current API model.

## Recommended Merge Posture
- Keep **current backend and policy runtime** as system of record.
- Pull **v0 visual primitives/components only**, then map them onto current hardened endpoints.
- Preserve current verification gates and harness contracts as merge criteria.
