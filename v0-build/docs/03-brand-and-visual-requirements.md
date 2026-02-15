# Brand and Visual Requirements for v0 Build

## Brand direction

Build a Dallas AI-first interface with a modern professional card system. Use Geist-style implementation conventions for engineering reliability only. Keep Dallas AI identity visibly dominant.

## Approved logo assets

| Asset | Path | Use case |
| --- | --- | --- |
| Dallas AI color logo | `v0-build/brand/dallas-ai-logo-color.png` | Light surfaces and default shell |
| Dallas AI white logo | `v0-build/brand/dallas-ai-logo-white.png` | Dark overlays or dark hero bands |

## Required placements

| Surface | Requirement |
| --- | --- |
| Shared shell header | Show Dallas AI color logo on light surfaces |
| Hero section | Show Dallas AI logo above headline or in top lockup |
| Public board shell | Keep Dallas AI logo visible in shell chrome |

## Card depth and shadow requirements

| Token | CSS value | Usage |
| --- | --- | --- |
| `--shadow-card-sm` | `0 6px 18px rgba(13, 27, 42, 0.08)` | Secondary cards |
| `--shadow-card-md` | `0 14px 36px rgba(13, 27, 42, 0.12)` | Primary cards |
| `--shadow-card-hover` | `0 18px 42px rgba(13, 27, 42, 0.18)` | Hover state |

Rules:
- Use card composition for metrics, attendee rows, and form sections.
- Pair every shadowed card with a subtle border for edge definition.
- Keep hover lift subtle and professional.

## Typography and color posture

- Heading font: Lexend or equivalent modern geometric sans.
- Body font: Source Sans 3 or equivalent readable sans.
- Use high-contrast light-first palette with trust blue accent and restrained supporting accents.
- Keep active voice and enterprise tone in all visible copy.

## Accessibility and quality requirements

- Keep visible focus styles on all interactive elements.
- Keep icon-only controls labeled with `aria-label`.
- Keep loading and validation states explicit with user guidance.
- Keep motion reduced under `prefers-reduced-motion`.
- Keep public surfaces free from attendee email exposure.

## Misuse rules

- Do not remove Dallas AI logo from primary demo surfaces.
- Do not present Vercel or Geist as official product sponsor or endorser.
- Do not use third-party logos as primary brand marks.
- Do not ship flat, list-only layouts without card hierarchy.

## Skills used

- `/Users/danielgreen/.codex/skills/frontend-design/references/claude-code-plugin/skills/frontend-design/SKILL.md`
- `/Users/danielgreen/.agents/skills/ui-ux-pro-max/SKILL.md`
- `/Users/danielgreen/.agents/skills/web-design-guidelines/SKILL.md`
