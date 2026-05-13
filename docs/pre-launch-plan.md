# Pre-Launch Plan — Client Intelligence Portal

**Window**: 2026-05-13 → ~2026-07-13 (≈ 2 months).
**Constraint**: no Supabase or OAuth spend until launch eve.
**Posture**: ship every other phase's `.x.y` work that the in-memory
repository + dev-bypass identity can support; defer real persistence to
the final pre-launch sprint when client onboarding actually begins.

This doc is the **operational entry point** for any agent or operator
picking up portal work in the next two months. Read this before
`docs/client-portal-roadmap.md` — the roadmap is the long-arc story,
this doc is the next-two-months execution queue.

---

## TL;DR

The portal runs end-to-end without infrastructure today. Every phase's
`.0` slice has shipped. The decision about what to attack next pivots
on whether the follow-up needs a hosted database to be honest:

- **A. Pre-launch (green-light now)** — follow-ups that work against the
  in-memory repository + the Anthropic API alone. Most of the highest-
  leverage product work falls here.
- **B. Launch-eve (final 2 weeks)** — follow-ups that require Supabase
  persistence or real OAuth. Phase 2.1, Phase 6.1 telemetry persistence,
  Phase 8.1 real multi-tenant, Phase 10.1 signed exports.
- **C. Post-launch** — follow-ups that need real client traffic or
  multi-tenant data to be meaningful. Phase 14.1 portfolio projection
  on real telemetry, Phase 15.1 public marketplace API + ACH payouts,
  Phase 12.1 real cross-tenant federation.

We're attacking bucket A.

---

## Why this re-organization

The roadmap's original priority ordering treated Phase 2.1 (real
persistence) as the gate that unblocks every subsequent phase. That was
the right ordering for **engineering depth**. It is the wrong ordering
for the **stealth → launch arc** we're actually running:

- We are not onboarding paying clients for ~2 months.
- A hosted Supabase project (Pro tier, the only one with the RLS quotas
  the design assumes) bills from day one — paying for unused
  infrastructure during stealth is wasted runway.
- Every phase's `.0` slice already proves the product story on the
  in-memory repository. Phase 2.1 is a **swap**, not a build: the
  contract is locked, the migrations are scoped, the seed factories are
  ready. It's a 1-week effort in launch week, not a multi-week project.

The new ordering: ship pre-launch work that compounds against the
in-memory backend, run a one-week persistence sprint when clients are
~2 weeks away, then keep extending after launch.

---

## Pre-launch queue (bucket A)

Ordered roughly by leverage. Each entry has an honest weekly estimate
and a clear acceptance criterion. None of these need Supabase.

### A1 · Real Anthropic-backed Engagement Analyst hardening (Phase 3.1 minus persistence) · **1 wk**

The wiring already exists (`lib/portal/agents/runtime/anthropic.ts`).
Today it stubs when `ANTHROPIC_API_KEY` is unset. Pre-launch work:

- Build an **evaluation harness** at `tests/portal/agent-eval/*` — each
  shipped decision becomes a replayable fixture. Run the agent against
  the workspace state at the time, assert the same option scored
  highest. (Today: 1 stub-mode smoke test. Target: 5 real-mode eval
  fixtures across high / medium / low risk tiers.)
- Wire **cache-hit-rate reporting** in `lib/portal/agents/telemetry.ts`
  so `/portal/governance` shows the running ratio. Roadmap acceptance
  is ≥ 0.6 on second-and-later conversations within a workspace; this
  is only measurable with a real API key.
- Add **confidence-based auto-routing**: when the agent reports
  `confidence < 0.5`, the resulting decision is tagged
  `requires-second-pair-of-eyes` and the executive approval button is
  gated behind explicit acknowledgement.

**Acceptance**: with an `ANTHROPIC_API_KEY` set, running the Engagement
Analyst proposes a decision, that proposal lands in the Decision
Register with confidence + cost metadata, and re-running on the same
workspace state hits the prompt cache (visible in
`/portal/governance`).

**Persistence dependency**: none. Conversation persistence and the
historical eval-trace store both come with Phase 2.1.

---

### A2 · Multi-org / multi-workspace mock data · **2 d**

Phase 8.0 ships the org rollup surface and Phase 14.0 ships the
portfolio surface, but both currently lean on a single anchor workspace
plus synthetic peers. The pre-launch lift is to seed **3 realistic
client orgs across 5 workspaces** in `lib/portal/mock-data.ts` so
every multi-tenancy surface tells a real story.

Suggested orgs:

- **Org A** — Federal government department (Protected B, 2 workspaces:
  *AI Modernization Program*, *Service Design Renewal*). Anchors the
  Protected-B Federation story.
- **Org B** — Provincial health authority (HIPAA-adjacent, 1
  workspace: *Clinical Decision Support Discovery*). Anchors the
  HIPAA sector pack.
