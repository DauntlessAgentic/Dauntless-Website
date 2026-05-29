# Dauntless Agentic — Marketing Site + Client Intelligence Portal

> **A Next.js 16 monorepo with two surfaces:** the public marketing site at `/` and the **Client Intelligence Portal** at `/portal` — a living cockpit for AI-powered client engagements.
>
> 15 roadmap phases shipped + a May 2026 security-audit hardening pass + a Client Advisory Board polish cycle. All on `main`. 172 smoke tests green.

```sh
npm install && npm run dev
# open http://localhost:3000/portal
```

---

## What this is

A production-quality Next.js codebase that hosts **two product surfaces**:

1. **Marketing site** at `/` — the public-facing Dauntless Agentic site (homepage, services, work, pricing, contact).
2. **Client Intelligence Portal** at `/portal` — a living cockpit for AI-powered client engagements. 32 server-rendered routes, 8 versioned REST API endpoints, an in-memory `PortalRepository` that swaps cleanly to Supabase, an agent runtime against the Anthropic API with prompt-caching, signed evidence exports, a continuous Autonomous Innovation Engine, and an append-only audit log.

Built on the same chassis: Next.js 16 App Router + TypeScript + Tailwind v4 + Radix primitives + Recharts. Deep-ultraviolet (`#7c3aed`) design system with token-only colors.

---

## The safety stance, up front

**Nothing reaches a client system without an explicit two-person path.**

Four default-on primitives — wired in code, not marketing copy:

1. **Per-workspace connector enablement** — only `internal` is enabled on a fresh workspace. Owners explicitly add every other connector (Jira, HubSpot, Slack, etc.), one at a time, audit-logged.
2. **Workspace freeze switch** — one button on `/portal/help/something-went-wrong` stops every outbound action commit and dry-run for the workspace. Reversible; gated to owner/executive/lead roles.
3. **Propose → Approve → Commit** lifecycle — every outbound action crosses the human/system boundary at commit only. Propose-time payload validation via zod; separation of powers enforced at the agent tool catalog.
4. **Append-only audit log** — every action, agent or human, is recorded. The log can be exported as an HMAC-signed Markdown bundle watermarked with the requesting member.

Full policy: [`docs/safety-stance.md`](docs/safety-stance.md). What agents can / cannot / will never do: [`docs/agent-autonomy.md`](docs/agent-autonomy.md).

---

## Status at a glance

| Surface | Count |
|---|---|
| Portal routes | **32** (`app/(app)/portal/`) |
| REST API routes (v1) | **8** (`app/api/portal/v1/`) |
| Smoke tests | **172** across 25 suites (`tests/portal/`) |
| Phase modules shipped | **15** + closeout + 5 post-audit + 5 advisory polish |
| CI | `.github/workflows/portal-ci.yml` (Node 22 · lockfile-strict · lint + test + build) |
| Static analysis | `.github/workflows/codeql.yml` (security-and-quality query suite) |
| Latest npm audit | **0 vulnerabilities** |

Self-documenting status surfaces inside the portal:

- `/portal/about` — phase map, what's shipped, what's pending
- `/portal/changelog` — live activity feed across the workspace
- `/portal/governance` — **Controls in force** posture panel (rate-limit, signing-key id, auth mode, CodeQL date)

---

## Quick start

```sh
git clone <repo>
cd Dauntless-Website
npm install
npm run dev
# http://localhost:3000 → marketing site
# http://localhost:3000/portal → Client Intelligence Portal
```

The portal boots in **dev-bypass mode** with deterministic seed data, in-memory repository, no API key, no OAuth. Every surface is exercisable from the first click.

- Use the **role switcher** in the top bar (visible only in dev-bypass) to walk membership gating — switch between Owner / Approver / Manager / Read-only / Auditor.
- Use the **density toggle** to flip between Compact and Comfortable spacing.
- Use the **EN/FR locale toggle** to preview the bilingual scaffolding.
- Use the **command palette** (`⌘K` / `Ctrl+K`) to jump to any portal surface.

### Verify

```sh
npm run lint                                                   # 0 errors
npm test                                                       # 172/172
NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build
```

---

## What's in the Client Intelligence Portal

Grouped by tier. Every route is reachable from the command palette.

