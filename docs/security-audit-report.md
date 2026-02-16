# Security Audit Report — Dallas-AI-Direct-beta

Date: 2026-02-15  
Repo: `/Users/danielgreen/corex/Dallas-AI-Direct-beta`  
Branch: `security-audit-2026-02-15`

## Scope
- App code (Next.js App Router)
- Auth/session handling and access control
- API routes and input validation
- Secrets management and config hygiene
- Dependency/supply-chain risk
- SSRF/XSS/CSRF/SQLi/path traversal/insecure deserialization checks

## Method
1. Static code review of `app/api/*`, `lib/*`, `next.config.ts`, migrations, docs.
2. Dependency audit via `npm audit --json`.
3. Secret scanning with regex patterns for keys/tokens/private keys.
4. Environment file and git ignore checks.
5. Validation by test suite and reproducible commands.

---

## Prioritized vulnerability register

### 1) **CRITICAL** — Vulnerable Next.js version in production dependency
- **Finding**: `next` pinned to `15.1.11`, which included critical/high advisories (including middleware auth bypass advisory ranges).
- **Location**: `package.json` (pre-fix dependency line for `next`).
- **Exploit scenario**: Attacker targets known framework-level issues in affected versions (authorization bypass / DoS / SSRF-adjacent behavior depending on runtime path and deployment).
- **Remediation**: Upgraded to `next@15.5.12`.
- **File-level change**: `package.json:20`.
- **Verification evidence**:
  - `npm audit --json` now reports `0` vulnerabilities.

### 2) **HIGH** — Missing authentication/authorization on admin-sensitive APIs (broken access control)
- **Finding**: Admin routes were callable without any auth boundary.
- **Affected routes**:
  - `app/api/events/route.ts`
  - `app/api/matches/generate/route.ts`
  - `app/api/matches/facilitator-queue/route.ts`
  - `app/api/matches/[suggestionId]/decision/route.ts`
  - `app/api/moderation/queue/route.ts`
- **Exploit scenario**: Unauthenticated internet client can create/activate events, read moderation queues, generate/approve/reject matches, and tamper operational workflow.
- **Remediation**:
  - Added centralized admin gate helper requiring `x-admin-token` = `ADMIN_API_TOKEN`.
  - Applied gate at start of each sensitive handler.
- **File-level changes**:
  - `lib/security.ts:7-23`
  - `app/api/events/route.ts:4,105-110,145-150`
  - `app/api/matches/generate/route.ts:4,73-78`
  - `app/api/matches/facilitator-queue/route.ts:3,117-122`
  - `app/api/matches/[suggestionId]/decision/route.ts:3,65-70`
  - `app/api/moderation/queue/route.ts:3,102-107,173-178`
- **Verification evidence**:
  - Type-level compile path exercised in test run (`npm test` pass).
  - Route guards present and enforced at entry points.

### 3) **HIGH** — Missing baseline HTTP security headers
- **Finding**: No explicit CSP/HSTS/X-Frame-Options/X-Content-Type-Options/Permissions-Policy configuration.
- **Location**: `next.config.ts` was empty pre-fix.
- **Exploit scenario**: Increased risk of clickjacking, MIME sniffing abuse, and weaker browser-side containment.
- **Remediation**: Added global response headers in Next config.
- **File-level change**: `next.config.ts:3-24`.
- **Verification evidence**:
  - Header definitions present for all routes via `headers()` mapping.

### 4) **MEDIUM (Residual)** — CSRF model not fully session-based hardened
- **Finding**: App does not use cookie session auth with CSRF tokens; relies on header token for admin APIs and unauthenticated public signup.
- **Locations**:
  - `lib/security.ts`
  - `app/api/attendees/signup/route.ts`
- **Exploit scenario**: If admin token is mishandled in browser context/proxy, state-changing endpoints could be exposed.
- **Compensating controls**:
  - Explicit admin header requirement on sensitive APIs.
  - Public signup has validation, honeypot, and rate limiting.
- **Remediation plan (next)**:
  - Migrate to server-managed authenticated session (HttpOnly/Secure/SameSite cookies + CSRF token or Origin checks for state-changing requests).

