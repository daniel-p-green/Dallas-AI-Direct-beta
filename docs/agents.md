# agents.md (docs)

## Folder Purpose

Maintain product, architecture, security, and roadmap documentation for the alpha.

## Output Standards

- Use concise enterprise language.
- Include tables for decisions, risks, and controls.
- Link related documents explicitly.

## Update Rules

- Keep PRD, JTBD, user stories, and use cases aligned.
- Update `docs/PLAN.md` when delivery sequence changes.
- Update `docs/security.md` and `docs/rls-policies.md` together.

## Security Rules

- Never expose `email` in examples, screenshots, or payload samples.
- Directory reads only from `attendees_public`.
- Document RLS as primary control.

## Skills Usage Instructions

- Skills directory: `~/.codex/skills`.
- Scan skill files first and choose the smallest relevant set.
- Add a `Skills used` footer with filenames in modified docs when it improves auditability.

## Definition of Done

- Docs provide executable guidance.
- Security controls are explicit and testable.
- Cross-doc contradictions do not exist.
