# Use Cases

## In-scope beta use cases

| Use Case | Primary actor | Trigger | System behavior | Success criteria |
|---|---|---|---|---|
| First-time event signup via QR | New member / attendee | Scans event QR link | Presents signup form, validates input, inserts attendee record | Signup completed in ~30s; record accepted |
| Returning member quick re-entry | Regular member | Revisits signup URL at new event | Accepts updated profile/help fields with duplicate-safe behavior | User updates are handled cleanly without data leakage |
| Public-safe room board display | Organizer / facilitator | Opens `/room` during live event | Reads from `attendees_public` projection only, refreshes regularly | Board updates within ~5s and shows no email |
| Consent-based profile display | Attendee | Chooses whether to show title/company | Stores consent flag and conditionally exposes optional profile fields | Title/company appear only with explicit consent |
| AI comfort pulse check | Organizer | Reviews room distribution | Aggregates comfort levels for session pacing | Aggregate view available without exposing private fields |
| Networking facilitation | MC / organizer | Uses help-needed/help-offered data | Displays public-safe capability tags for intros | Intros can be made from board signals |
| Abuse resistance during live event | Ops lead | Detects suspicious signup traffic | Applies validation + throttling strategy and continues service | Abuse reduced without full outage |
| Privacy boundary verification | Security reviewer | Runs pre-demo checks | Verifies RLS, projection boundary, and non-exposure of email | All privacy checks pass go/no-go gate |
| Demo readiness gate | Operator | Before event start | Runs runtime validation + build/test checks | Deterministic pass/fail decision before going live |
| Maintainer onboarding | Dallas dev maintainer | Clones repo | Follows README + CONTRIBUTING + docs to run app locally | Local run + test + build succeed |

## Role coverage checklist

- [x] New member / first-time attendee
- [x] Regular member
- [x] Event attendee with privacy expectations
- [x] Organizer / facilitator
- [x] Ops/security reviewer
- [x] Maintainer/contributor

## Out-of-scope use cases (current beta)

- SSO-based attendee authentication
- Multi-event account history and profile management
- Full admin moderation panel
- CRM/payment integration

## Skills used

- Scanned `~/.codex/skills` and found `github/SKILL.md` relevant for maintainer workflow operations.
- No dedicated use-case modeling skill exists in available skills.
- Applied repository documentation standards directly.
