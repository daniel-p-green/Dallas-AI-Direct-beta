# agents.md (Root)

## Folder Purpose

Define global delivery standards for Dallas AI Direct Alpha repository outputs.

## Output Standards

- Use enterprise tone.
- Use active voice only.
- Use structured bullets and tables.
- Keep requirements testable.
- Keep docs implementation-ready.

## Update Rules

- Update docs and tests in the same change when requirements shift.
- Preserve security invariants.
- Add change rationale in commit message body.

## Security Rules

- Never expose `email` in any public view or response.
- Directory reads only from `attendees_public`.
- Enforce Postgres RLS on sensitive tables.
- Treat password gate as convenience layer only.
- Do not store secrets in repo.

## Skills

• Skills directory: ~/.codex/skills  
• Discovery: list files under ~/.codex/skills and search for keywords: “neon”, “rls”, “threat”, “repo”, “runbook”, “demo”, “prd”, “jtbd”, “stories”, “tests”.  
• Application: apply the smallest set of skills needed to complete the task.  
• Traceability: add a “Skills used” section with filenames.

### Skills policy patch

- Skills live at `~/.codex/skills`.
- I must scan `~/.codex/skills` for relevant skills before I write or edit docs.
- I must apply the smallest set of skills needed.
- I must add "Skills used" with filenames at the end of the file I modify when it improves auditability.
- I must treat attendee email as sensitive. I must never expose it in any public view, example, or screenshot.
- I must read directory data only from `attendees_public` in design and in docs.

## Definition of Done

- Security docs include concrete RLS SQL.
- Test plans cover privacy leak prevention and abuse controls.
- Runbook supports timed live demo execution.
- All required files exist and remain internally consistent.

## Project Structure Notes

- Frontend app scaffold uses Next.js App Router in `app/`.
- Shared shell is centralized in `app/layout.tsx`; route pages are at `app/<route>/page.tsx`.
- Type checking runs with `npm run typecheck`.
- App shell regression checks run with `npm test` (Node test runner).

## Skills used

- manual policy update from user direction (no additional local skill file applied in this edit)
