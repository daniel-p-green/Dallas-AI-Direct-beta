# UI Patterns (Modern Professional Card Interface)

This document defines reusable UI patterns for Dallas AI Direct Alpha and v0 production-track surfaces. The system uses Dallas AI-first visual identity, layered cards, and high-trust enterprise clarity. This project does not claim official endorsement by Vercel or Geist.

## Hero Banner

### Purpose
Set immediate credibility, communicate privacy posture, and route users to action in one viewport.

### Required Content
- Dallas AI logo lockup at top-left using approved asset from `public/brand`
- Eyebrow label: `ALPHA DEMO`
- Outcome-focused headline (single sentence)
- Supporting line that states public and private data boundaries
- Primary action: `Join via QR`
- Secondary action: `View Room Board`

### Layout and Visual Spec

| Element | Requirement |
| --- | --- |
| Container | 12-column layout with max width 1200px |
| Surface | Layered panel with `--shadow-card-lg` and subtle border |
| Background | Soft mesh gradient with low-noise texture |
| Typography | Display heading with `--font-display` and balanced wrapping |
| CTA treatment | Primary solid button + secondary ghost button with hover lift |

### States
- Default: headline, boundary copy, and both actions visible.
- Compact: headline and primary action remain visible on narrow screens.
- Reduced-motion: load sequence disables non-essential transitions.

### Do / Don't
- Do keep headline concise and readable from projector distance.
- Do keep high text contrast against the background.
- Do keep copy in active voice.
- Do keep Dallas AI logo visible without distortion at all responsive breakpoints.
- Do provide visible focus state on all hero actions.
- Don't introduce promotional claims or endorsement language.
- Don't include attendee email or any private field in banner content.

## QR Signup Card

### Purpose
Collect required attendee inputs quickly while preserving privacy boundaries and perceived quality.

### Required Content
- Required inputs: name, email, comfort level, help-offer arrays
- Optional inputs grouped under `Optional profile`
- Consent acknowledgment near title and company fields
- Privacy note next to submit action

### Layout and Visual Spec

| Element | Requirement |
| --- | --- |
| Card shell | Elevated card (`--shadow-card-md`) with 16px radius |
| Grouping | Use sectional card blocks for required vs optional inputs |
| Labels | Persistent labels above controls; no placeholder-only labels |
| Error text | Inline and adjacent to failing field |
| Submit row | Sticky-on-mobile action row with clear loading state |

### States
- Empty: required fields visible, submit enabled until request starts.
- Validation error: concise inline guidance for the affected field.
- Submitting: loading indicator with controls locked.
- Success: confirmation message without exposing private fields.

### Do / Don't
- Do place required fields before optional fields.
- Do keep validation text brief and action-oriented.
- Do state privacy constraints near submission.
- Do ensure touch targets remain at or above 44x44px.
- Don't request non-essential data for demo scope.
- Don't render submitted email in any success or follow-up UI.

## Public Room Board

### Purpose
Show who is in the room with a premium, scan-friendly card grid while enforcing public-safe data boundaries.

### Required Content
- Header title for the room board
- Dallas AI logo lockup in board chrome or shared shell
- Badge: `Public view - emails excluded`
- Last-updated timestamp
- Metrics row: total attendees, comfort summary, high-comfort rate
- Attendee list sorted newest first

### Layout and Visual Spec

| Element | Requirement |
| --- | --- |
| Metrics row | 3-card or 4-card responsive stat grid with tabular numbers |
| Attendee card | Name block + capability chips + comfort indicator + LinkedIn icon action |
| Card behavior | Default `--shadow-card-sm`, hover `--shadow-card-hover` |
| Density | One primary row per attendee with optional secondary metadata row |
| Empty state | Dedicated card with action to return to signup |

### States
- Empty: zero-state message and prompt to join via QR.
- Populated: metrics and attendee rows visible.
- Refreshing: subtle status indicator without layout shift.

### Do / Don't
- Do read only from the public projection (`attendees_public`).
- Do keep row height stable to prevent visual jitter.
- Do represent LinkedIn with icon-only treatment when present.
- Do keep Dallas AI logo treatment consistent with the hero and signup pages.
- Do clamp long text and keep cards readable at 375px width.
- Don't include private identifiers, including email.
- Don't infer or display data that users did not provide.

## Privacy Notice Row

### Purpose
Reinforce privacy behavior where users make data-entry decisions.

### Required Content
- Canonical message: `Email stays private and is never displayed publicly on the room board.`
- Optional short link to privacy documentation

### Layout and Visual Spec

| Element | Requirement |
| --- | --- |
| Placement | Directly above submit row or directly below it |
| Style | Neutral surface chip with lock icon and subdued border |
| Tone | Direct and plain language with no legal overstatement |

### States
- Inline default: visible under signup actions.
- Contextual repeat: visible near public board entry points.

### Do / Don't
- Do keep the message plain, direct, and consistent across surfaces.
- Do preserve meaning if wording is shortened for layout.
- Do announce async status updates through `aria-live="polite"`.
- Don't add legal guarantees beyond implemented behavior.
- Don't reference third-party endorsement or certification.

## Interaction and Motion Baseline

| Category | Requirement |
| --- | --- |
| Hover timing | 150-220ms |
| Transition properties | `transform`, `opacity`, `box-shadow`, `background-color` only |
| Reduced motion | Disable decorative motion when user preference is reduce |
| Focus visuals | Use high-contrast `:focus-visible` ring on all controls |
| Empty/loading | Always show explicit visual feedback and next action |

## Skills used

- `/Users/danielgreen/.codex/skills/frontend-design/references/claude-code-plugin/skills/frontend-design/SKILL.md`
- `/Users/danielgreen/.agents/skills/ui-ux-pro-max/SKILL.md`
- `/Users/danielgreen/.agents/skills/web-design-guidelines/SKILL.md`
