# Execution Plan: Clerk Attendee Auth + Public Beta MVP Hardening

## Goal
- Problem: Public beta requires attendee auth, route/API protection, and operational hardening while preserving Neon-backed privacy boundaries and existing admin workflows.
- Target outcome: Integrate Clerk attendee auth (magic-link compatible), add auth endpoints/contracts, enforce gated attendee surfaces, add outcome tracking polish, and pass typecheck/test/build.

## Scope
- In scope:
  - Fix CI harness file presence (`AGENTS.md` tracked)
  - Clerk integration (provider, middleware, route guards)
  - Attendee auth API endpoints (`request-link`, `verify-link`, `logout`, `session`)
  - Neon migrations for attendee identity/session/magic-link audit tables
  - Auth telemetry logs (request, verify, session create/revoke)
  - Optional gating for attendee-sensitive routes/APIs
  - Bootstrap validation script and npm script wiring
  - Intro outcome action + small admin metrics card
  - Patch `/room` hydration mismatch source
  - Docs/runbook updates and verification evidence
- Out of scope:
  - Replacing existing admin auth with Clerk
  - CRM/messaging features
  - Breaking changes to existing attendee privacy projection model

## Approach
- Proposed change:
  - Keep current admin auth cookie/session flow.
  - Add Clerk for attendee auth with env-gated enforcement (`NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED=true`).
  - Add additive SQL migration for attendee identity/session/link lifecycle tables and intro outcome fields.
  - Add compatibility helpers that allow admin session OR attendee Clerk session access for protected attendee APIs.
- Alternatives considered:
  - Custom Neon-only passwordless auth: higher security/maintenance burden for MVP timeline.
  - Full Clerk migration for admin too: unnecessary scope expansion now.

## Tasks
- [x] Add Clerk deps and env/config scaffolding
- [x] Add tracked `AGENTS.md` and preserve existing agent docs
- [x] Implement attendee auth helper layer + middleware
- [x] Implement attendee auth API routes and telemetry logging
- [x] Add sign-in route UX and gated-room access posture
- [x] Protect attendee-sensitive APIs with attendee/admin auth compatibility
- [x] Add DB migration for attendee auth tables + intro outcome fields
- [x] Add admin intro outcome actions and post-event metrics card
- [x] Add bootstrap validation script and npm command
- [x] Patch room hydration warning source
- [x] Update docs/tests for Clerk posture and new flows
- [x] Run verification gates and capture outcomes

## Verification plan
- `npm run typecheck`
- `npm test`
- `npm run build`

## Verification evidence
- `2026-02-15 15:15 CST` `npm test` -> pass (`130 passed, 0 failed`)
- `2026-02-15 15:16 CST` `npm run build` -> pass (Next.js 15.1.11 production build complete)
- `2026-02-15 15:17 CST` `npm run typecheck` -> pass (`tsc --noEmit`)

## Risks + rollback
- Risks:
  - Clerk env misconfiguration could lock out attendee routes when gating is enabled.
  - Middleware matcher mistakes could over-protect routes.
  - New DB migration fields might diverge from existing match workflows if not additive-only.
- Rollback:
  - Disable attendee gating via env (`NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED=false`).
  - Revert this commit range to restore pre-Clerk behavior.
