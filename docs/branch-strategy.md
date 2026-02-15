# Branch Strategy (v1)

## Branches
- `main`: production/demo-ready only.
- `test`: integration branch for all active work and agent runs.

## Rules
1. Agents and contributors open work against `test` only.
2. `main` updates only from reviewed PRs from `test`.
3. Hotfixes may go direct to `main` only when explicitly approved, then must be back-merged to `test`.

## Release flow
1. Ship work into `test`.
2. Run full verification (`typecheck`, `test`, `build`, runtime checks).
3. Open PR `test -> main` with release notes and risk summary.
4. Merge only when release gate passes.
