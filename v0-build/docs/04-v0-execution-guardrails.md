# v0 Execution Guardrails

## Objective

Keep v0 output tightly scoped to the alpha production build while preserving data privacy and reliability controls.

## Scope in

- Shared shell and route structure for alpha surfaces.
- Signup and room-board UI with Neon Postgres wiring.
- Dallas AI brand logo integration and UI consistency.
- Optional alpha password gate with explicit messaging.

## Scope out

- Schema redesign and migration expansion.
- OAuth, SSO, magic links, and auth architecture redesign.
- Realtime subscription dependency for core demo path.
- New backend platforms beyond existing Next.js + Neon Postgres stack.

## Stop conditions

Stop and rerun prompt with guardrails if any output does the following:

- Queries public room data from base table `attendees`.
- Exposes `email` in public UI or payload.
- Introduces service role key usage in client code.
- Replaces polling with realtime-only dependency.
- Removes Dallas AI logo from required brand surfaces.

## Prompt order

Use this order from `v0-build/prompts/`:

1. `INDEX.md`
2. `08-neon-connection-wiring.md`
3. `09-auth-minimal-alpha-gate.md` (optional)

## Output contract

- Keep generated code under `v0-build/app/`.
- Keep non-code requirements in `v0-build/docs/`.
- Keep brand assets in `v0-build/brand/`.
- Keep root `app/` demo path unchanged during v0 production-track build.

## Skills used

- Source scan attempted: `~/.codex/skills` (directory not present in current environment)
- Applied: repository root standards from `agents.md`
