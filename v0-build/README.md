# v0 Build Workspace

Use this directory as the dedicated workspace for v0-generated code and non-code build context.

## Objective

Build the production-track v0 implementation in an isolated path without coupling it to the current live demo implementation in `app/`.

## Directory map

| Path | Purpose |
| --- | --- |
| `v0-build/app/` | Target location for v0-generated app code |
| `v0-build/brand/` | Approved Dallas AI logo assets |
| `v0-build/docs/` | Implementation-ready non-code requirements and constraints |
| `v0-build/prompts/` | Prompt pack for v0 build execution |

## Quick-start workflow

1. Open `v0-build/docs/01-product-requirements.md`.
2. Open `v0-build/docs/02-privacy-security-boundary.md`.
3. Open `v0-build/docs/03-brand-and-visual-requirements.md`.
4. Open `v0-build/docs/04-v0-execution-guardrails.md`.
5. Run v0 prompts from `v0-build/prompts/`.
6. Keep generated code inside `v0-build/app/`.

## Non-negotiable requirements

- Keep attendee `email` private in all public views and payloads.
- Read public directory data from `attendees_public` only.
- Keep Dallas AI logo assets visible on hero and shared shell surfaces.
- Treat any alpha password gate as convenience, not security boundary.
- Keep Postgres RLS and projection boundaries unchanged.

## Skills used

- Source scan attempted: `~/.codex/skills` (directory not present in current environment)
- Applied: repository root standards from `agents.md`
