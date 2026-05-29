# Launch Readiness Audit — May 2026

Date: 2026-05-24  
Branch audited: `codex/launch-readiness-audit`  
Base commit audited: `08f5f24` (`docs: README rewrite + NEXT_STEPS handoff refresh (#48)`)

## Remediation Addendum — 2026-05-25

A follow-up remediation pass addressed several findings directly on this branch.
The original findings below remain the point-in-time audit record; current
operator-owned work is tracked in
[`docs/launch-operator-backlog-2026-05.md`](launch-operator-backlog-2026-05.md).

Resolved or materially reduced in this pass:

- BASE-01: `npm test` now sets `TMPDIR=/tmp` by default for this local/WSL environment.
- BASE-02: `next.config.ts` sets `turbopack.root`, removing the workspace-root build warning.
- MKT-01: contact/newsletter forms no longer fake submissions; they route to direct email.
- MKT-03: `public/og-default.png` now exists.
- MKT-05: mobile nav button has a fixed touch target and ARIA state.
- MKT-07: sitemap `lastModified` is now stable.
- PORT-01: production auth no longer implicitly enables dev-bypass; public demo mode requires `PORTAL_DEMO_MODE=true`.
- PORT-03 / DEPLOY-02: README and `.env.local.example` use the same auth names and include production launch vars.
- PORT-06: API explorer copy now distinguishes local dev-bypass, production refusal, and explicit open-demo mode.
- OPS-03: `GET /api/healthz` now reports runtime readiness without exposing secrets.
- LEGAL-01: `SECURITY.md` now exists.
- LEGAL-03: privacy copy now matches the current email-based contact path and no-analytics posture.
- LEGAL-04: accessibility statement page is published and linked in the footer.
- VERIFY-01: `SECURITY_AUDIT.md` now has a resolution-status table.
- CODE-01: auth runtime launch posture is covered by tests.
- CODE-02: the feedback harness eslint disable now has a rationale.
- OPEN-01: Dependabot coverage was added; PR/branch cleanup remains operator-owned.

Still operator-owned before public launch: error reporting vendor/DSN, GitHub
branch protection, production env setup, security mailbox confirmation, and the
portal-demo-vs-hidden decision.

## TL;DR

- **Ship-stoppers:** do not expose `/portal` publicly until production UI dev-bypass is closed or explicitly converted into a labeled demo mode; do not onboard real clients until Supabase/OAuth/RLS exists; add production error reporting before any public launch.
- **Must-fix-before-public:** make contact/newsletter capture real or remove the fake success states, add `SECURITY.md`, set branch protection, fix the missing OG image, and publish a clear portal demo contract if `/portal` is linked.
- **Nice-to-have-this-week:** replace the platform screenshot placeholder, add service/breadcrumb structured data, publish an accessibility statement, clean stale draft PRs/branches, and remove hardcoded marketing colors.

## Baseline Verification

Command: `npm ci && npm run lint && npm test && npm run build`

Result: **failed at `npm test` in this local WSL/Codex environment before build ran.**

Relevant output:

```text
added 528 packages, and audited 529 packages in 10s
found 0 vulnerabilities

> npm run lint
1 warning:
components/patterns/data-table.tsx:44:17
TanStack Table's useReactTable() API returns functions that cannot be memoized safely

> npm test
Error: listen ENOTSUP: operation not supported on socket /mnt/c/Users/CRAIGM~1/AppData/Local/Temp/tsx-1000/3214344.pipe
```

Follow-up verification: `TMPDIR=/tmp npm test`

Result: **passed.**

```text
# tests 172
# pass 172
# fail 0
# duration_ms 970.364056
```

Follow-up verification: `npm run build`

Result: **passed with one warning.**

```text
Warning: Next.js inferred your workspace root...
Detected additional lockfiles:
  * /home/craig/agentic-stack/web/dauntless-website/package-lock.json

Compiled successfully in 6.0s
Running TypeScript ... Finished TypeScript in 5.3s
Generating static pages ... 40/40
```

Command: `npm audit --omit=dev`

Result: **passed.**

```text
found 0 vulnerabilities
```

Command: `npx tsc --noEmit`

Result: **passed with no output.**

## Recommendation

Launch the marketing site publicly after the contact path and observability fixes land. Launch the portal as a **clearly labeled deterministic demo only**, not as gated real client onboarding.

