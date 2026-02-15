# Asset and Icon Policy

## Dallas AI logo assets

Use Dallas AI logos as first-party brand assets for demo-facing UI and documentation.

| Asset | Path | Approved usage |
| --- | --- | --- |
| Dallas AI logo (color) | `public/brand/dallas-ai-logo-color.png` | Light backgrounds in app shell, hero, and docs |
| Dallas AI logo (white) | `public/brand/dallas-ai-logo-white.png` | Dark backgrounds in demo slides and screenshots |

Rules:
- Use logo files exactly as stored; do not alter colors or proportions.
- Keep clear space of at least 16px around the logo.
- Keep rendered logo width at or above 120px desktop and 96px mobile.
- Keep Dallas AI logo visible above fold on the primary demo surface.

## Approved icon usage

Use lightweight, open icon assets for UI indicators in alpha.

Approved categories:
- Privacy lock icon
- LinkedIn glyph icon
- Status/check icon
- Info tooltip icon

Rules:
- Use icons from permissive licenses only.
- Keep icon stroke and size consistent.
- Keep icon color restrained for projector readability.

## LinkedIn icon policy

- Show icon only on room board.
- Open in new tab.
- Include `aria-label` for accessibility.
- Do not display raw LinkedIn URL text.

## Fallback strategy

If the preferred icon set fails:
1. Use inline SVG fallback in the component.
2. Use Unicode/text fallback as last resort.
3. Keep behavior and accessibility labels unchanged.

## Security and privacy guardrails

- Never use icons or badges that imply false compliance claims.
- Never expose email through tooltip, title attribute, or hidden text.
- Keep public text aligned with projection boundary language.

## Non-endorsement

This repository references Geist-style conventions for design direction.
It does not claim official endorsement by Vercel or Geist.

## Skills used

- Source scan attempted: `~/.codex/skills` (directory not present in current environment)
- Applied: repository `agents.md` standards and testable requirement style
- Notes: Added first-party Dallas AI logo inventory and placement constraints.
