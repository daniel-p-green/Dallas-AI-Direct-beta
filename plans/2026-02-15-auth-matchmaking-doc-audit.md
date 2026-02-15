# Execution Plan: Auth Hardening + Button Polish + You-Should-Meet + Product Doc Audit

## Goal
- Problem: Current branch has major auth gaps on admin/runtime APIs and inconsistent button styling. We also need a lightweight networking feature and a focused product-doc opportunity audit.
- Target outcome: Ship secure Neon-backed admin auth, consistent button styling, a public-safe "You Should Meet" feature, and a lean creative roadmap derived from PRD/JTBD/User Stories/Use Cases.

## Scope
- In scope:
  - Add admin auth/session routes and secure auth utilities
  - Protect admin-sensitive API endpoints and admin page access
  - Add admin user migration + seed script path
  - Normalize button styles across key user/admin actions
  - Add `GET /api/matches/you-should-meet` and room-board UI section
  - Produce product-doc audit report with low-creep recommendations
- Out of scope:
  - Full external identity provider migration in this pass
  - End-user account system and attendee login

## Approach
- Proposed change:
  - Use Neon-backed `admin_users` table + hashed passwords + signed HTTP-only cookie session.
  - Enforce admin guard at API boundary for event/match/moderation/admin actions.
  - Introduce reusable button utility classes and apply to inconsistent surfaces.
  - Generate community suggestions from latest deterministic match run with public-safe profile projection.
  - Audit docs and classify ideas by value vs complexity.
- Alternatives considered:
  - Clerk integration now: deferred; higher integration cost and unnecessary for immediate admin-only hardening.
  - Building suggestions via brand-new matching model: deferred; reuse existing deterministic match data for minimal creep.

## Tasks
- [x] Add auth migration + seed script + env vars/deps
- [x] Implement `lib/auth` and admin guard helper
- [x] Add `/api/auth/login|logout|session` routes
- [x] Guard admin-sensitive API routes
- [x] Protect `/admin` page with login redirect and logout action
- [x] Add button utility classes and update key components
- [x] Add `/api/matches/you-should-meet` and room-board section
- [x] Write product-doc audit report and roadmap recommendations

## Verification plan
- `npm run typecheck`
- `npm test`
- `npm run build`

## Verification evidence
- 2026-02-15: `npm run typecheck` passed.
- 2026-02-15: `npm test` passed (122 tests).
- 2026-02-15: `npm run build` passed, including `ƒ /api/matches/you-should-meet`.

## Risks + rollback
- Risks:
  - Auth guard rollout could unintentionally block valid admin flows if env/seeding is not configured.
  - New suggestions endpoint may return empty sets when no match runs exist.
- Rollback:
  - Revert this change set and disable auth gates by reverting guard imports.
  - Keep existing runtime while reworking auth bootstrapping.