The reason is simple: the public API gate is much better now, but the portal UI still enables dev-bypass in production when OAuth is absent, and the repository factory always returns the in-memory seed. That is acceptable for a labeled, resettable demo. It is not acceptable for real clients, real approvals, real audit exports, or any claim that client data survives restarts.

Real client onboarding should wait for Phase 2.1: Supabase persistence, OAuth, RLS, a production env schema, error reporting, and branch protection.

## Findings

### 0. Baseline

#### BASE-01 — Local test command fails without `TMPDIR=/tmp`

File: `package.json:10`  
Severity: **medium**

Problem: The requested baseline chain fails at `npm test` in this environment because `tsx` tries to create an IPC socket under the Windows-mounted temp path and Node returns `ENOTSUP`. The tests themselves pass when `TMPDIR=/tmp` is set, so this is a local execution reliability issue rather than a portal logic failure.

Fix: Update the test script or developer docs to set `TMPDIR=/tmp` in WSL/Codex environments, or wrap the test command in a cross-platform temp-dir helper. CI on Ubuntu is likely unaffected, but local launch checks should not require tribal knowledge.

Effort: **≤15m**

#### BASE-02 — Build emits a workspace-root warning

File: `next.config.ts:3`  
Severity: **low**

Problem: `next build` passes but warns that Next inferred the workspace root from `/home/craig/agentic-stack/package-lock.json` while this repo also has its own `package-lock.json`. That can make build caching, tracing, and deployment output less predictable.

Fix: Set `turbopack.root` in `next.config.ts` to this repo root, or remove the parent lockfile if it is accidental.

Effort: **≤15m**

### 1. Marketing-Site Quality

#### MKT-01 — Public lead-capture forms do not submit anywhere

File: `app/(marketing)/contact/page.tsx:21`  
Severity: **high**

Problem: The contact form prevents the default browser submit and only flips local React state to `submitted`. There is no API route, server action, email send, CRM write, or mailto fallback, yet the UI tells visitors “Message Received” and says the team will respond. The Insights subscription card has the same problem: it renders an email input and Subscribe button without a form action or click handler at `app/(marketing)/insights/page.tsx:145`.

Fix: Either wire a real server action/API route to send/store submissions with spam protection and error states, or remove the fake forms before public launch and route visitors to `mailto:` plus the Cal.com link.

Effort: **≤1d**

#### MKT-02 — Root locale handling makes all marketing routes dynamic

File: `app/layout.tsx:48`  
Severity: **high**

Problem: The root layout reads cookies to set `<html lang>`, so the production build marks every marketing route as dynamic server-rendered (`ƒ`). That costs CDN/static performance on the public site and makes the marketing surface inherit portal concerns even for visitors who never touch `/portal`.

Fix: Move portal locale resolution into `app/(app)/layout.tsx`, use middleware to set a request header only for app routes, or make marketing static with a default `lang="en"` and client-side locale handling only where needed.

Effort: **≤1d**

#### MKT-03 — Default OG image points to a missing file

File: `app/layout.tsx:35`  
Severity: **medium**

Problem: Global metadata advertises `/og-default.png`, but `public/og-default.png` does not exist. Public launch links may render with broken or generic social previews.

Fix: Add `public/og-default.png` at 1200×630, or change the metadata to an existing generated image. Then add page-specific OG images for platform/services if time allows.

Effort: **≤1h**

#### MKT-04 — Platform page still shows a launch-facing placeholder

File: `app/(marketing)/platform/page.tsx:269`  
Severity: **medium**

Problem: The Platform page has a “Platform screenshot coming soon” placeholder and copy promising a real engagement portal. That weakens the proof point on the most important product page for a portal-first public launch.

Fix: Replace the placeholder with a real `/portal` screenshot or short walkthrough video from the deterministic demo. If demo mode is not ready, remove the visual-proof section until it is.

Effort: **≤1d**

#### MKT-05 — Mobile hamburger control is too small and unlabeled

File: `components/marketing/marketing-nav.tsx:100`  
Severity: **medium**

Problem: The mobile menu button has no `aria-label`, no `aria-expanded`, and no fixed touch target. It renders only a 20px icon inside an unpadded button, which is below the usual 44px mobile target and hard for screen-reader users to identify.

Fix: Add `h-10 w-10`, `aria-label`, `aria-expanded`, and `aria-controls`, and give the mobile panel an `id`.