### 5) **MEDIUM (Residual)** — In-memory rate-limit state (non-distributed)
- **Finding**: Signup throttling uses in-process `Map`, not shared/distributed storage.
- **Location**: `app/api/attendees/signup/route.ts` (`fingerprintWindows` map).
- **Exploit scenario**: In multi-instance/serverless deployments, attacker can bypass limits by spraying across instances.
- **Compensating controls**:
  - Risk event telemetry and moderation queue.
- **Remediation plan (next)**:
  - Move limiter to Redis/Postgres-based atomic counters with TTL.

### 6) **LOW (Observed)** — RLS policy definitions are documented but not enforced by tracked SQL migration in this repo
- **Finding**: `docs/rls-policies.md` contains RLS SQL, but migration folder does not currently include canonical RLS migration for attendees tables in this snapshot.
- **Exploit scenario**: Environment drift risk (operators assume RLS exists when DB was not provisioned identically).
- **Remediation plan**:
  - Add idempotent migration file that applies/validates required RLS + grants, and CI check proving policies exist.

---

## Detailed remediation plan (exact files)
1. **Dependency hardening**
   - `package.json` → pin `next@15.5.12`.
   - `package-lock.json` → refresh lockfile.
2. **Admin access control**
   - Add `lib/security.ts` with `assertAdminRequest` helper.
   - Add gate calls to all admin/moderation/match decision/generation/session endpoints listed above.
3. **Transport/browser security headers**
   - `next.config.ts` add CSP, HSTS, XFO, XCTO, Referrer-Policy, Permissions-Policy.
4. **Follow-up hardening (not fully implemented in this patch)**
   - Add cookie-based auth session for admin UI + CSRF controls.
   - Replace in-memory rate limits with shared backend.
   - Add DB migration for RLS enforcement parity.

---

## Verification evidence (post-fix)

### Command evidence
- `npm install` (lockfile refreshed; dependencies updated)
- `npm audit --json` result: **0 vulnerabilities**
- `npm test` result: **114 passed, 0 failed**

### Secrets / env checks
- `.env` files in repo tree: only `./.env.example` found.
- `.gitignore` excludes `.env*` local files.
- No hardcoded API keys/private key signatures detected in source scan.

### Common vuln class checks
- **SQL injection**: queries use tagged template parameterization via `postgres` library (no raw concatenated SQL observed in app API routes).
- **XSS**: React rendering paths avoid `dangerouslySetInnerHTML`; user values rendered as text.
- **CSRF**: now reduced for admin APIs by requiring explicit `x-admin-token`; full session-based CSRF pattern still recommended.
- **Path traversal**: no user-controlled filesystem path usage in app routes reviewed.
- **SSRF**: no server-side user-controlled URL fetch patterns found in API routes.
- **Insecure deserialization**: none observed.

---

## Production config hygiene
- `DATABASE_URL` remains server-side only.
- Added strict security headers globally.
- New required env var for admin surface: `ADMIN_API_TOKEN`.

> Operational note: deploy must set `ADMIN_API_TOKEN` and ensure trusted caller path provides `x-admin-token` for admin endpoints.

---

## Residual risk summary
- Session/auth maturity is still alpha-level (header token model, no full RBAC/SSO).
- Signup abuse controls are not yet distributed across multiple instances.
- DB policy drift possible until RLS SQL is codified as executable migration + CI assertion.

---

## GO / NO-GO recommendation for connecting Neon in production

**Recommendation: CONDITIONAL GO** (not unconditional).

Go is acceptable **only if** these conditions are met before enabling Neon production traffic:
1. `ADMIN_API_TOKEN` is set securely and admin routes are only reachable through trusted ingress that injects/validates admin credentials.
2. Deploy includes upgraded `next@15.5.12` and passes `npm audit` clean state.
3. Add a tracked DB migration or runbook verification proving required RLS/grants are active in Neon.

If any condition above is unmet, treat as **NO-GO**.

---

## Top 3 next actions
1. Implement real authenticated admin sessions (HttpOnly/Secure/SameSite cookies, role checks, CSRF protection), replacing shared header-token model.
2. Move signup rate limiting to distributed storage (Redis/Postgres atomic counters) and add abuse load tests across multi-instance topology.
3. Convert `docs/rls-policies.md` into an executable migration + CI gate that verifies policy presence in target Neon environment.
