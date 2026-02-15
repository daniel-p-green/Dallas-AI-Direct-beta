# Execution Plan: Overnight hardening pack (P0/P1)

## Goal
- Problem: Reproducibility and safety gaps (missing tracked core migration, unsafe linkedin URL handling, docs path/casing drift, Alpha/Beta naming inconsistency).
- Target outcome: Deterministic fresh setup, strict URL safety, accurate docs/runbooks, and intentional naming consistency with passing verification gates.

## Scope
- In scope: db core migration + schema tests, signup URL validation, room safe-link rendering, docs branch/path cleanup, Alpha->Beta naming sweep where intended, test updates.
- Out of scope: broad refactors, new product features.

## Approach
- Proposed change: Implement targeted fixes in affected files and add/adjust tests to capture regressions.
- Alternatives considered: Relying on docs-only controls (rejected: non-executable and non-deterministic).

## Tasks
- [x] Add tracked executable migration for attendees/attendees_public/RLS/grants.
- [x] Enforce strict linkedin_url scheme validation in signup API.
- [x] Render linkedin links safely in room UI (non-clickable fallback for unsafe/missing values).
- [x] Remove stale alpha path/casing + duplicated branch-policy drift in docs.
- [x] Complete intentional Alpha->Beta naming updates in user-facing copy/tests/docs.

## Verification plan
- `npm run typecheck`
- `npm test`
- `npm run build`

## Risks + rollback
- Risks: Overcorrecting naming may break expected test assertions; migration ordering could conflict with existing docs assumptions.
- Rollback: Revert individual commits per area and restore prior copy/tests while retaining safety fixes.