**Core (always available)**
- `/portal` — Command Center with the **"What changed for you this week"** personalised digest
- `/portal/engagements`, `/portal/engagements/[id]` — Engagement Continuity surface
- `/portal/deliverables`, `/portal/deliverables/[id]`, `/portal/deliverables/[id]/edit` — Living Deliverables (artifacts with version history + canonical promotion)
- `/portal/decisions`, `/portal/decisions/[id]` — Decision Register with comment thread
- `/portal/agents`, `/portal/agents/[id]` — Agent fleet (Engagement Analyst, Roadmap Strategist, Report Builder, Risk Inspector, etc.)
- `/portal/knowledge` — Knowledge architecture (Desk · Bookshelf · Cabinet) with revalidation queue
- `/portal/outcomes`, `/portal/outcomes/impact-report`, `/portal/outcomes/impact-report/preview` — outcomes telemetry + board-ready Quarterly Impact Report
- `/portal/governance` — audit log, agent telemetry, **Controls in force** panel, **Connectors** panel, **Safety switch** card

**Advanced (Strategic Partner tier)**
- `/portal/innovation` — Innovation Studio with the **Autonomous Innovation Engine** (continuous in-process watcher, five heuristic kinds)
- `/portal/search` — federated search across artifacts + knowledge
- `/portal/schedule` — Next-Best-Action ranking + propose

**Enterprise / Network**
- `/portal/api` — in-portal REST API explorer
- `/portal/actions` — outbound-actions sandbox (propose → approve → dry-run → commit → rollback)
- `/portal/compliance` — cross-framework readiness (Protected B, FedRAMP Low, SOC 2, HIPAA)
- `/portal/federation` — cross-tenant search primitive (three-tier anonymization)
- `/portal/models` — per-workspace model registry + fine-tunes
- `/portal/marketplace` — third-party agent marketplace + eval harness
- `/portal/portfolio` — Dauntless portfolio rollup
- `/portal/org` — multi-workspace org rollup

**Self-documenting**
- `/portal/about` — phase map
- `/portal/changelog` — workspace activity feed
- `/portal/help`, `/portal/help/glossary`, `/portal/help/something-went-wrong` — onboarding, plain-language glossary, safety switch

---

## Architecture in 60 seconds

```
Server component → loadPortalContext() → { snapshot, membership }
       ↓                ↓
   PortalSnapshot   MembershipContext
   (typed view)     (role + identity)
       ↓                ↓
   Pass to client view (server component → client component)

Server action → getCurrentMembership() → canPerform(role, action) → PortalRepository.write()
       ↓                                                            ↓
                                                              appendAuditEntry()
                                                              emitPortalEvent()
                                                              emitWebhook()
```

- **`PortalRepository`** (`lib/portal/repositories/types.ts`) — typed interface for every persistence operation. Two implementations: `InMemoryPortalRepository` (default, deterministic seed) and `SupabasePortalRepository` (stub today, Phase 2.1 swap is ~1 week of work against the locked contract).
- **`loadPortalContext()`** (`lib/portal/server.ts`) — every server component starts here. Returns workspace snapshot + the current membership. Never accepts a client-supplied workspace id.
- **Membership gate** (`lib/auth/membership-gate.ts`) — pure `canRead(role, surface)` / `canPerform(role, action)` predicates. Same predicates used in server components, server actions, and client controls.
- **Agent runtime** (`lib/portal/agents/runner.ts`) — Anthropic Messages API with prompt-caching (`cache_control: { type: "ephemeral" }`); falls back to deterministic stubs when no `ANTHROPIC_API_KEY` is set. Separation of powers enforced at the tool catalog (`lib/portal/agents/tool-catalog.ts`).
- **Telemetry event bus** (`lib/portal/telemetry/event-bus.ts`) — discriminated-union events. Powers the Impact Report, the Innovation Engine, and the weekly digest.
- **Innovation engine** (`lib/portal/innovation/engine.ts`) — in-process singleton subscribed to the event bus. Five heuristics emit proposals continuously; surfaced as the AUTONOMOUS ENGINE card on `/portal/innovation`.

---

## Who we design for

Three named personas drive every review. Full text: [`docs/personas.md`](docs/personas.md).

