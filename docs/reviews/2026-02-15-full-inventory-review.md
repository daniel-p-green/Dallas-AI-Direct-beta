# 2026-02-15 Full Inventory + Code/Docs Review (branch: `test`)

## Executive Summary

Dallas AI Direct Beta is structurally solid for a small OSS demo app (clean Next.js surface, passing gates, clear privacy intent), but it currently has **critical implementation/documentation drift** that can break onboarding and weaken its privacy-first claim if left unresolved.

- **What is good:** `typecheck`, `test`, and `build` all pass; public read path uses `attendees_public`; signup path is parameterized SQL; docs clearly state free OSS/privacy-first intent.
- **Top risks:**
  1. **No tracked SQL migration for core `attendees` + `attendees_public` + RLS/grants** (docs-only), so a fresh maintainer cannot reproducibly stand up the system.
  2. **Unvalidated `linkedin_url` can carry unsafe schemes** and is rendered as clickable `href`.
  3. **Beta/Alpha naming and path/process drift** across app/docs/tests can cause release confusion and stale runbooks.
- **Repo hygiene:** inventory is heavily weighted to static assets (164/256 tracked files), with a very large font/vendor payload and apparently unused duplicate brand trees.

---

## Scope and method

Reviewed `/Users/danielgreen/corex/Dallas-AI-Direct-beta` on branch `test`.

Checks run:
- `npm run typecheck` ✅
- `npm test` ✅ (25/25)
- `npm run build` ✅
- Targeted static sanity checks:
  - `rg` scan for direct `attendees` read patterns vs `attendees_public`
  - `rg` scan for alpha/beta naming and paid/subscription messaging
  - tracked file inventory + size analysis (`git ls-files`, `du`, extension/category aggregation)

---

## 1) Full tracked-file inventory

### 1.1 Inventory totals

- **Tracked files:** 256
- **Approx tracked size:** 17.79 MB
- **Binary-like assets:** 153 files (`.png/.svg/.otf/.ttf/.woff2/...`)
- **Files >= 100 KB:** 87

### 1.2 Files grouped by category

| Category | Count |
|---|---:|
| Root configs/meta | 13 |
| GitHub automation/templates | 5 |
| Frontend app (app excl `app/api`) | 7 |
| API routes (`app/api`) | 2 |
| Shared server lib | 1 |
| DB migrations | 2 |
| Documentation (`docs/`) | 30 |
| Tests/validation (`tests/`) | 23 |
| Ops runbooks/checklists (`ops/`) | 4 |
| Plans (`plans/`) | 4 |
| Prompt/process notes (`prompts/`) | 1 |
| Static assets (`public/`) | 164 |

### 1.3 Extension distribution (high level)

| Extension | Count |
|---|---:|
| `.md` | 55 |
| `.ttf` | 45 |
| `.woff2` | 45 |
| `.otf` | 41 |
| `.png` | 12 |
| `.svg` | 10 |
| `.ts` | 6 |
| `.tsx` | 5 |
| `.mjs` | 6 |
| `.sql` | 2 |

### 1.4 Notable large/binary artifacts

Largest tracked artifacts are mostly font/source files in `public/brand/geist-font/**` and mirrored vendor brand assets.

Top examples:
- `public/brand/geist-font/GeistPixel/otf/GeistPixel-Circle.otf` (~1.17 MB)
- `public/brand/geist-font/GeistPixel/otf/GeistPixel-Grid.otf` (~487 KB)
- `public/brand/geist-font/GeistPixel/otf/GeistPixel-Triangle.otf` (~373 KB)
- `public/brand/sources/geist-introduction-source.html` (~250 KB)
- `public/brand/sources/geist-colors-source.html` (~231 KB)

Also present as duplicate-like vendor paths:
- `public/brand/Vercel/**`
- `public/brand/assets/vercel/**`

No app/runtime references were found to these vendor trees in code/docs tests.

---

## 2) Dead files, stale docs, naming inconsistencies, process/branch mismatches

