# agents.md (prompts)

## Folder purpose

Define deterministic prompt assets for generating and refining the demo UI without architecture drift.

## Output standards and tone

- Use enterprise tone and active voice.
- Keep prompts copy-paste ready.
- Include explicit guardrails and regression checks.
- Keep scope constrained to the intended step.

## Update rules

- Update `prompts/v0/INDEX.md` when step order changes.
- Add guardrail deltas before adding new prompt steps.
- Keep one-step-one-file structure.

## Security rules

- Never expose email in public UI prompts.
- Enforce public reads from `attendees_public` only.
- Do not propose schema/RLS/auth redesign unless explicitly requested.
- Keep service role usage out of client-side prompts.

## Skills usage instructions

- Skills directory: `~/.codex/skills`.
- Prefer `web-design-guidelines`, `frontend-design`, and `webapp-testing` for prompt quality.
- Apply the smallest relevant skill set.
- Add `Skills used` sections when creating major prompt orchestration docs.

## Definition of done

- Prompt set is complete for current demo scope.
- Each prompt includes objective, guardrails, and regression checks.
- INDEX and step files are internally consistent.
