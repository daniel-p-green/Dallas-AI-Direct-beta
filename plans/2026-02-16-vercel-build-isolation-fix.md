# Execution Plan: Vercel Build Isolation Fix (Demo Remotion Scope)

## Goal
- Problem: Production Vercel builds are failing because root TypeScript checks include `demo/remotion` files that depend on packages not installed in app-only build environments.
- Target outcome: Restore successful `main` production deploys by isolating demo tooling from app-root typechecking/build paths.

## Scope
- In scope:
  - Update root TypeScript project scoping to exclude demo tooling paths.
  - Verify local gates (`typecheck`, `test`, `build`) pass.
  - Push fix to `main` and confirm deployment health.
- Out of scope:
  - Refactoring Remotion demo implementation.
  - Upgrading Next.js or changing production runtime behavior.

## Approach
- Proposed change:
  - Exclude `demo/**/*` from root `tsconfig.json` so Next.js app build checks do not ingest demo-only TypeScript files.
- Alternatives considered:
  - Installing demo dependencies in root (rejected: pollutes app-root install and violates repo isolation intent).
  - Splitting into TS project references (valid later, unnecessary for immediate incident fix).

## Tasks
- [x] Add TypeScript exclude for demo tooling in root config.
- [x] Run `npm run typecheck`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Commit and push fix to `main`.
- [ ] Confirm Vercel production deployment is ready.

## Verification plan
- `npm run typecheck`
- `npm test`
- `npm run build`

## Risks + rollback
- Risks:
  - Over-broad excludes could hide app TypeScript errors if paths are misconfigured.
- Rollback:
  - Revert the tsconfig change commit and re-run deployment.
