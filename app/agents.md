# agents.md (app)

## Folder purpose

Define implementation guardrails for demo UI pages and shared styling.

## Output standards and tone

- Keep components simple, readable, and projector-safe.
- Prefer stable interactions over complex effects.
- Keep mobile usability explicit.

## Update rules

- Keep `/signup`, `/room`, `/admin`, and `/` aligned with docs.
- Reflect consent and privacy language exactly.
- Avoid speculative refactors close to demo.

## Security rules

- Never render email on public surfaces.
- Public board logic assumes `attendees_public` projection only.
- Do not add client service-role usage.
- Do not modify schema or RLS in app changes.

## Skills usage instructions

- Skills directory: `~/.codex/skills`.
- Use `frontend-design` and `web-design-guidelines` for styling and accessibility refinements.
- Use `webapp-testing` for UI verification before completion claims.

## Definition of done

- UI matches current docs constraints.
- Mobile and projector readability checks pass.
- Playwright and shell tests run clean for touched behavior.