Effort: **≤15m**

#### MKT-06 — SEO metadata is shallow beyond the homepage

File: `app/(marketing)/services/page.tsx:37`  
Severity: **medium**

Problem: Most marketing pages define only title and description. The homepage has Organization/ProfessionalService JSON-LD at `app/(marketing)/page.tsx:21`, but service pages lack Service JSON-LD, breadcrumbs lack BreadcrumbList JSON-LD, and per-page canonical/openGraph data is not explicit.

Fix: Add a marketing metadata helper that emits canonical URLs, openGraph title/description/image, and JSON-LD for Organization, Service, and BreadcrumbList where applicable.

Effort: **≤1d**

#### MKT-07 — Sitemap `lastModified` changes on every render

File: `app/sitemap.ts:27`  
Severity: **low**

Problem: The sitemap returns `lastModified: new Date()` for every URL. That tells crawlers every page changed whenever the sitemap is generated, which is noisy and less trustworthy after launch.

Fix: Use static last-modified dates, git-derived build metadata, or omit `lastModified` until a content pipeline can supply real values.

Effort: **≤1h**

#### MKT-08 — Marketing components bypass the token-only color rule

File: `components/marketing/hero-section.tsx:53`  
Severity: **low**

Problem: The marketing surface still contains hardcoded color literals and RGB values, for example `#c4b5fd` in the homepage hero and category colors in `app/(marketing)/case-studies/page.tsx:53`. This violates the repo rule that component colors go through tokens first and makes future theme changes riskier.

Fix: Add named tokens in `app/globals.css` for these roles, then replace literal colors with token references.

Effort: **≤1d**

### 2. Portal Launch Posture

#### PORT-01 — Production portal UI still enables dev-bypass without OAuth

File: `lib/auth/runtime.ts:51`  
Severity: **critical**

Problem: `getAuthRuntimeState()` enables dev-bypass whenever OAuth is absent, even when `NODE_ENV=production`. `getCurrentMembership()` then grants a dev-bypass membership and `app/(app)/layout.tsx:30` renders the role switcher. A public visitor to `/portal` could impersonate owner/executive roles and mutate the in-memory demo state while the UI looks like a real client workspace.

Fix: In production, return `auth-unavailable` unless real OAuth is configured or a deliberately named demo flag is set. If demo mode is allowed, show a persistent demo banner, keep the role switcher clearly labeled, and prevent any claim that data is real or durable.

Effort: **≤1h**

#### PORT-02 — Repository factory cannot activate real persistence

File: `lib/portal/repositories/index.ts:41`  
Severity: **high**

Problem: The factory always returns `InMemoryPortalRepository`. The comments mention a future Supabase adapter, but there is no `lib/portal/repositories/supabase.ts`. The in-memory adapter explicitly resets mutations on restart at `lib/portal/repositories/in-memory.ts:7`. This blocks real client onboarding.

Fix: Either declare `/portal` demo-only for launch, or complete Phase 2.1: Supabase schema, repository implementation, OAuth session mapping, RLS, seed/provisioning script, and migration tests.

Effort: **>1d**

#### PORT-03 — Env documentation is incomplete and has mismatched auth names

File: `README.md:212`  
Severity: **high**

Problem: The README documents `AUTH_GOOGLE_CLIENT_ID` / `AUTH_GOOGLE_CLIENT_SECRET`, while `.env.local.example` uses `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`, and `lib/auth/runtime.ts:45` reads `AUTH_GOOGLE_ID`. The example file also omits production launch variables such as `PORTAL_API_KEY`, `PORTAL_ALLOW_OPEN_API`, rate-limit tuning, export signing keys, and connector credentials.

Fix: Create one canonical env schema in `.env.local.example` and update README to match code. Include demo-only vs production-required labels.

Effort: **≤1h**

#### PORT-04 — Marketing-to-portal demo CTA is absent on `main`

File: `app/(marketing)/platform/page.tsx:62`  
Severity: **medium**

Problem: The platform hero CTA routes to `/contact`, not `/portal`, and PR #24 that added a demo CTA remains an open dirty draft. This avoids accidental public demo exposure, which is good, but it means the promised marketing → portal continuity is not ready on `main`.

Fix: After PORT-01 is fixed, add a small fresh PR that links to `/portal?demo=1` with explicit “demo data, resets, no login required” framing and a persistent portal banner. Do not merge PR #24 blindly.

