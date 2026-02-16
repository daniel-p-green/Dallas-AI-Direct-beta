# Harness Preflight (v1.1)

Before implementation on non-trivial tasks:
1. Read `docs/harness/README.md`.
2. Create or update an execution plan using `docs/harness/plan-template.md`, saved under `plans/YYYY-MM-DD-<slug>.md`.
3. Use `docs/harness/pr-contract.md` to structure the final PR.
4. Follow `docs/harness/research-ingestion.md` for web research sources.
5. Include verification evidence (`typecheck`, `test`, `build`) before completion claims.

# Branch policy
- Default branch for implementation: `test`
- Promote to `main` only via reviewed PR after verification gates.

# Branch policy
- Default branch for implementation: `test`
- Promote to `main` only via reviewed PR after verification gates.

# Codebase notes
- Product demo tooling should be isolated under `demo/<tool>/` and invoked from root scripts via `npm --prefix` to avoid polluting Next.js app-root configuration.
- Documentation acceptance is enforced by `node:test` suites under `tests/*.test.mjs`; update/add phrase-contract tests when changing PRD/use-cases/user-stories/runtime-validation docs.
- Event-session runtime flow now centers on `app/api/events/route.ts` (organizer create/activate) and shared active-session lookup in `lib/event-session.ts` used by signup + room APIs.