- **Priya** — the daily user. Service designer, mid-level, time-pressed. *"If I can't accomplish my primary task in 60 seconds the first time, I close the tab."*
- **Marie** — the federal sponsor. Bilingual Director General, risk-averse, briefs upward. *Will never click a button without a tooltip first.*
- **Marcus** — the security officer. Reads release notes, audits the audit log. *Asks "what controls are in force right now?" before "what does this do?"*

Every new PR description includes a **Personas test** section.

---

## REST API + SDK

Endpoints under `/api/portal/v1`:

| Method | Path | Cost |
|---|---|---|
| `GET` | `/engagements`, `/artifacts`, `/signals`, `/metrics`, `/decisions` | 1 |
| `GET` | `/knowledge?q=…` (ranked search) | 1 |
| `GET` | `/schedule`, `/digest?role=&windowDays=&format=` | 1 |
| `POST` | `/schedule` | 3 tokens |
| `POST` | `/decisions` | 5 tokens |

Runtime health check: `GET /api/healthz` returns repository mode, auth mode,
API gate status, rate-limit configuration, and missing production env items
without exposing secret values.

**Auth:** Bearer token in `Authorization`. Set `PORTAL_API_KEY` to enable gating; unset means dev-bypass (refused in production unless `PORTAL_ALLOW_OPEN_API=true`). Constant-time comparison via `node:crypto#timingSafeEqual`.

**Rate limiting:** Token-bucket per-token + per-IP. Burst 30, refill 5/sec (env-tunable). 429 with `Retry-After` on bucket drain. Writes cost more than reads (see table).

**SDK:** in-repo at `lib/portal-sdk/index.ts`; Phase 9.1 publishes to npm as `@dauntlessagentic/portal-sdk`. Typed client + webhook ledger helpers.

```ts
import { createPortalClient } from "@/lib/portal-sdk";
const portal = createPortalClient({
  baseUrl: process.env.NEXT_PUBLIC_PORTAL_BASE_URL!,
  apiKey: process.env.PORTAL_API_KEY,
});
const { engagements } = await portal.engagements.list();
```

---

## Security & compliance

- **Audit baseline:** [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md) (May 2026 point-in-time review). Post-audit hardening Phases A–E shipped on `main`; the resolution-status table at the top of the audit doc cross-links each closed finding to its PR.
- **Default-on safety stance:** [`docs/safety-stance.md`](docs/safety-stance.md) — four primitives that form the hard floor.
- **Agent autonomy contract:** [`docs/agent-autonomy.md`](docs/agent-autonomy.md) — what agents can / cannot / will never do, plus the if-something-feels-wrong checklist.
- **Compliance frameworks:** Protected B Decision Architecture, Protected B Risk Register, FedRAMP Low, SOC 2 CC7, HIPAA BAA. Live posture at `/portal/compliance`.

Verifiable trust primitives:

- **HMAC-SHA256 signed evidence exports** with per-workspace key derivation. Watermarked with requesting member id. Verifiable outside the portal via `scripts/verify-bundle.ts` — a procurement officer with the master key can confirm authenticity without trusting the portal being online.
- **Key rotation** via `PORTAL_EXPORT_SIGNING_KEY_PREVIOUS`. Bundles signed under the old key still verify with a rotation `NOTE`.
- **CodeQL** static analysis on every PR + weekly cron.

---

## Configuration

`.env.local.example` is the canonical reference. Walkthrough order:

| Env var | Purpose | Required when |
|---|---|---|
| `PORTAL_DEMO_MODE` | Explicitly enable labeled sample-data portal mode in production | Public demo deployments only |
| `PORTAL_DEV_BYPASS` | Skip OAuth, use deterministic membership | Local dev only |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth | Phase 2.1, when real identity ships |
| `AUTH_GOOGLE_REDIRECT_URI` | OAuth callback URL | Phase 2.1 |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Activate `SupabasePortalRepository` | Phase 2.1 |
| `ANTHROPIC_API_KEY` | Anthropic Messages API | Real agent runs (otherwise deterministic stubs) |
| `PORTAL_API_KEY` | Bearer-token gate for `/api/portal/v1` | Production |
| `PORTAL_ALLOW_OPEN_API` | Opt into unauthenticated API in production | Demo deployments only |
| `PORTAL_API_RATE_BURST` / `PORTAL_API_RATE_REFILL` | Tune the rate limiter | Tuning only (defaults 30 / 5) |
| `PORTAL_EXPORT_SIGNING_KEY` | HMAC master key for evidence bundles | Audit-grade exports |
| `PORTAL_EXPORT_SIGNING_KEY_PREVIOUS` | Rotation slot | During key-rotation windows |
| `NEXT_PUBLIC_PORTAL_BASE_URL` | Public base URL for examples and generated links | Production |
| `SENTRY_DSN` or equivalent | Error reporting endpoint | Public launch, after vendor choice |

