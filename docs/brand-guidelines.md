# Brand Guidelines (Dallas AI Modern Professional System)

This document defines the interface design system for Dallas AI Direct Alpha and the v0 production build. Dallas AI branding leads every surface. The team uses Geist-style conventions as implementation support only. We do not claim official Vercel endorsement, partnership, or certification.

## Design Direction

Use a modern, professional, trust-first visual language that feels like a live intelligence workspace, not a generic directory.

| Attribute | Requirement |
| --- | --- |
| Visual tone | Clean editorial layout with depth and deliberate contrast |
| Signature motif | Elevated cards with controlled drop shadows and subtle surface layers |
| First impression target | "Professional operations console for real-world events" |
| Avoid | Flat list-only pages, low-contrast surfaces, generic utility-dashboard look |

## Typography

Use a distinctive but highly readable pairing with clear hierarchy.

| Token | Value | Usage |
| --- | --- | --- |
| `--font-display` | `"Lexend", "Avenir Next", "Segoe UI", sans-serif` | Page titles, section titles, high-signal labels |
| `--font-body` | `"Source Sans 3", "Segoe UI", sans-serif` | Body copy, forms, table cells |
| `--font-data` | `"Geist Mono", "SFMono-Regular", monospace` | Metrics, counters, timestamps |

Type scale:
- H1: 40/44, 700
- H2: 30/36, 650
- H3: 22/30, 600
- Body: 16/24, 400-500
- Caption: 14/20, 400

Rules:
- Keep line length between 55 and 75 characters for paragraph content.
- Keep headings in Title Case for section labels and action headers.
- Use true ellipsis glyph `…` in loading states and truncation UI.

## Spacing

Use a 4px baseline grid with larger rhythm steps for premium whitespace.

| Token | Value |
| --- | --- |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-12` | 48px |
| `--space-16` | 64px |

Rules:
- Keep card padding at 24px desktop and 16px mobile minimum.
- Keep vertical gap between major sections at 32px to 64px.
- Keep interactive touch targets at or above 44x44px.

## Color Usage

Use a light-first executive palette with strong text contrast and measured accents.

| Role | Hex | Purpose |
| --- | --- | --- |
| Canvas | `#F4F7FB` | Page background |
| Primary Surface | `#FFFFFF` | Cards, panels, forms |
| Secondary Surface | `#EEF3F9` | Nested containers, chips |
| Primary Text | `#0D1B2A` | Headings and critical copy |
| Secondary Text | `#3E5368` | Supporting copy |
| Brand Blue | `#0F6CBD` | CTA and focus ring anchor |
| Accent Cyan | `#06B6D4` | Highlights and data accents |
| Success | `#0E9F6E` | Positive status |
| Warning | `#C27A0A` | Caution status |
| Danger | `#C53D3D` | Error status |

Rules:
- Meet WCAG AA contrast minimum for all text and control states.
- Use accent colors for intent and hierarchy, not decoration.
- Keep gradients subtle and limited to hero backgrounds and badges.
- Do not use purple-heavy default SaaS gradients.

## Card and Shadow System

Use cards as the primary compositional unit across signup, room board, and admin surfaces.

| Token | CSS value | Use |
| --- | --- | --- |
| `--radius-card` | 16px | Card corners |
| `--border-card` | `1px solid rgba(13, 27, 42, 0.10)` | Card edge definition |
| `--shadow-card-sm` | `0 6px 18px rgba(13, 27, 42, 0.08)` | Secondary cards |
| `--shadow-card-md` | `0 14px 36px rgba(13, 27, 42, 0.12)` | Primary cards |
| `--shadow-card-lg` | `0 24px 56px rgba(13, 27, 42, 0.16)` | Hero/stat highlight cards |
| `--shadow-card-hover` | `0 18px 42px rgba(13, 27, 42, 0.18)` | Hover lift state |

Rules:
- Apply `--shadow-card-md` on default interactive cards.
- Increase only one shadow step on hover; do not scale cards more than 1.5%.
- Pair every shadowed card with a subtle border to maintain crispness.
- Keep card stacks to 1-3 depth layers; avoid heavy neumorphic effects.

## Icon Rules

Use one SVG icon set with consistent stroke geometry.

- Use 16px inline icons and 20-24px control icons.
- Keep decorative icons `aria-hidden="true"`.
- Keep icon-only buttons labeled with `aria-label`.
- Keep hover and focus states visible on icon controls.

Rules:
- Do not mix emoji and SVG icons in production surfaces.
- Do not use branded third-party logos as primary UI icons.
- Keep icon alignment pixel-consistent inside cards and table rows.

## Logo System

Use Dallas AI logo assets as the primary visual brand signal.

- **Primary logo asset:** `public/brand/dallas-ai-logo-color.png`
- **Inverse logo asset:** `public/brand/dallas-ai-logo-white.png`
- **Minimum rendered width:** 120px desktop, 96px mobile
- **Clear space:** 16px minimum on all sides
- **Required placements:** shared shell header, hero region, and demo runbook captures

Rules:
- Use color logo on light surfaces and white logo on dark surfaces.
- Keep original aspect ratio; do not stretch or crop.
- Do not apply glows, recolors, filters, or shadows directly to the logo file.
- Keep Dallas AI brand mark visually dominant over framework cues.

## Motion and Interaction

Use motion to communicate state changes and focus attention.

| Interaction | Requirement |
| --- | --- |
| Micro-interaction duration | 150-220ms |
| Card hover | Shadow lift + slight translateY (-2px max) |
| Enter animations | Opacity + translateY only |
| Reduced motion | Disable non-essential animation under `prefers-reduced-motion` |

Rules:
- Animate `transform` and `opacity` only.
- Avoid `transition: all`; specify transition properties explicitly.
- Keep loading states visible and labeled with `Loading…` or `Saving…`.

## Accessibility Guardrails

Design every interface for keyboard usage, readability, and trust.

- Keep visible `:focus-visible` indicators on all interactive elements.
- Keep semantic element mapping: `<button>` for actions and `<a>/<Link>` for navigation.
- Keep form controls paired with explicit labels and meaningful names.
- Keep async status messaging in `aria-live="polite"` regions.
- Keep headings hierarchical and include skip-link behavior in shared layout.
- Keep mobile and desktop flows free from horizontal overflow.

Privacy guardrail:
- Attendee email never appears in any public-facing UI, including room boards, hero counters, and shared screenshots.

Messaging guardrail:
- Reference Geist-style conventions as inspiration only and do not claim official Vercel endorsement.

## Delivery Checklist

- [ ] Shared shell uses Dallas AI logo and card depth system.
- [ ] Primary surfaces use card-based composition, not plain list blocks.
- [ ] Typography and color tokens match this document.
- [ ] Focus, hover, disabled, and loading states exist for all interactive components.
- [ ] Public surfaces exclude `email` in UI and payload contracts.

## Skills used

- `/Users/danielgreen/.codex/skills/frontend-design/references/claude-code-plugin/skills/frontend-design/SKILL.md`
- `/Users/danielgreen/.agents/skills/ui-ux-pro-max/SKILL.md`
- `/Users/danielgreen/.agents/skills/web-design-guidelines/SKILL.md`