- **Org C** — Enterprise financial services (SOC 2, 2 workspaces:
  *Risk Modernization*, *Customer Intelligence Architecture*).
  Anchors the Financial-Services Federation story.

**Acceptance**: `/portal/org`, `/portal/portfolio`, `/portal/federation`,
`/portal/compliance` all render with non-anchor data; `npm test`
passes (the mock-data invariants will catch missing cross-refs).

**Persistence dependency**: none.

---

### A3 · Playwright golden-path e2e tests · **3 d**

The 131-test smoke suite covers module imports, contract conformance,
and pure-data invariants. It does not cover **a user actually walking
the propose → approve → audit-log loop in a browser**. Pre-launch
work:

- Add `@playwright/test` (free OSS) and a config under
  `playwright.config.ts`.
- Five critical-path tests under `tests/portal/e2e/`:
  1. Command Center loads, surfaces the pending decision count.
  2. Open a pending decision → click Approve → status flips to
     Approved, audit-log gains an entry, signal feed updates.
  3. Open an artifact → click "Propose for canonical" → Governance
     Auditor verdict renders → owner approval flips it canonical.
  4. Knowledge page → Bookshelf reflects the promotion.
  5. Workspace switcher in TopBar surfaces other workspaces from
     mock data; clicking one updates the active workspace context.
- CI workflow runs Playwright headless on every PR.

**Acceptance**: `npm run test:e2e` passes locally and on CI.

**Persistence dependency**: none.

---

### A4 · Marketing → portal continuity polish · **2 d**

The marketing site sells the portal but does not let prospects
**experience** it. Pre-launch work:

- Add a "Try the live portal" CTA on `/platform` and the homepage that
  deep-links to `/portal` running on dev-bypass with the role switcher
  pre-set to `executive`.
- A short interstitial banner on the portal that, when `referrer`
  matches the marketing site, surfaces a "5-minute guided tour" link
  to `/portal/help`.
- Polish `/portal/help` with an actual scripted walkthrough (top-5
  surfaces) and explicit "this is a demo" framing.
- Marketing-side OG image + meta tags for the deep links.

**Acceptance**: a prospect lands on `/platform`, clicks the CTA,
arrives in `/portal` as an executive role, completes the guided tour in
≤ 5 minutes, and the "What changed?" feed reflects the actions they
took.

**Persistence dependency**: none.

---

### A5 · Lighthouse / a11y / performance pass · **1 wk**

Pre-launch is the right moment to harden quality on every shipped
surface. Pre-launch work:

- Add `@axe-core/playwright` to the e2e runner (built in A3).
- Add a `lighthouse-ci` workflow that runs Lighthouse on the top 8
  portal routes + the marketing homepage. Target ≥ 90 across
  Performance / Accessibility / Best Practices / SEO.
- Resolve the existing pre-existing lint warnings (currently 27,
  all pre-existing) as a clean-up sprint.
- Add `loading="lazy"` to off-screen images, audit `next/image` usage,
  inspect any non-ideal cumulative-layout-shift sources.
- Token contrast pass against the WCAG AA threshold.

**Acceptance**: Lighthouse ≥ 90 on all four categories for 9 routes;
axe-core finds 0 critical / 0 serious violations on the same routes.

**Persistence dependency**: none.

---

### A6 · Phase 11.1 real outbound connector (one connector, end-to-end) · **1 wk**

Phase 11.0 ships the action runtime + 7 connector stubs. Wiring a
**real** HTTP adapter for one connector is high-leverage demo material
and stress-tests the propose→approve→dry-run→commit→rollback contract
under non-mock load.

Recommended first connector: **Google Workspace Calendar** (OAuth
client credentials, no Supabase needed). The Activation Coach agent
can schedule calibration touchpoints into Outlook/Google calendars
directly from the portal. This is the cleanest demo because:

- Calendar events have a natural inverse action (delete).
- The action is low-blast-radius (a calendar event is reversible).
- Marketing already promises this on `/services/agentic-systems`.

Pre-launch work:

- `lib/portal/outbound-actions/connectors/google-calendar.ts` —
  real HTTP adapter against the Calendar API.
- Service-account credentials read from `GOOGLE_CALENDAR_CREDENTIALS`
  env var.
- Dry-run mode emits the proposed event without creating it.
- Commit creates the event; rollback deletes it.
- Audit log preserves the event ID for traceability.

**Acceptance**: a member proposes "schedule cohort-3 calibration
touchpoint" → dry-run renders the proposed event → commit creates the
real calendar event → rollback removes it. Every transition appears in
`/portal/governance`.

**Persistence dependency**: none beyond env-var credential storage.

---

### A7 · Phase 9.1 published SDK + workspace-scoped API tokens (in-memory) · **3 d**