### Likely dead/unused or low-value tracked artifacts

1. **Unused duplicate vendor assets**
   - `public/brand/Vercel/**`
   - `public/brand/assets/vercel/**`
   - Risk: unnecessary repo bloat, unclear source of truth.

2. **Large local Geist font/source payload appears unused at runtime**
   - `public/brand/geist-font/**`
   - Runtime uses package import (`geist/font/sans`, `geist/font/mono`) in `app/layout.tsx`, not local font files.
   - Risk: large artifact surface with little demonstrated value.

### Stale/misaligned docs/process signals

1. **Pre-demo path points to wrong repo and wrong casing/name**
   - `docs/PRE-DEMO-COMMAND-CARD.md` references `/Users/danielgreen/corex/dallas-ai-direct-alpha`.

2. **Alpha naming persists across Beta repo**
   - e.g., `app/layout.tsx`, `app/page.tsx`, `docs/PLAN.md`, `docs/privacy-and-consent.md`, `docs/roadmap.md`, several tests.
   - Risk: product identity drift and confusing external messaging.

3. **Duplicate section in START-HERE**
   - `docs/START-HERE.md` has duplicated “Branch policy” block.

4. **`progress.txt` run/task metadata stale**
   - still identifies “Dallas AI Direct Alpha” and older assumptions (e.g., “repo does not currently define npm scripts”).

### Branch/process posture

- `docs/branch-strategy.md` states implementation should occur on `test`; review performed on `test` branch (aligned).
- Process quality risk is primarily doc drift, not branch-rule violation.

---

## 3) App/API/DB/tests/docs correctness + security/privacy posture review

### App/API

- ✅ Public API reads from `attendees_public` only:
  - `app/api/attendees/public/route.ts`
- ✅ Signup insert uses parameterized query (postgres template literal):
  - `app/api/attendees/signup/route.ts`
- ⚠️ Input validation is minimal and allows unsafe URL schemes:
  - `linkedin_url` accepted as arbitrary string and rendered as anchor in `app/room/page.tsx`.
- ⚠️ Abuse control documented but not implemented in route path (no real throttling/velocity control).
- ⚠️ `other_help_needed` / `other_help_offered` exist in schema and API payload but are not collected in UI.

### DB/migrations

- ✅ New migrations for match engine + abuse/trust are present and tested for contract shape.
- ❌ No tracked migration for base `attendees` table + `attendees_public` view + RLS policies/grants (only documented in markdown).
  - This is a reproducibility and security-governance gap.

### Tests

- ✅ CI-local gate scripts pass (`typecheck/test/build`).
- ⚠️ Many “tests” are markdown test plans rather than executable checks.
- ⚠️ No direct automated runtime tests for API behavior (duplicate email path, malformed payload edge cases, URL-scheme sanitization, 429 behavior).

### Docs/product intent alignment

- ✅ README clearly states free OSS and “not paid subscription product” (aligned to request).
- ⚠️ Alpha/Beta mixed language across docs and UI weakens positioning consistency.
- ⚠️ Some docs include environment/tooling “Skills used” boilerplate that does not reflect current environment state; maintainability noise.

---

## 4) Prioritized findings (P0/P1/P2) with exact paths and concrete fixes

## P0 (fix first)

### P0-1: Missing executable base schema/RLS migration blocks reproducible secure setup
- **Paths:**
  - Missing under `db/migrations/` (no migration for `public.attendees`, `public.attendees_public`, RLS enable/force, policies, grants)
  - Current spec only in `docs/rls-policies.md`
- **Why critical:** Fresh setup can silently diverge from documented privacy boundary; “DB-enforced privacy” claim becomes non-deterministic.
- **Concrete fix:**
  1. Add migration file (e.g., `db/migrations/20260215xx_core_attendees_rls.sql`) with exact DDL/policies/grants now in docs.
  2. Add executable schema contract tests (table/view/policy/grant existence).
  3. Update docs to reference migration as source of truth, markdown as narrative.

