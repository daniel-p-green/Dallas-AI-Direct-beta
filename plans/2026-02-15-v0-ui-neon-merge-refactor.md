# Execution Plan: v0 UI + Hardened Backend + Neon Serverless Merge

## Goal
- Problem: Current build has stronger backend protections, while the v0 build has significantly better UI quality and component architecture.
- Target outcome: Ship a merged build that keeps hardened backend behavior, adopts v0-grade UI system, and migrates DB access to Neon serverless.

## Scope
- In scope:
  - Tailwind-based v0 visual system and component architecture
  - Route/page adapters for existing hardened API contracts
  - Neon serverless DB abstraction + transaction wrapper migration
  - Admin UI visual refactor while preserving current admin behavior
  - Tests and verification updates
- Out of scope:
  - New auth model adoption from v0
  - Endpoint path redesign
  - Schema redesign beyond compatibility fixes

## Approach
- Proposed change:
  - Keep current API domain behavior and event/match/moderation flows.
  - Import v0 UI components and retarget them to current endpoints.
  - Introduce Neon serverless database adapter with explicit transaction helper.
  - Refactor transaction-heavy endpoints to adapter-based transactions.
- Alternatives considered:
  - Keep postgres client for speed (rejected per decision to switch Neon SDK now)
  - Partial reskin only (rejected per requirement for v0-quality UI parity)

## Source artifacts
- v0 source archive: `/Users/danielgreen/Downloads/build-plan.zip`
- Baseline commit SHA (branch point from `origin/test`): `ab48d30047d1d52a79af6ddc28c1b1fdfbc5317c`

## Tasks
- [x] Add Tailwind + v0 tokens/components scaffold
- [x] Refactor layout + landing/signup/room pages to v0-style components with API adapters
- [x] Migrate DB layer to Neon serverless + transaction wrapper
- [x] Refactor event-session and match transaction endpoints to new DB abstraction
- [x] Refactor admin UI visuals without changing admin behavior
- [x] Fix signup LinkedIn normalization helper + ensure hardening behavior
- [x] Update/add tests for new UI wiring and DB abstraction
- [x] Run typecheck/test/build and capture outcomes

## Verification plan
- `npm run typecheck`
- `npm test`
- `npm run build`

## Verification evidence
- `npm ci` completed successfully on February 15, 2026.
- `npm run typecheck` passed.
- `npm test` passed (`119` tests, `0` failures).
- `npm run build` passed (Next.js production build completed).
- Multi-breakpoint UI captures were saved to `/Users/danielgreen/Documents/GitHub/Dallas-AI-Direct-beta/docs/reviews/2026-02-15-v0-merge-visual-validation/`.

## Risks + rollback
- Risks:
  - DB transaction semantics regressions during Neon SDK migration
  - UI merge could break route contract assumptions
  - Test contracts may assert legacy shell strings/classes
- Rollback:
  - Revert branch to pre-merge commit
  - Restore previous DB adapter and app shell files if verification fails
