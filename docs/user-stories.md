# User Stories

## Core attendee journeys

1. As a **new member / first-time attendee**, I can scan a QR code and complete signup in about 30 seconds so I can participate without setup friction.
2. As a **returning regular member**, I can quickly rejoin and update my help-needed/help-offered profile so my info reflects what I need right now.
3. As an **event attendee with privacy concerns**, I can submit my info knowing email is never shown publicly.
4. As an **attendee**, I can opt in to showing title/company only when I explicitly consent.
5. As an **attendee**, I can provide my AI comfort level so sessions can adapt to room maturity.

## Organizer and facilitation journeys

6. As an **event organizer**, I can view the live room board and count in near real time for facilitation decisions.
7. As an **organizer**, I can see aggregate AI comfort distribution to tune pace and examples.
8. As a **facilitator**, I can generate deterministic top-N intro suggestions so I have a reproducible starting queue.
9. As a **facilitator**, I can review a queue of suggested matches with score context and privacy-safe attendee fields.
10. As a **facilitator**, I can approve or reject each suggestion and attach a reason so event introductions are intentional.
11. As an **ops lead**, I can detect and mitigate spam/abuse without exposing private data or shutting the event down.
12. As an **operator**, I can run a pre-demo checklist and get a clear go/no-go signal.

## Governance, security, and maintainer journeys

13. As a **security reviewer**, I can verify that public reads never expose email and that RLS is enforced.
14. As a **privacy steward**, I can audit consent behavior for title/company exposure and verify match APIs/UI avoid private-field leakage.
15. As a **maintainer**, I can validate deterministic match reproducibility and decision audit event integrity before release.
16. As a **Dallas maintainer**, I can onboard quickly from docs and run local verification with deterministic commands.
17. As a **contributor**, I can add features while preserving the database-boundary privacy model.

## Out-of-scope (for current beta)

- As an attendee, I can sign in with OAuth/SSO.
- As an attendee, I can self-serve profile editing/history after signup.
- As an organizer, I can run advanced analytics dashboards beyond room-level aggregates.
