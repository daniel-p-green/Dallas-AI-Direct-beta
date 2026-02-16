# Execution Plan: Remotion Overview Live-Build Fix

## Goal
- Problem: Previous remotion output used legacy composition and did not reliably represent latest live build; user reported mobile compile/runtime issue.
- Target outcome: Regenerate a share-ready overview video from current `main` live build, validate mobile routes are error-free, and expose deterministic commands for overview generation.

## Scope
- In scope:
  - Capture fresh desktop/mobile screenshots from running app on current `main`.
  - Add/refresh Geist overview composition and artifact checks in `demo/remotion`.
  - Render MP4 + poster and verify file outputs.
  - Validate mobile pages for runtime/compile overlays.
- Out of scope:
  - Changing business logic APIs.
  - Refactoring legacy README remotion composition.

## Approach
- Proposed change:
  - Keep legacy README composition intact for compatibility.
  - Add dedicated overview composition + scripts and use this for shareable demo.
- Alternatives considered:
  - Replace legacy composition in place: rejected (would break existing README/test contracts).

## Tasks
- [x] Prepare clean dependency baseline from current `main`.
- [x] Run dev server and capture new desktop/mobile screenshots.
- [x] Validate mobile routes do not show compile/runtime errors.
- [x] Implement/update overview composition and scripts.
- [x] Render overview video and poster.
- [x] Run focused verification tests and report artifact paths.

## Verification plan
- `npm ci`
- `npm run dev -- --port 3020` (for capture only)
- `npm --prefix demo/remotion run render:overview`
- `npm --prefix demo/remotion run still:overview`
- `npm --prefix demo/remotion run check:overview`
- `node --test tests/remotion-scaffold.test.mjs tests/remotion-storyboard-composition.test.mjs`

## Risks + rollback
- Risks:
  - Live capture can fail if local dev env vars are missing for certain routes.
  - Mobile route checks can be flaky without explicit load waits.
- Rollback:
  - Revert only added overview files/scripts in `demo/remotion` and retain legacy demo pipeline.

## Verification evidence
- `npm ci` ✅
- `npm --prefix demo/remotion install` ✅
- `npm --prefix demo/remotion run generate:overview` ✅
- `npm --prefix demo/remotion run check:overview` ✅
- `node --test tests/remotion-scaffold.test.mjs tests/remotion-storyboard-composition.test.mjs` ✅
- `npm run typecheck` ✅
- `npm test` ✅
- `npm run build` ✅