Effort: **≤1d**

#### PORT-05 — Connector enablement is safe but not launch-usable for real clients

File: `lib/portal/outbound-actions/enabled-connectors.ts:18`  
Severity: **medium**

Problem: Fresh workspaces correctly start with only `internal` enabled, and unenabled Jira/HubSpot/etc. proposals are refused. But the enabled connector map is in-process and the Governance page only lists connector status at `app/(app)/portal/governance/view.tsx:185`; there is no owner-facing enable/disable UI or durable store.

Fix: For demo launch, leave external connectors off and label them simulated. For real onboarding, add owner-gated enable/disable actions, persist them in Supabase, and include connector secrets/status in workspace setup.

Effort: **≤1d**

#### PORT-06 — API explorer copy is stale for production behavior

File: `app/(app)/portal/api/view.tsx:125`  
Severity: **low**

Problem: The API explorer says that when `PORTAL_API_KEY` is not set, “every request is accepted.” That is true in dev but false in production, where `lib/portal/api/auth.ts:28` returns 503 unless `PORTAL_ALLOW_OPEN_API=true`.

Fix: Make the copy environment-aware: “dev-bypass locally; production refuses unless explicitly opened for a demo.”

Effort: **≤15m**

### 3. Operational Readiness

#### OPS-01 — No production error reporting is wired

File: `package.json:12`  
Severity: **critical**

Problem: There is no Sentry, Logflare, Vercel Analytics/Speed Insights, instrumentation file, or log drain configured. The only production error handling found is `console.error` in `lib/portal/api/auth.ts:119`, which disappears into platform logs unless someone is actively looking. The prompt calls this launch-blocking, and I agree.

Fix: Add Sentry or equivalent error reporting with source maps, environment/release tags, and API/server-action capture. If using Vercel, add a log drain and minimal Web Analytics/Speed Insights only after the privacy/consent decision is made.

Effort: **≤1d**

#### OPS-02 — Rate limiting is in-process and replica-local

File: `lib/portal/api/rate-limit.ts:20`  
Severity: **high**

Problem: The token bucket is a module-level `Map`. At more than one server replica, each replica has its own bucket, so the effective rate limit multiplies by replica count and resets on cold starts.

Fix: Move buckets to Redis, Upstash, Vercel KV, or another shared low-latency store before exposing the API beyond a demo.

Effort: **≤1d**

#### OPS-03 — No health check endpoint exists

File: `README.md:164`  
Severity: **medium**

Problem: The documented API surface lists business endpoints only, and the repo has no `/api/health`, `/api/ready`, or `/api/status` route. CI builds the app, but deployment monitoring has no cheap endpoint to check runtime readiness, env posture, and repository mode.

Fix: Add `GET /api/healthz` returning version, commit, repository kind, auth mode, and required production env status without exposing secrets.

Effort: **≤1h**

#### OPS-04 — Webhooks are ledger-only and not signed outbound deliveries

File: `lib/portal/webhooks.ts:1`  
Severity: **medium**

Problem: `emitWebhook()` records events in an in-memory array and does not deliver HTTP callbacks or sign payloads. This is fine for Phase 9.0 demo observability, but not for a public API/SDK contract that implies webhook integrations.

Fix: Keep ledger mode for demo. For real launch, add outbound delivery, HMAC signatures, timestamp replay protection, a rotatable per-workspace secret, retry/backoff, and dead-letter visibility.

Effort: **≤1d**

### 4. Legal, Compliance, And Launch Hygiene

#### LEGAL-01 — Responsible disclosure policy is missing

File: `README.md:361`  
Severity: **high**

Problem: The README says there is no published license and directs security disclosures to `SECURITY_AUDIT.md` / maintainers. There is no tracked `SECURITY.md`. A public launch should have a clear disclosure channel, scope, expected response time, and safe-harbor language.

Fix: Add `SECURITY.md`. PR #31 appears to contain a candidate and can be revived or cherry-picked after review.

Effort: **≤15m**

#### LEGAL-02 — License posture is undecided in repo metadata

File: `package.json:1`  
Severity: **medium**

Problem: The repo has no `LICENSE` file and no `license` field in `package.json`; README says “Internal repository — no published license.” That is acceptable only if the repo remains private/internal. It is not enough for a public repository.