---

## Design system

- **Color philosophy:** Deep ultraviolet `#7c3aed`. Token-only colors throughout (`--accent-vivid`, `--text-primary`, etc.). No hex codes in component files.
- **Typography:** Inter (body), Space Grotesk (display), JetBrains Mono (code/data).
- **Token system:** see `app/globals.css` `:root` block. WCAG AA contrast on `--text-muted` since the May 2026 a11y pass.
- **Card anatomy:** `<DashboardCard>` is the only card surface. Eyebrow (uppercase) → title → optional badge → optional subtitle → body. See `components/cards/dashboard-card.tsx`.
- **Agent states:** `idle | thinking | working | complete | blocked | error`. Each has a colour treatment + ring + status dot. See `components/cards/dashboard-card.tsx` and the showcase at `/showcase`.
- **Patterns:** `<GlossaryTerm>`, `<ActorBadge>`, `<ConfirmAction>`, `<PoliteAnnouncer>` — see `components/patterns/`.
- **Density:** Top-bar toggle (compact / comfortable). Persisted in `dauntless-density` cookie + `[data-density]` on `<html>`.

Binding rules: `AGENTS.md` and `docs/vocabulary.md`.

---

## Repository tour

```
app/
  (marketing)/          # Marketing pages: /, /services, /work, /pricing, /contact
  (app)/                # App shell route group
    portal/             # 32 portal routes — see "What's in the portal"
    dashboard/          # Chassis-era Command Center (legacy, kept for parity)
    workspace/ agents/ analytics/ settings/ intake/
  api/portal/v1/        # 8 versioned REST API routes
  auth/                 # OAuth callback (Phase 2.1)
  layout.tsx            # Root layout — resolves locale server-side

components/
  ui/                   # Core primitives (button, input, dialog, tooltip, …)
  shell/                # AppShell, SideRail, TopBar, WorkspaceHeader, density/locale toggles
  cards/                # DashboardCard, AgentCard, WorkspaceGrid
  patterns/             # GlossaryTerm, ActorBadge, ConfirmAction, PoliteAnnouncer, …
  viz/                  # LineChart, BarChart, AreaChart, DonutChart
  marketing/            # MarketingNav, HeroSection, CTA, Footer

lib/
  portal/
    repositories/       # PortalRepository interface + InMemory + Supabase stub
    agents/             # Runner, registry, tool catalog, telemetry
    telemetry/          # Event bus + metrics + Impact Report generator
    innovation/         # Engine, patterns, simulator
    outbound-actions/   # Store, freeze, enabled-connectors, schemas, types
    exports/            # HMAC signing + signed-export server actions
    digests/            # This-week digest + weekly renderer
    governance/         # Controls-in-force calculator
    knowledge/          # Adapter interface + in-memory TF-IDF
    federation/ models/ marketplace/ portfolio/ compliance/
    i18n/dictionary.ts  # EN/FR bilingual scaffolding
    glossary.ts         # 21-entry portal vocabulary
    decision-comments.ts # Decision-scoped comment thread
    types.ts            # Shared portal types
    server.ts           # loadPortalContext()
    actions.ts          # Decision approve/defer/reject server actions
  portal-sdk/           # Typed REST client (Phase 9.1)
  auth/                 # Membership gate, session, runtime
  mock-data/ cn.ts types.ts

scripts/
  verify-bundle.ts      # Standalone signed-bundle verifier

tests/portal/           # 24 smoke suites (npm test)

docs/
  client-portal-roadmap.md          # Long-horizon plan, phase status
  client-portal-target-architecture.md # Architecture canon
  safety-stance.md                  # Default-on safety primitives
  agent-autonomy.md                 # What agents can / cannot / will never do
  personas.md                       # Priya / Marie / Marcus tests
  vocabulary.md                     # Jargon-or-banned policy
  advisory-board-cadence.md         # Quarterly review process
  advisory-board/2026-05.md         # Most recent session report
  caia-mapping.md                   # CAIA reference architecture
```

