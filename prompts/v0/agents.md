# agents.md (prompts/v0)

## Folder purpose

Control stepwise v0 execution for Dallas AI Direct Alpha with deterministic safety rails.

## Output standards and tone

- Keep instructions explicit, short, and operational.
- Use strict guardrail language.
- Include stop conditions and rollback rules.

## Update rules

- Keep step numbering sequential.
- Update `INDEX.md` when adding or removing steps.
- Preserve global guardrails across all step files.

## Security rules

- Never expose email publicly.
- Keep room-board reads on `attendees_public` only.
- Keep polling mode; do not add realtime for demo path.
- Do not modify schema, RLS, auth, or dependencies unless explicitly approved.

## Skills usage instructions

- Skills directory: `~/.codex/skills`.
- Use `webapp-testing` and `verification-before-completion` for execution safety.
- Use design skills only for UI polish within scope.

## Definition of done

- Steps are executable in order with no hidden assumptions.
- Each step has clear expected outputs and regression checks.
- Stop conditions and rollback instructions are present.
