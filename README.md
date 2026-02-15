# Dallas AI Direct – Beta (Open Source)

Reference implementation for a governed, community-owned attendee directory built for live events.

---

## Open Source Status

- License: MIT (`LICENSE`)
- Intended maintainers: Dallas AI developer community
- Handoff/process notes: `GOVERNANCE.md`
- Contribution guide: `CONTRIBUTING.md`

## Executive Summary

Dallas AI Direct Beta is a free, open-source attendee directory for live events, built with privacy and governance at the database boundary. It is not a paid membership product. The architecture enforces access with Postgres RLS and a projection view (`attendees_public`) that excludes email from public reads. The design uses explicit consent for optional profile visibility and keeps sensitive data private by default. The live demo proves a simple hero moment: QR signup in about 30 seconds, room board update within 5 seconds, and no public email exposure. This repository demonstrates a repeatable AI Infrastructure Sprint pattern that delivers a working artifact in hours, not a slide deck.

---

## Product and Pricing Clarification

- **Dallas AI Direct (this repo):** free, open-source event directory software.
- **Meetups subscription (separate context):** paid model, currently referenced as **$15/user**.
- This repository should not blend those two models in product copy or ROI framing.

## Business Constraint

Teams need real-time attendee visibility during events without exposing private attendee data and without relying on opaque third-party access controls.

## Practical value delivered

- Replace dependency risk with owned, auditable infrastructure.
- Keep email private by design, enforced at the DB boundary.
- Preserve optional profile visibility through explicit attendee consent.
- Improve operator confidence with deterministic pre-demo validation gates.

---

## Hero Moment

Attendees scan a QR code, submit in about 30 seconds, and appear on the room board within 5 seconds. The board reads only public-safe fields. Email never appears on public surfaces. Database boundary controls enforce the policy even if UI behavior changes.

---

## Architecture Overview

```text
Client (QR + Browser)
        |
        v
API Route (Validated Insert)
        |
        v
Neon Postgres
        |
        v
RLS (Deny by Default)
        |
        v
attendees_public View
        |
        v
Room Board (Polling every 5s)
```

### Why this architecture

- Enforces access where data lives, not where rendering happens.
- Uses projection boundary (`attendees_public`) to prevent email leakage.
- Separates base table writes from public reads.
- Uses polling over realtime for demo reliability and lower operational variance.

---

## Data Model and Consent Design

### Core fields

- Required: `name`, `email`, `ai_comfort_level`, `help_needed`, `help_offered`
- Optional: `linkedin_url`, `title`, `company`, `other_help_needed`, `other_help_offered`
- Consent flag: `display_title_company` (default `false`)

### Design principles in data model

- **Least privilege:** public UI reads from projection only.
- **Projection boundary:** `attendees_public` excludes sensitive/private fields.
- **Explicit consent:** title/company display requires opt-in.
- **Sensitive-by-default:** email remains private across public flows.

---

## Security Posture

### 1) Database controls

- RLS enabled and forced on sensitive table.
- Deny-by-default select posture on base table.
- Unique index on normalized email.
- Check constraints for ranges and field limits.
- Public projection view excludes email.

### 2) Application controls

- Honeypot field for low-effort bot filtering.
- Server-side validation for payload shape and bounds.
- Optional throttling strategy for burst abuse.
- Escaped rendering to reduce injection risk.

### 3) STRIDE summary

| Threat | Primary mitigation | Residual risk |
| --- | --- | --- |
| Spoofing | Honeypot + validation | Moderate in anonymous alpha |
| Tampering | Server validation + DB constraints | Low to moderate |
| Repudiation | Event logs + timestamps | Moderate |
| Information disclosure | RLS + `attendees_public` boundary | Low if controls stay enforced |
| Denial of service | Throttling + fallback mode | Moderate under hostile traffic |
| Elevation of privilege | No public base-table reads | Low to moderate |

---

## Runtime Validation Discipline

Pre-demo runtime validation is a release gate.

- Preflight SQL checks for table/view access behavior
- Email non-exposure verification in payload and UI
- Duplicate insert rejection check
- Comfort-level bounds check
- XSS rendering sanity check
- Mobile QR sanity checklist for iPhone Safari and Android Chrome

Go/No-Go requires all privacy and boundary checks to pass.

References:
- `docs/runtime-validation.md`
- `ops/preflight.md`
- `tests/ui-mobile-audit.md`

If documentation conflicts, prioritize:
1. `docs/rls-policies.md`
2. `docs/runtime-validation.md`
3. `docs/PRD.md`

---

## Why this is not just a directory

This implementation acts as a projection-bound identity and capability mapping layer. It demonstrates a reusable pattern for governed AI-enabled workflows inside organizations. The value is not the UI alone. The value is constraint removal with enforceable controls.

---

## AI Infrastructure Sprint Model

1. Constraint mapping
2. Architecture and governance design
3. Working alpha delivery
4. ROI framing and roadmap handoff

This sprint produces a working artifact, not a slide deck.

---

## Quickstart (10 minutes)

### Prerequisites
- Node 20+
- A Neon Postgres database

### 1) Install and configure

```bash
npm ci
cp .env.example .env.local # or create .env.local manually
```

Set:

```bash
DATABASE_URL=postgres://...
```

### 2) Apply database schema + policies

Follow:
- `docs/data-model.md`
- `docs/rls-policies.md`

### 3) Run locally

```bash
npm run dev
```

Open:
- `http://localhost:3000/signup`
- `http://localhost:3000/room`

### 4) Validate before demo

```bash
npm run typecheck
npm test
npm run build
```

Also run the privacy/runtime checks in:
- `docs/runtime-validation.md`
- `ops/preflight.md`

## Setup Overview (High level)

### Stack

- Next.js
- Neon Postgres
- Postgres RLS policies

### Environment variables

- `DATABASE_URL` (server-side only)

### Setup outline

1. Provision Neon project.
2. Apply schema and RLS docs.
3. Start app locally.
4. Run runtime validation checks.

References:
- `docs/data-model.md`
- `docs/rls-policies.md`

---

## Design Principles

- Enforce access at the database boundary.
- Never expose sensitive fields on public surfaces.
- Prefer reliability over flash.
- Build the smallest system that proves constraint removal.
- Make consent explicit and default-safe.
- Keep operational knobs separate from reference artifacts.

---

## What we deliberately did not do

- No OAuth/SSO flows in alpha.
- No realtime subscription dependency for demo path.
- No marketing or compliance claims.
- No schema overreach beyond current constraint.
- No dependency expansion outside core stack.

---

## Repository Navigation

- `docs/` architecture, security, policy, runbooks, and open TODOs (`docs/OPEN-TODO.md`)
- `tests/` validation plans and smoke checks
- `ops/` operational checklists and incident guidance
- `prompts/v0/` deterministic UI build orchestration
- `v0-build/` isolated non-code context + brand pack + target workspace for v0-generated build output

## Design System

For demo-facing UI, use the minimal design system package:
- `docs/brand-guidelines.md`
- `docs/ui-patterns.md`
- `docs/assets.md`

Brand implementation rule:
- Dallas AI logo assets in `public/brand/` are required on shared demo shell and hero-facing surfaces.

---

## Closing

This repository demonstrates how to replace vague AI readiness discussions with a governed, working system in hours.

We build this pattern inside organizations around revenue constraints.