Fix: Decide whether the repo stays private/proprietary or publish a license. If proprietary, add `UNLICENSED` package metadata and a `LICENSE`/NOTICE explaining rights.

Effort: **≤15m**

#### LEGAL-03 — Privacy policy does not match current data collection

File: `app/(marketing)/legal/privacy/page.tsx:48`  
Severity: **medium**

Problem: The privacy policy says contact form submissions are collected and retained for up to 24 months, and that analytics tools may collect IP/browser/pages. The current contact form does not submit anywhere, and no analytics tooling is installed. The policy is plausible future copy, not current implementation truth.

Fix: Align policy with launch reality after deciding contact handling and analytics. If analytics is added, decide whether a cookie/consent banner is required for GDPR/PIPEDA visitors.

Effort: **≤1h**

#### LEGAL-04 — Accessibility statement is not published or linked

File: `components/marketing/footer.tsx:25`  
Severity: **low**

Problem: Privacy and Terms are linked in the footer, but there is no accessibility statement despite the recent audit-3 accessibility pass. Public-sector buyers will look for the declared conformance level.

Fix: Add `/legal/accessibility` with the intended WCAG conformance level, known limitations, and contact path, then link it from the footer.

Effort: **≤1h**

### 5. Deploy And CI/CD

#### DEPLOY-01 — `main` has no branch protection

File: `.github/workflows/portal-ci.yml:1`  
Severity: **high**

Problem: `portal-ci` and CodeQL workflows exist, but the GitHub API returned `404 Branch not protected` for `main`. Required launch checks are therefore advisory, not enforced.

Fix: Enable branch protection for `main`: require PRs, disallow force pushes, require `portal-ci / verify`, and require CodeQL to pass before merge.

Effort: **≤15m**

#### DEPLOY-02 — Canonical env example is not launch-complete

File: `.env.local.example:5`  
Severity: **high**

Problem: The example says every variable below is optional and only lists a subset of runtime variables. It omits several production-critical values documented in README: `PORTAL_API_KEY`, `PORTAL_ALLOW_OPEN_API`, `PORTAL_API_RATE_BURST`, `PORTAL_API_RATE_REFILL`, `PORTAL_EXPORT_SIGNING_KEY`, and `PORTAL_EXPORT_SIGNING_KEY_PREVIOUS`.

Fix: Treat `.env.local.example` as the canonical launch env contract. Add every env var, mark `local`, `demo`, or `production`, and include safe example values only.

Effort: **≤1h**

#### DEPLOY-03 — No platform config is tracked

File: `next.config.ts:3`  
Severity: **low**

Problem: There is no `vercel.json` or equivalent tracked platform config. That is not automatically wrong, but redirects, headers, cron jobs, env grouping, and deployment protections are currently implicit in dashboard state or absent.

Fix: Either add `vercel.json` for any required headers/redirects/regions, or document that Vercel dashboard settings are the source of truth and export screenshots/settings before launch.

Effort: **≤1h**

#### DEPLOY-04 — Bundle size is acceptable on current build

File: `package.json:7`  
Severity: **info**

Problem: No single static JS chunk exceeded 300kB gzip. The largest chunks were about 108kB gzip, and the root main bundle for a marketing page totaled about 132kB gzip.

Fix: No immediate action. Re-run after demo banners, analytics, and contact plumbing land.

Effort: **≤15m**

### 6. Previous Audit Closure Re-Verification

#### VERIFY-01 — `SECURITY_AUDIT.md` claims a resolution-status table that is not present

File: `SECURITY_AUDIT.md:3`  
Severity: **medium**

Problem: The top note says to see a “Resolution status” table immediately below the TL;DR, and `docs/client-portal-roadmap.md:35` says PR #45 added that table. The file still contains the old findings summary table at `SECURITY_AUDIT.md:377`, not a closure-status table. This makes it harder to avoid re-finding closed issues.

Fix: Add the missing resolution-status table or move the old baseline into an archive and create a current `SECURITY_AUDIT.md` status section.

Effort: **≤1h**

Verified closures still in effect on `main`:

- Dev API production refusal: `lib/portal/api/auth.ts:28`, tested in `tests/portal/api-sdk.test.mjs:35`.
- Constant-time API key compare: `lib/portal/api/auth.ts:44`.
- Cookie hardening for role switcher: `lib/auth/actions.ts:36`.
- Rate-limit cost weighting: `lib/portal/api/auth.ts:89`, `tests/portal/rate-limit.test.mjs:35`.
- Propose while frozen refused: `lib/portal/outbound-actions/store.ts:50`, `tests/portal/audit-2-gates.test.mjs:46`.
- Viewer/auditor decision comments refused: `lib/portal/decision-comments-actions.ts:18`.
- Feedback harness gated: `app/(app)/portal/dev/feedback/page.tsx:13`.
- A11y pass still present: `components/patterns/polite-announcer.tsx:49`, `components/patterns/confirm-action.tsx:71`, real page H1s via `components/shell/workspace-header.tsx:31`.

### 7. Code Health

#### CODE-01 — Auth runtime production behavior is not directly tested

File: `tests/portal/api-sdk.test.mjs:35`  
Severity: **medium**

Problem: The tests prove that the REST API refuses production requests without `PORTAL_API_KEY`, but there is no equivalent test for `getAuthRuntimeState()` in production. That gap let PORT-01 survive: the UI membership runtime still grants dev-bypass without OAuth.

Fix: Add a small `auth-runtime.test.mjs` suite covering production without OAuth, production with OAuth configured, and explicit demo/dev-bypass flags.

Effort: **≤15m**

#### CODE-02 — Broad eslint disable lacks an explanation

File: `app/(app)/portal/dev/feedback/view.tsx:2`  
Severity: **low**

Problem: The file disables `react-hooks/purity` at the file level without a nearby rationale. The repo conventions say no broad eslint disables, and unexplained disables become invisible technical debt.

Fix: Refactor the specific pattern, or add a short comment explaining why the broad disable is unavoidable for the feedback harness.

Effort: **≤15m**

#### CODE-03 — Remaining lint warning is upstream-pinned

File: `components/patterns/data-table.tsx:44`  
Severity: **info**

Problem: The only lint warning is React Compiler skipping TanStack Table because `useReactTable()` returns functions that cannot be memoized safely. This matches the known upstream incompatibility and is not actionable in this repo today.

Fix: No local fix. Revisit when TanStack/React Compiler guidance changes.

Effort: **≤15m**

Other checks:

- TODO/FIXME/XXX scan: no code hits outside docs.
- Dead-code scan: no confident zero-importer finding in `lib/portal/**`; index re-exports and dynamic test imports create false positives in simple grep scans.
- Coverage: the requested lifecycle areas are covered: propose/approve/commit (`tests/portal/outbound-actions.test.mjs`), freeze transitions (`tests/portal/outbound-safety.test.mjs`), and signed-export round trip (`tests/portal/exports-signing.test.mjs`).

### 8. Open Work The Next Person Should See

#### OPEN-01 — Stale draft PR queue needs triage before launch

File: `NEXT_STEPS.md:24`  
Severity: **medium**

