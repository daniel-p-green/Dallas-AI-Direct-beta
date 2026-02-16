# Execution Plan: README Live Screenshots + Final Cleanup

## Goal
- Problem: README currently leans on utility/demo artifacts and does not showcase fresh live product screenshots for repo-first readers.
- Target outcome: Add current live screenshots to README, remove stale backup folder, and remove stale remote branch for a clean handoff state.

## Scope
- In scope:
  - Capture fresh live screenshots from running app routes.
  - Add a README section that displays those screenshots via repo-relative asset paths.
  - Remove stale local backup directory created during recovery.
  - Remove stale remote branch `v0/daniel-p-green-13ad9b2b`.
- Out of scope:
  - Product feature/code changes outside docs/assets.
  - Rewriting README demo contract section semantics.

## Approach
- Proposed change:
  - Use local dev server + browser automation to capture screenshots for `/`, `/signup`, `/room`, `/login`.
  - Store assets under `public/readme/` and reference them in a new `## Live Product Screenshots` README section.
  - Keep existing README demo section and contract phrases intact.
- Alternatives considered:
  - Reuse existing remotion assets: rejected (not clearly tied to current README purpose).

## Tasks
- [x] Add guardrails for local stale artifacts (`.gitignore`) and stop blocking deletion loop.
- [x] Remove stale remote v0 branch.
- [x] Capture live screenshots from the running app.
- [x] Update README with screenshot gallery.
- [x] Run README + full verification gates.

## Verification plan
- `node --test tests/readme-core-docs-consistency.test.mjs tests/readme-demo-integration.test.mjs tests/remotion-scaffold.test.mjs`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Risks + rollback
- Risks:
  - README test contracts can break if required demo/closing phrases change.
  - Image file sizes can bloat if uncontrolled.
- Rollback:
  - Revert `README.md` and `public/readme/*`.

## Verification evidence
- `git fetch origin --prune && git branch -r` ✅ (`origin/v0/daniel-p-green-13ad9b2b` removed)
- `npx playwright screenshot ...` ✅ (captured `public/readme/live-*.png`)
- `.gitignore` updated with `.dev-*.log` and `*.stale-backup-*` ✅
- `node --test tests/readme-core-docs-consistency.test.mjs tests/readme-demo-integration.test.mjs tests/remotion-scaffold.test.mjs` ✅
- `npm run typecheck` ✅
- `npm test` ✅
- `npm run build` ✅
