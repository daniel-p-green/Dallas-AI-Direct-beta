# Privacy and consent (Beta)

## Data collected

- `name`
- `title` (optional)
- `company` (optional)
- `linkedin_url`
- `email` (sensitive)
- `ai_comfort_level`
- `help_needed`
- `help_offered`

## Purpose limitation

- Use attendee data to support live room visibility and peer matching.
- Do not use attendee data for unrelated marketing in beta.
- Process only the fields required for documented product behavior.

## Who can see what

| Data field | Public room view (`attendees_public`) | Internal table (`attendees`) |
| --- | --- | --- |
| `name` | Yes | Yes |
| `title` | Yes, if provided and consented | Yes |
| `company` | Yes, if provided and consented | Yes |
| `linkedin_url` | Yes | Yes |
| `email` | No | Yes |
| `ai_comfort_level` | Yes | Yes |
| `help_needed` | No | Yes |
| `help_offered` | Yes | Yes |

Directory reads must come from `attendees_public` only.

## Retention assumptions for beta

- Keep data only for short-term pilot evaluation.
- Default target: purge within 30 days after event close unless an
  extension receives explicit approval.
- Track retention decisions per event run.

## Opt-out and deletion process for beta

1. Attendee submits deletion request through organizer channel.
2. Operator verifies requestor control of submitted email.
3. Operator deletes row from `attendees`.
4. Operator confirms removal from `attendees_public` output.
5. Operator logs completion without sensitive values.

## Skills used

- Scanned `~/.codex/skills` and found `antfarm-workflows/SKILL.md`.
- No privacy-specific skill exists there today, so this file applies
  repository privacy standards directly.