Problem: Eight pre-existing draft PRs remain open (#23, #24, #25, #26, #27, #29, #30, #31). Seven are dirty against current `main`; one is clean. They overlap with the current launch-readiness work and should not be merged blindly.

Fix: Close or revive each intentionally. Recommended triage is below.

Effort: **≤1h**

Draft PR recommendations:

| PR | Title | State | Recommendation |
|---|---|---:|---|
| #23 | `docs: re-organize roadmap around pre-launch / no-Supabase posture` | dirty | Close as superseded by this report and the refreshed README/NEXT_STEPS. Salvage any useful pre-launch queue language manually. |
| #24 | `feat: A4 — marketing → portal continuity` | dirty | Do not merge. Recreate as a fresh small PR after PORT-01, using explicit demo-mode framing. |
| #25 | `/showcase enhancement` | dirty | Close or defer. Useful contributor docs, not launch-critical. |
| #26 | workspace-scoped API tokens in-memory | dirty | Defer to Phase 9.1/Supabase. In-memory scoped tokens are not the right launch path. |
| #27 | lint cleanup | dirty | Close as superseded by PR #45; current lint is already down to the one upstream warning. |
| #29 | multi-org mock-data seed | dirty | Defer. Not needed for a public marketing/demo launch; real multi-org belongs with persistence. |
| #30 | stealth-mode audit + checklist | dirty | Close as superseded by this report. Consider cherry-picking the stealth smoke test later. |
| #31 | repo hygiene — PWA manifest + SECURITY + Dependabot | clean | Revive or cherry-pick the `SECURITY.md` and Dependabot parts now. Review manifest colors against token/project rules before merging. |

Merged remote `claude/*` branch prune candidates confirmed by `git branch -r --merged origin/main`:

```text
origin/claude/client-portal-mvp-3CFwb
origin/claude/portal-ci-closeout
origin/claude/portal-next-steps
origin/claude/portal-phase-10-compliance
origin/claude/portal-phase-11-outbound-actions
origin/claude/portal-phase-12-federation
origin/claude/portal-phase-13-fine-tunes
origin/claude/portal-phase-14-portfolio
origin/claude/portal-phase-15-marketplace
origin/claude/portal-phase-2-persistence-identity
origin/claude/portal-phase-3-engagement-analyst
origin/claude/portal-phase-4-1-canonical-editor
origin/claude/portal-phase-4-mem-palace
origin/claude/portal-phase-5-1-nba-schedule
origin/claude/portal-phase-5-agent-fleet
origin/claude/portal-phase-6-telemetry-impact
origin/claude/portal-phase-7-innovation-studio
origin/claude/portal-phase-8-multi-workspace
origin/claude/portal-phase-9-api-sdk
```

Unmerged/still-open or stale `claude/*` branches to review separately:

```text
origin/claude/portal-ci-and-tests
origin/claude/portal-phase-2-persistence-scaffold
origin/claude/portal-pre-launch-replan
origin/claude/portal-prelaunch-a10-seo
origin/claude/portal-prelaunch-a11-stealth-audit
origin/claude/portal-prelaunch-a2-multi-org
origin/claude/portal-prelaunch-a4-marketing-continuity
origin/claude/portal-prelaunch-a7-scoped-tokens
origin/claude/portal-prelaunch-a9-showcase
origin/claude/portal-prelaunch-lint-cleanup
origin/claude/portal-prelaunch-repo-hygiene
origin/claude/portal-thread-3-detail-routes
```

## Recommended Cut Line For Launch

### Blocks public launch

- OPS-01: production error reporting.
- MKT-01: broken contact/newsletter capture, unless replaced with mailto/Cal links.
- LEGAL-01: responsible disclosure policy.
- DEPLOY-01: branch protection.
- MKT-03: missing OG image, if social launch matters on day one.

### Blocks public `/portal` demo

- PORT-01: production UI dev-bypass must be explicit demo mode or closed.
- PORT-04: demo CTA/banner must make the deterministic demo contract obvious before visitors mutate state.
- PORT-06: API explorer copy must not imply production accepts open API requests.

### Blocks real client onboarding

- PORT-02: Supabase/OAuth/RLS persistence.
- PORT-03 / DEPLOY-02: complete production env schema.
- OPS-02: shared rate limit.
- OPS-04: signed/retried webhooks if API customers are promised webhooks.
- LEGAL-02: license/repo-public posture decision.

### Post-launch follow-up

- MKT-02 static marketing optimization if launch traffic is modest, though I would still fix it this week.
- MKT-04 platform screenshot.
- MKT-06 structured data.
- MKT-07 sitemap dates.
- MKT-08 token cleanup.
- LEGAL-04 accessibility statement.
- CODE-02 eslint-disable cleanup.
- OPEN-01 branch/PR hygiene.

## Prioritized Backlog

### P0 — unblock public launch

| Order | Action | Findings | Done when | Effort |
|---:|---|---|---|---|
| 1 | Add Sentry or equivalent server/client error reporting and release tagging. | OPS-01 | A test error appears in the dashboard with source map and env. | ≤1d |
| 2 | Make the contact form real, or replace it with email/Cal links. | MKT-01, LEGAL-03 | A real submission reaches the operator, and failure state is visible. | ≤1d |
| 3 | Add `SECURITY.md`. | LEGAL-01 | GitHub security policy tab shows the disclosure instructions. | ≤15m |
| 4 | Enable branch protection on `main`. | DEPLOY-01 | GitHub requires PR + `portal-ci / verify` + CodeQL before merge. | ≤15m |
| 5 | Fix `/og-default.png`. | MKT-03 | Link preview shows Dauntless-branded image. | ≤1h |

### P1 — unblock `/portal` demo

| Order | Action | Findings | Done when | Effort |
|---:|---|---|---|---|
| 6 | Change `getAuthRuntimeState()` so production dev-bypass is impossible unless an explicit demo flag is set. | PORT-01, CODE-01 | Production without OAuth is `auth-unavailable` or explicit `demo`; test covers both. | ≤1h |
| 7 | Add a demo-mode banner and CTA to `/portal?demo=1` in a fresh PR. | PORT-04 | Visitor sees “demo data, resets, no real client data” before interacting. | ≤1d |
| 8 | Update API explorer copy for production 503 behavior. | PORT-06 | Copy distinguishes local dev-bypass from production refusal/open-demo flag. | ≤15m |
| 9 | Replace the platform screenshot placeholder with real demo proof. | MKT-04 | Platform page shows a current portal screenshot or walkthrough. | ≤1d |

### P2 — prepare real onboarding

| Order | Action | Findings | Done when | Effort |
|---:|---|---|---|---|
| 10 | Complete canonical env schema and README alignment. | PORT-03, DEPLOY-02 | `.env.local.example` contains every launch var with local/demo/prod labels. | ≤1h |
| 11 | Implement Phase 2.1 persistence and auth. | PORT-02 | Supabase repo, OAuth, RLS, and provisioning tests pass. | >1d |
| 12 | Move rate limiting to a shared store. | OPS-02 | Two replicas share the same bucket in staging. | ≤1d |
| 13 | Add `/api/healthz`. | OPS-03 | Deployment monitor can verify app/env/repo readiness without auth. | ≤1h |
| 14 | Add real signed webhook delivery or mark webhooks as ledger-only. | OPS-04 | Outbound payloads include HMAC/timestamp and retry state, or public docs remove delivery claims. | ≤1d |
| 15 | Decide repo license/public posture. | LEGAL-02 | `package.json`, README, and license/disclosure docs agree. | ≤15m |

### P3 — polish this week

| Action | Findings | Done when | Effort |
|---|---|---|---|
| Add Service/Breadcrumb JSON-LD and per-page OG metadata. | MKT-06 | Rich result test has valid Organization/Service/Breadcrumb data. | ≤1d |
| Move marketing routes back to static rendering. | MKT-02 | `next build` marks marketing pages static where possible. | ≤1d |
| Publish accessibility statement. | LEGAL-04 | Footer links Privacy, Terms, Accessibility. | ≤1h |
| Replace dynamic sitemap dates. | MKT-07 | Sitemap dates are stable and meaningful. | ≤1h |
| Replace hardcoded marketing colors with tokens. | MKT-08 | `rg` finds no literal component colors in marketing files except unavoidable external values. | ≤1d |
| Close/revive stale draft PRs and prune merged branches. | OPEN-01 | Open PR list only contains active work; merged `claude/*` branches are gone. | ≤1h |

## Launch Checklist

1. Add production error reporting and verify a test exception.
2. Make contact/newsletter capture real or remove the forms.
3. Add `SECURITY.md`.
4. Enable `main` branch protection with `portal-ci / verify` and CodeQL.
5. Add/fix `public/og-default.png`.
6. Decide: `/portal` demo public, real onboarding later.
7. Close production UI dev-bypass unless explicit demo mode is enabled.
8. Add demo CTA/banner only after step 7.
9. Update `.env.local.example` and README env names.
10. Set production env vars in hosting provider.
11. Add `/api/healthz`.
12. Run `npm ci && npm run lint && TMPDIR=/tmp npm test && npm run build`.
13. Run `npm audit --omit=dev` and `npx tsc --noEmit`.
14. Close/supersede stale draft PRs and prune merged `claude/*` branches.
15. Capture launch screenshots: homepage, platform, contact, privacy, portal demo banner.

## Open Questions For The Operator

- Should `/portal` be public demo at launch, or hidden until Phase 2.1? My recommendation: public demo only after PORT-01 and demo banner.
- Which error reporting vendor should be used: Sentry, Vercel Observability, Logflare, or something else?
- What is the real contact-form destination: email, CRM, Notion, HubSpot, or database?
- Will analytics ship on day one? If yes, what consent/cookie posture do you want?
- Should the GitHub repo become public, or is only the site public? This decides LICENSE, CONTRIBUTING, and CODE_OF_CONDUCT urgency.
- What license posture should be declared if the repo is public: proprietary/all rights reserved, source-available, MIT, Apache-2.0, or another choice?
- Is the Cal.com booking link production-owned and monitored?
- Do we want to revive PR #31 wholesale, or cherry-pick only `SECURITY.md` and Dependabot?