Phase 9.0 ships the SDK in-repo and a single `PORTAL_API_KEY` gate.
Pre-launch work:

- Publish `lib/portal-sdk/` to npm as `@dauntlessagentic/portal-sdk`
  via a `package.json` exports map + minimal build step. Free npm
  publication.
- Replace the single `PORTAL_API_KEY` with workspace-scoped token
  issuance via a new repository method `issueApiToken`. Tokens persist
  in the in-memory repository for the lifetime of the server process —
  this is honest for pre-launch (clients aren't onboarding yet) and
  becomes durable when Phase 2.1 lands.
- `/portal/api` surface gets a "Tokens" panel (owner-gated) to issue +
  revoke.

**Acceptance**: `npm install @dauntlessagentic/portal-sdk` works
publicly; a workspace owner can issue a token from `/portal/api`, use
it in a `curl` against the live route, see the request in
`/portal/governance` audit log.

**Persistence dependency**: in-memory only for pre-launch. Phase 2.1
ports tokens into the `api_tokens` table.

---

### A8 · Phase 7.1 Autonomous Innovation Engine (in-memory) · **1 wk**

Phase 7.0 ships the Studio surface, pattern library, and roadmap
simulator. Phase 7.1's autonomous engine is mostly compute — a long-
running pattern detector that watches the in-process signal feed and
emits proposals. It can run against the in-memory repository for
pre-launch with the understanding that durability comes with Phase 2.1.

Pre-launch work:

- `lib/portal/innovation/autonomous-engine.ts` — a worker that
  subscribes to `subscribePortalEvents`, identifies patterns, and
  emits `Decision` proposals via the repository.
- Triggered on a `setInterval` for dev; the Phase 5.2 cron / Realtime
  upgrade is a launch-eve concern.
- Per-partner budget cap (token + dollar) with hard cutoff at 80% of
  the cap.

**Acceptance**: with the engine running, a fresh workspace boot
produces ≥ 1 autonomous proposal within 60 seconds based on the seed
signals. Operator can approve / reject via the Decision Register.

**Persistence dependency**: none for pre-launch. Phase 13.1 fine-tune
tie-in is a post-launch concern.

---

### A9 · /showcase enhancement OR Storybook setup · **3 d**

The chassis has a `/showcase` page documenting tokens / primitives /
patterns. Pre-launch is the right moment to extend it (rather than
adding Storybook as a new dependency tree) into a comprehensive design
system reference:

- One page per category: Tokens · Primitives · Patterns · Portal
  patterns · Charts · Card variants · Empty states.
- Live code snippets for each.
- A "How to add a new pattern" section linking to the relevant `AGENTS.md`
  rules.

**Acceptance**: a new contributor (human or agent) lands on `/showcase`
and can identify every reusable component without grep.

**Persistence dependency**: none.

---

### A10 · Marketing-site SEO + content additions · **1 wk**

Pre-launch motion needs the marketing site working as hard as the
product. Pre-launch work:

- OG images per page (8 marketing routes + the new portal-deep-link).
- Schema.org structured data on the homepage and `/services`.
- A `/insights` content seed (3–5 long-form articles).
- A `/case-studies` content seed (2–3 anonymized scenarios drawn from
  the mock-data fixtures).
- Sitemap + `robots.txt` polish.

**Acceptance**: a Lighthouse SEO score ≥ 95 across every public route;
OG previews render correctly when shared in Slack / LinkedIn.

**Persistence dependency**: none.

---

### A11 · Stealth → launch transition prep · **3 d**

The `NEXT_PUBLIC_STEALTH_MODE` env var hides personal identity
references. Pre-launch work:

- Walk every marketing page with `NEXT_PUBLIC_STEALTH_MODE=false` and
  cross-check the founder content for accuracy.
- Confirm OG images render correctly for the public identity.
- Add the founder photo + bio assets.
- Audit `config/identity.ts` for any stale identity copy.

**Acceptance**: flipping `NEXT_PUBLIC_STEALTH_MODE` between `true` and
`false` produces two cleanly distinct public-facing surfaces with
zero broken links and zero placeholder content.

**Persistence dependency**: none.

---

## Launch-eve queue (bucket B)

When the calendar says ~2 weeks to launch and client onboarding is
imminent, switch focus. These items need real persistence to be honest.

### B1 · Phase 2.1 · Real Supabase + Google OAuth · **1 wk**

Concretely:

1. Provision a Supabase project (Pro tier; RLS quotas matter).
2. Write migrations mirroring `lib/portal/types.ts` →
   `db/migrations/0001_workspace_tables.sql` etc. Append-only audit log,
   soft-deletes only. (CAIA's repository-schema pattern is the model;
   see `docs/caia-mapping.md` §2.)
3. Build `lib/portal/repositories/supabase.ts` against the locked
   `PortalRepository` contract. The shape was designed for this swap.
4. Activate the factory in `lib/portal/repositories/index.ts`:
   `if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) { return new SupabasePortalRepository(); }`.
5. Replace the `lib/auth/supabase.ts` stub with NextAuth v5 + Google
   OAuth (CAIA pattern; see `docs/caia-mapping.md` §3).
6. Drop `PORTAL_DEV_BYPASS=true` from production.
7. Smoke-test the existing 6 repository contract tests against a real
   Supabase project.

**Acceptance**: a real Google account logs in, sees the membership
they hold, can perform every write surface against a hosted database.

### B2 · Phase 6.1 · Persist telemetry events · **3 d**

`portal_events` migration matching the discriminated-union schema in
`lib/portal/telemetry/event-bus.ts`. Subscribe an emitter that writes
every event to the table; keep the in-memory cache as a fast read.
`computeDerivedMetrics` queries the table instead of the bus on cold
start. Backfill historical events from `audit_log` on first migration.

### B3 · Phase 10.1 · Signed evidence exports + data residency · **3 d**

Sign Markdown exports with a per-workspace key. Watermark with the
requesting member id. Wire `DataResidency` per-workspace setting
(CA / EU / US). Phase 10's compliance evaluator already evaluates these
controls — once they land, multiple `gap` rows flip to `pass`
automatically.

---

## Post-launch queue (bucket C)

Not in scope for pre-launch. Tracked here so the prioritization is
explicit.

- **Phase 12.1** — real cross-tenant federation repository +
  adversarial deanonymization tests. Needs real cross-tenant traffic
  to be meaningful.
- **Phase 13.1** — real fine-tune jobs via the Anthropic API. The Anthropic key
  alone could ship this pre-launch, but fine-tuning costs real money
  per run and the workspace-specific training data only becomes
  interesting after clients have generated decisions on the real
  Supabase backend. Defer to post-launch.
- **Phase 14.1** — real portfolio rollup from per-workspace telemetry.
  Today it's seeded; the projection only makes sense when there are
  real workspaces emitting telemetry.
- **Phase 15.1** — public marketplace submission API + ACH payouts.
  Both gated by Phase 2.1 + real traffic.
- **Phase 5.2** — real-time signals via Supabase Realtime. Live "What
  changed?" feed needs the Supabase backend to be honest.

---

## Operational reminders

- The repo configured `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`
  for sandboxed builds; CI already sets it. Local builds may need it
  set inline when behind a corporate proxy.
- Lint must end at 0 errors. Warnings under the `^_` argsIgnorePattern
  are permitted.
- Every new feature adds:
  - A row to `lib/portal/roadmap-status.ts` so `/portal/about` reflects
    it.
  - A smoke test under `tests/portal/<feature>.test.mjs` appended to
    the suite list in `package.json#scripts.test`.
  - A doc update inside the PR that ships the feature.

---

## Pre-launch posture decision log

These were the decisions that produced this re-organization. Each is
reversible; flag the one(s) you disagree with so the next pass can
revisit.

1. **Defer Supabase to launch eve.** Stealth posture, no client traffic,
   no need to pay for hosted Postgres + RLS quotas for two months.
   Reversible the moment we want to test against real persistence.
2. **Defer real OAuth to launch eve.** Dev-bypass identity + the TopBar
   role switcher cover every membership-gate exercise pre-launch.
   Reversible by setting `AUTH_GOOGLE_*` env vars (when wired).
3. **Anthropic API spend is allowed pre-launch.** Necessary to honor
   the Phase 3.1 cache-hit-rate ≥ 0.6 acceptance criterion. Bounded
   by a per-workspace token cap in `lib/portal/agents/telemetry.ts`.
4. **One real outbound connector pre-launch.** Demonstrates the action
   contract under non-mock load without committing to all 7
   connectors. Google Calendar is the leading candidate.
5. **Marketing-site polish is engineering work, not a separate track.**
   Pre-launch needs the marketing surface as polished as the product.
   Pulled into the same queue.

---

## How to pick up this plan

1. Read this doc (you are here).
2. Skim `docs/client-portal-roadmap.md` — every phase carries a
   `Launch posture` tag now (`pre-launch` / `launch-eve` / `post-launch`).
3. Pick an item from the pre-launch queue above. Items are ordered by
   leverage but you can pick by what fits the current operator's
   strengths.
4. Branch as `claude/portal-prelaunch-<slug>`. Each pre-launch item
   ships as its own draft PR.
5. CI (`.github/workflows/portal-ci.yml`) runs lint + typecheck + test
   + build on every PR. Keep it green.
6. Update this doc when an item ships — strike it through and move it
   to the "Pre-launch shipped" section below.

---

## Pre-launch shipped

*(empty until items land)*