### P0-2: `linkedin_url` scheme not constrained; clickable unsafe URI risk
- **Paths:**
  - `app/api/attendees/signup/route.ts` (validation)
  - `app/room/page.tsx` (anchor rendering)
- **Why critical:** Malicious `javascript:` or non-http(s) URI could be stored and clicked from public board.
- **Concrete fix:**
  1. Validate URL server-side (`new URL`) and allow only `https:` (or `http/https` if required).
  2. Normalize or reject invalid schemes with 400.
  3. In UI, render link only when URL passes a safe protocol check; otherwise omit CTA.
  4. Add API + UI tests for malicious URL payloads.

## P1 (important)

### P1-1: Beta/Alpha naming drift and stale runbook path
- **Paths:**
  - `app/layout.tsx`
  - `app/page.tsx`
  - `docs/PLAN.md`
  - `docs/privacy-and-consent.md`
  - `docs/roadmap.md`
  - `docs/PRE-DEMO-COMMAND-CARD.md`
  - `progress.txt`
  - related tests asserting Alpha copy (`tests/app-shell.test.mjs`, etc.)
- **Concrete fix:**
  1. Decide canonical release name now (`Beta` vs `Alpha`).
  2. Update UI metadata/copy + docs + tests in one synchronized PR.
  3. Fix command card repo path to actual repo path/casing.

### P1-2: Abuse-throttling is documented but not implemented
- **Paths:**
  - `app/api/attendees/signup/route.ts`
  - `docs/security.md`, `docs/OPEN-TODO.md`
- **Concrete fix:**
  1. Add minimal IP+UA keyed rate limiter (edge-safe or server store-backed).
  2. Return explicit `429` with retry guidance.
  3. Add deterministic tests for burst behavior.

### P1-3: Executable coverage is thin for critical API contracts
- **Paths:**
  - `tests/*.test.mjs` (currently focused on docs/migration contracts)
- **Concrete fix:**
  1. Add route-level tests for signup success, duplicate (409), invalid comfort (400), invalid URL scheme (400), honeypot behavior.
  2. Add contract test that public API payload excludes `email` and never returns raw `@` in intended fields.

## P2 (hygiene/polish)

### P2-1: Repo asset bloat and likely dead vendor/font trees
- **Paths:**
  - `public/brand/Vercel/**`
  - `public/brand/assets/vercel/**`
  - `public/brand/geist-font/**`
- **Concrete fix:**
  1. Inventory actual runtime usage and keep only required artifacts.
  2. Move archival/source assets to release artifact storage or separate design-assets repo.
  3. Document a single canonical asset tree.

### P2-2: Duplicate/boilerplate doc noise
- **Paths:**
  - `docs/START-HERE.md` (duplicate branch policy block)
  - multiple `docs/*.md` “Skills used” sections with inconsistent environment claims
- **Concrete fix:**
  1. Remove duplicate sections.
  2. Standardize footer policy (or drop entirely) for cleaner maintainer docs.

---

## 5) Clarification questions (concise)

1. **Canonical stage name now:** should public copy/docs/tests be fully `Beta`, or keep `Alpha` until a specific milestone?
2. **Core schema source of truth:** do you want base `attendees`/RLS moved into tracked SQL migration immediately, with docs secondary?
3. **LinkedIn policy:** should links be strictly `https://linkedin.com/*` (tight allowlist) or any `https` URL?
4. **Asset strategy:** should heavyweight font/vendor source assets live in this app repo, or be trimmed to runtime-only assets?
5. **`other_help_*` fields:** implement UI capture now, or formally de-scope and remove from API/schema/docs for this phase?

---

## Tiny safe fixes that are obvious (proposed, not applied)

- Fix wrong repo path in `docs/PRE-DEMO-COMMAND-CARD.md`.
- Remove duplicate “Branch policy” section in `docs/START-HERE.md`.
- Normalize Alpha/Beta label in `app/layout.tsx` metadata/title once canonical stage is confirmed.