### Where to read code (top 10)

| File | Read first if you want to understand… |
|---|---|
| `lib/portal/repositories/types.ts` | The data contract; every persistence operation |
| `lib/portal/server.ts` | How a page gets workspace + membership |
| `lib/auth/membership-gate.ts` | Who can do what |
| `lib/portal/agents/runner.ts` | How an agent run actually works |
| `lib/portal/agents/tool-catalog.ts` | Separation of powers |
| `lib/portal/telemetry/event-bus.ts` | What flows where |
| `lib/portal/outbound-actions/store.ts` | The propose→approve→commit lifecycle |
| `lib/portal/exports/signing.ts` | How signed bundles work |
| `lib/portal/innovation/engine.ts` | The five heuristics |
| `app/(app)/portal/page.tsx` | Server-rendered Command Center entry point |

---

## Extending the portal

Concrete recipes live in [`NEXT_STEPS.md`](NEXT_STEPS.md) §5. Quick pointers:

- **Add a route** → `app/(app)/portal/<name>/{page,view}.tsx`, link from the command palette
- **Add a card variant** → register in `components/cards/dashboard-card.tsx`
- **Add a write path** → extend the `PortalRepository` interface, implement in `in-memory.ts`, surface a server action
- **Add an agent** → add a definition in `lib/portal/agents/registry.ts`, register tools, write the separation-of-powers test

Conventions to keep: token-only colors, `<DashboardCard>` for every card, no `Math.random()` in render, hover tooltips on every jargon term, real `<h1>` per page.

---

## Where we go next

Top of the pick-up queue (full list in [`NEXT_STEPS.md`](NEXT_STEPS.md) §4):

1. **Phase 2.1 — Supabase persistence + real OAuth.** ~1 week against the locked repository contract. Today the portal runs on the in-memory seed; restarts wipe state.
2. **Phase 6.1 — Persist the telemetry event bus.** Keeps the Impact Report and weekly digest meaningful across restarts.
3. **Phase 4.2 — pgvector knowledge adapter.** Current TF-IDF is deterministic and scales to ~1000 artifacts.
4. **Phase 9.1 — Publish the SDK to npm + scoped API tokens.**

Lower priority: real-time signals, persisted innovation proposals (engine itself is shipped), full FR coverage on every surface (scaffolding is in place).

---

## Doc index

| Doc | Purpose |
|---|---|
| [`NEXT_STEPS.md`](NEXT_STEPS.md) | The hand-off doc. Read first if you're picking up. |
| [`docs/client-portal-target-architecture.md`](docs/client-portal-target-architecture.md) | Architecture canon. |
| [`docs/client-portal-roadmap.md`](docs/client-portal-roadmap.md) | Phase status + long-horizon plan. |
| [`docs/safety-stance.md`](docs/safety-stance.md) | Default-on safety primitives. |
| [`docs/agent-autonomy.md`](docs/agent-autonomy.md) | What agents can / cannot / will never do. |
| [`docs/personas.md`](docs/personas.md) | Priya / Marie / Marcus tests. |
| [`docs/vocabulary.md`](docs/vocabulary.md) | Jargon policy. |
| [`docs/advisory-board-cadence.md`](docs/advisory-board-cadence.md) | Quarterly review process. |
| [`docs/advisory-board/2026-05.md`](docs/advisory-board/2026-05.md) | Most recent advisory-board session. |
| [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md) | May 2026 audit + resolution status. |
| [`SECURITY.md`](SECURITY.md) | Responsible disclosure policy. |
| [`AGENTS.md`](AGENTS.md) | Binding rules for any agent (human or AI) committing code. |
| [`docs/caia-mapping.md`](docs/caia-mapping.md) | CAIA reference architecture mapping. |

---

## License

Internal repository — no published license. Package metadata is marked `UNLICENSED`. Security disclosures: see [`SECURITY.md`](SECURITY.md) and the current baseline in [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md).
