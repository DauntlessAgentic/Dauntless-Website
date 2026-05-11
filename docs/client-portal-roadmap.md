# Dauntless Agentic — Client Intelligence Portal

**Product Roadmap (v1.0)**

This roadmap is the forward-looking companion to `docs/client-portal-target-architecture.md`.
The architecture doc says **what** the portal is. This doc says **what comes next, in what
order, why, and how we'll know we're done**.

It is intentionally long-horizon. Phases 2–6 are concretely scoped; Phases 7–15 sketch
the platform's strategic arc — enough detail that a future agent or operator can
land in any phase and ground quickly.

---

## Where we are

**Phase 3.0 — Engagement Analyst end-to-end (shipped, PR TBD)**

Branch: `claude/portal-phase-3-engagement-analyst`. See the Phase 3
section below.

**Phase 2.0 — Repository abstraction & identity gate (shipped, PR #2)**

Branch: `claude/portal-phase-2-persistence-identity`. See the Phase 2
section below.

**Phase 1 — Foundation slice (shipped, PR #1)**

The first implementation slice of the portal is live on `claude/client-portal-mvp-3CFwb`:

- Architecture doc (`docs/client-portal-target-architecture.md`)
- Domain model (`lib/portal/types.ts`) covering every entity in the architecture
- Deterministic mock data (`lib/portal/mock-data.ts`) — one government client (TBS · AI Modernization), 3 engagements, 10 artifacts, 9 decisions, 5 agents, 14 tasks, 12 signals, 12 knowledge items, 8 metrics, 10 audit entries
- Command Center (`/portal`) with the five-section Decision Surface, engagement health, living deliverables, agent fleet, concierge thread, compounding-outcomes chart, knowledge-shelf preview, trust-architecture footer
- Seven secondary surfaces: Engagements · Deliverables · Decisions · Agents · Knowledge · Outcomes · Governance
- Six reusable patterns: `portal-status-card`, `decision-list`, `artifact-list`, `agent-fleet-panel`, `evidence-link`, `knowledge-shelf`
- Chassis improvements: `DashboardCard.badgeVariant`, typed recharts payloads, lazy-init theme pattern, intake render purity
- `npm run lint` → 0 errors; `npm run build` → green (every portal route prerenders static)

What it isn't yet: real auth, real persistence, real agent runtime, real metrics
telemetry. That's everything below.

---

## Tier alignment

The roadmap is structured around the four product tiers the marketing site already
promises clients. Phases map to tiers as follows:

| Tier (marketing)            | Phases that complete it                                                                      |
|-----------------------------|----------------------------------------------------------------------------------------------|
| **Core Portal**             | Phase 2 (persistence + identity) · Phase 3 (one real agent) · Phase 4 (artifact engine)      |
| **Advanced Portal**         | Phase 5 (full agent fleet) · Phase 6 (outcomes + cross-engagement intelligence)              |
| **Innovation Studio**       | Phase 7 (autonomous innovation engine) · Phase 8 (multi-workspace) · Phase 9 (API / SDK)     |
| **Enterprise & Network**    | Phase 10 (compliance) · Phase 11 (embedded ops) · Phase 12 (federation) · 13–15 (flywheel)   |

The marketing site (`/platform`) sells these as separate purchase tiers. Internally
they are phases of the same product.

---

## CAIA reference points

Several phases pull architectural reference from the CAIA repo (sibling repo, not
accessible from inside this portal repo's Claude Code session). The user has named
four CAIA subsystems worth reusing or porting:

- **LLM-wiki mem-palace** — informs `KnowledgeItem` evolution in Phase 4
- **Calendar booking gizmos** — informs the workspace scheduling surface in Phase 5 and Phase 7
- **Project management primitives** — informs the milestone/task engine in Phase 4 and Phase 5
- **Artifact development from common knowledge** — informs the canonical promotion + artifact engine in Phase 4 and Phase 7

When a phase references CAIA, the deliverable list says "port from CAIA `<module>`"
explicitly. A fresh Claude Code session running from a parent folder containing both
repos can read those references and plan the port directly.

---

## Phase 2 — Real persistence and identity

**Status**: **Phase 2.0 shipped** on `claude/portal-phase-2-persistence-identity`.
Phase 2.1 (real Supabase OAuth + RLS) is the remaining work.
**Theme**: stop pretending. Real users, real data, real RLS.
**Estimate**: 4–6 weeks (Phase 2.1)
**Unlocks**: every subsequent phase. This is the gate.

### Phase 2.0 — what shipped

- `lib/portal/repositories/` — `PortalRepository` interface + in-memory
  adapter that wraps the deterministic seed. Mutations append to an audit
  log and emit signals in the same call.
- `lib/portal/server.ts#loadPortalContext()` — every portal server-component
  page now goes through this; **zero client-side imports of `mock-data`
  remain in `app/(app)/portal/*`**.
- `lib/auth/runtime.ts` + `lib/auth/session.ts` + `lib/auth/membership-gate.ts`
  — typed `MembershipContext` tagged union, pure role/action predicates.
- `components/shell/role-switcher.tsx` — TopBar dev-bypass impersonation,
  cookie-driven, server-action backed.
- `lib/portal/actions.ts` — `approveDecision`, `deferDecision`,
  `rejectDecision`, `promoteKnowledge`. All audited, all gated, all
  revalidate the portal layout.
- Governance page now surfaces repository activation status + identity
  status as the top row.
- `tests/portal/repository.test.mjs` — six-test smoke suite covering the
  repository contract (`npm test`, runs under `tsx --test`).

### Phase 2.1 — what's left

Sub-phase still required to claim "Phase 2 complete":

- Supabase schema mirroring `lib/portal/types.ts` (one table per entity;
  append-only audit log; soft-deletes only; version tables for `Artifact`
  and `Decision`).
- Row-level security keyed off `Membership.role` and `workspaceId`.
- `SupabasePortalRepository` concrete implementation behind
  `SUPABASE_URL` env var, wired into the factory in
  `lib/portal/repositories/index.ts`.
- Google OAuth via NextAuth v5 (port the CAIA pattern). Microsoft / GCKey
  follow as separate adapters.
- Seed fixtures generated from the same `mock-data` factories so demo and
  production share data shape.
- One-shot provisioning script: `scripts/portal/provision-workspace.ts`.

### Phase 2.0 acceptance — met by this branch

- Pulling the plug on `mock-data` imports leaves the UI fully functional
  (verified: zero `mock-data` imports remain in `app/(app)/portal/*`).
- Two different "users" see different views based on `Membership.role`
  (verified manually via the TopBar role switcher).
- The audit-log grows append-only on every approval / promotion (verified
  in `tests/portal/repository.test.mjs`).

### Phase 2.1 acceptance

- A new workspace can be provisioned via a one-shot script.
- Two different test users authenticated via OAuth see different views
  based on `Membership.role`.
- The audit-log table grows append-only on every approval / publish /
  agent run in the live Supabase backend.

### Risks

- Schema churn after Phase 4 (artifact engine) — mitigate by versioning the migrations and treating Phase 4's artifact tables as a separate concern
- OAuth callback URL discipline across environments — document the Cloudflare / Vercel proxy rule (already noted in `lib/auth/supabase.ts`)

---

## Phase 3 — One real agent, end-to-end

**Status**: **Phase 3.0 shipped** on `claude/portal-phase-3-engagement-analyst`.
The orchestrator, tools, telemetry, propose→approve flow, and a stub mode
are in. Phase 3.1 (live evaluation harness + cache-hit-rate hardening) is
the remaining work.
**Theme**: the propose→approve→commit loop running against a real model.
**Estimate**: 4–6 weeks (Phase 3.1)
**Unlocks**: every other agent in the fleet; the credibility claim on `/services/agentic-systems`.

### Phase 3.0 — what shipped

- `lib/portal/agents/runtime/anthropic.ts` — direct `fetch` against the
  Anthropic Messages API, prompt caching headers, normalized
  `ProviderRuntimeError` shapes. No SDK dep.
- `lib/portal/agents/tools.ts` — five-tool surface: `search_artifacts`,
  `read_decision`, `summarize_signals`, `cite_evidence`, `propose_decision`.
  Read tools go through the `PortalRepository`; the only write is
  `propose_decision` which lands a `pending-approval` row.
- `lib/portal/agents/engagement-analyst.ts` — orchestrator with a tool-use
  loop (up to 6 turns), system prompt + workspace bookshelf cached. Falls
  back to a deterministic stub when `ANTHROPIC_API_KEY` is unset so the
  UX is exercisable end-to-end without paying for tokens.
- `lib/portal/agents/telemetry.ts` — in-process run ledger with token,
  cost, and cache-hit-rate summaries. Surfaced on `/portal/governance`
  as the "Cost & cache health" card + "Recent agent runs" feed.
- `lib/portal/agents/actions.ts` — `runEngagementAnalystAction`,
  gated to owner / executive / lead.
- `app/(app)/portal/agents` — "Live runtime" card with a steering prompt
  textarea and a Run button. Shows the last run's status, cost, cache hit
  rate, tools called, and links to the proposed decision in the Register.
- Repository extended with `proposeDecision()` — appends an `agent-run`
  audit entry and a `decision-proposed` signal atomically.
- `tests/portal/agent-engagement-analyst.test.mjs` — 5-test smoke suite
  covering the stub run, repository state transitions, audit + signal
  emission, and telemetry recording.

### Phase 3.1 — what's left

- Evaluation harness: replayable transcripts for shipped decisions. Each
  proposal becomes a test fixture; we run the agent against the workspace
  state at the time and assert the same option scored highest.
- Conversation persistence: today the agent run is one-shot. The next
  iteration should write each run's tool trace + assistant turns into a
  `Conversation` so it's citeable as Evidence.
- Confidence auto-routing: when `confidence < 0.5`, label the proposal with
  a "human review required" flag and gate the executive approval button
  behind a second pair of eyes.
- Live cache-hit-rate ≥ 0.6 acceptance criterion (the roadmap's gate).
  Requires repeated runs against a stable system prompt + bookshelf, and
  is only meaningful with an API key.

### Why now (original)

It's easier to harden the entire governance flow against one well-scoped agent
than to scale a fleet that hasn't proven the loop.
- One canonical evaluation harness: replayable "did the agent propose the right decision?" trace for every shipped decision

### Acceptance criteria

- The Engagement Analyst can propose a real decision from a real artifact set and the client can approve it through the UI
- Every agent action has a 100% audit-log trace (matches the `met-agent-action-trace` metric already in the portal)
- Cache hit rate ≥ 0.6 on second-and-later conversations within a workspace
- Cost per shipped decision is reported in the Governance surface

### Risks

- Hallucinated evidence — mitigated by requiring `cite_evidence` to return a real `Evidence` row, not a freeform string
- Agent capturing too much scope — mitigated by the explicit `scope` field on `Agent` and tool-level enforcement

### CAIA hooks

- Reuse the agent runtime scaffolding if CAIA already has a Claude-API agent harness with prompt caching wired

---

## Phase 4 — Artifact engine and the canonical promotion loop

**Theme**: make artifacts first-class. Make compounding literal.
**Estimate**: 6–8 weeks
**Unlocks**: the Bookshelf actually compounds; cross-engagement reuse becomes possible.

### Why now

Living deliverables are the marketing promise. Today the portal models them but
doesn't let you author or evolve them. Without this, "compounding" stays a slogan.

### Deliverables

- Rich artifact editor (Markdown + structured fields per `ArtifactType`)
- Inline citation system: every claim in an artifact links to an `Evidence` row
- Artifact diff view between any two versions
- Comment threads tied to specific versions (not the artifact in general)
- "Propose for canonical" workflow routed through the Governance Auditor for evidence and freshness checks
- Cross-engagement clone / adapt / fork primitive — a canonical artifact can spawn a new engagement-scoped working copy
- Workspace-wide search across artifacts, decisions, signals, and conversations with provenance and freshness filters
- KnowledgeItem evolution: ports CAIA's LLM-wiki mem-palace into `lib/portal/knowledge/*` — links, backlinks, automatic embedding-based retrieval, M0→M4 promotion paths driven by usage signals
- Confidence decay job: scheduled task that ages `confidence` and `freshness` based on validation cadence and downstream citations

### Acceptance criteria

- A net-new engagement can fork an artifact from the Bookshelf and end up with a working copy plus a backlink to the canonical
- The Governance Auditor agent can autonomously check evidence completeness on a "propose for canonical" submission and recommend approve / revise / reject
- Workspace search returns ranked results across all four entity classes with provenance chips
- Confidence decay produces a real list of items to revalidate, surfaced in the Knowledge page

### Risks

- Editor scope creep — keep to Markdown + structured fields; do not build a Notion clone
- Embedding cost on workspace search — cache aggressively, batch embedding generation

### CAIA hooks

- Port CAIA's mem-palace data model and retrieval into `lib/portal/knowledge/*`
- Port CAIA's artifact-development-from-common-knowledge primitives into the canonical promotion loop

---

## Phase 5 — Full agent fleet and the real-time Decision Surface

**Theme**: the cockpit is alive.
**Estimate**: 8–12 weeks
**Unlocks**: the Advanced Portal tier; sells multi-engagement clients.

### Why now

One agent proves the loop. The promise is a fleet with separation of powers. Until
that's running, the marketing claim "no agent both routes and executes, no agent both
produces and audits" is unproven.

### Deliverables

- All four archetypes live, each with a scoped tool surface:
  - **Strategists**: Engagement Analyst (Phase 3, hardened), plus Roadmap Strategist for cross-engagement sequencing
  - **Operators**: Report Builder, Artifact Drafter, Activation Coach
  - **Auditors**: Governance Auditor (Phase 4, hardened), plus Evidence Auditor for evidence-chain completeness
  - **Chief of Staff**: Concierge (mediator, escalator, summary engine)
- Runtime policy layer enforcing separation of powers: a Strategist cannot call Operator tools; an Operator cannot call Auditor tools; an Auditor cannot mutate any artifact it audits
- Next-Best-Actions engine wired as a real ranking pipeline: impact × confidence × due-date × engagement-phase weight
- Real-time signals via Supabase Realtime: the "What changed?" feed updates live
- Concierge narration: the Concierge agent generates the "What needs my judgment this week?" briefing on demand and on cadence
- Calendar surface: bookings, walkthroughs, SteerCo prep — port the CAIA calendar gizmos into `app/(app)/portal/schedule/page.tsx`
- Agent run dashboard in `/portal/governance` deepens — token usage, decisions proposed, audit findings per agent
- Inter-agent handoff protocol: an Operator finishing a draft can hand off to an Auditor; the handoff is itself an audit-log entry

### Acceptance criteria

- The portal passes a "separation of powers" test suite: no single agent successfully both routes and executes; no single agent both produces and audits
- The Decision Surface "What changed?" feed updates without a page refresh
- The Concierge can answer "what are the top three decisions waiting on me?" using the live ranking engine, with citations to each decision
- Calendar bookings show up as `Signal` entries and can be referenced from artifacts

### Risks

- Policy layer becomes the bottleneck — mitigate with hot-path caching and an explicit deny-list-only contract for runtime decisions
- Agent count growth makes cost forecasting hard — instrument per-agent budgets in Governance

### CAIA hooks

- Calendar booking gizmos → `app/(app)/portal/schedule/`
- Project management primitives → milestone + task engine reuse in Engagements page

---

## Phase 6 — Outcomes telemetry and cross-engagement intelligence

**Theme**: prove the ROI. Close the compounding loop.
**Estimate**: 10–14 weeks
**Unlocks**: quarterly proof reports; the second-engagement-is-faster claim becomes literal.

### Why now

Phase 5 makes the portal feel alive. Phase 6 makes it provable. The Quarterly Impact
Report becomes a generated artifact, not a hand-authored deck, and new engagements
start enriched by prior ones.

### Deliverables

- Telemetry event bus: every artifact review, decision cycle, agent run, and approval emits a structured event into a metrics table
- `Metric` rows auto-update from telemetry (adoption, cycle time, capability score, governance readiness, review velocity, decision approval cycle, canonical density, agent-action trace)
- Quarterly Impact Report generation pipeline: the Report Builder agent assembles a board-ready briefing from live data with inline citations to artifacts, decisions, and metrics
- Cross-engagement intelligence: when a new engagement starts, the portal surfaces relevant canonical artifacts, prior decision patterns, and risk-register entries from past engagements
- Engagement archetype detection: classify a new engagement (Discovery / Design / Build / Activate / Advisory) and pull the matching canonical playbook
- Partner read-only view: stakeholders outside the workspace can be granted a scoped, watermarked, time-boxed view onto a single artifact or decision packet
- Signed evidence exports: every export is signed, watermarked with the requesting member, and recorded in the audit log

### Acceptance criteria

- A Quarterly Impact Report can be generated with one click and every claim it makes is traceable to a live `Metric` or `Evidence` row
- A new engagement opened in an existing workspace surfaces ≥ 5 relevant prior artifacts on day one
- Signed exports verify against the workspace public key
- The marketing site's "second engagement is faster, sharper, and more valuable" claim can be backed with measured data (cycle-time delta vs. first engagement)

### Risks

- Metric drift over a long horizon — version metric definitions and require a migration for any change
- Cross-engagement bleed between confidential client streams — RLS plus an explicit `crossEngagement: boolean` flag per artifact

---

## Phase 7 — Innovation Studio and the Autonomous Innovation Engine

**Theme**: the top marketing tier becomes operational.
**Estimate**: 12–16 weeks
**Unlocks**: the strategic-partner price point; Dauntless's most ambitious client motion.

### Why now

The marketing site explicitly sells "Autonomous Innovation Engine" and "Next Best
Course of Action" as the flagship Innovation Studio capability. Phases 5–6 have
built the substrate; Phase 7 makes the autonomous claim real.

### Deliverables

- Innovation Studio surface (`/portal/innovation`) — a curated cockpit for clients in the strategic-partner tier, exposing roadmap simulation, bet-sequencing, scenario comparison
- Autonomous Innovation Engine: a long-running agent process that watches signals, identifies emergent opportunities, drafts proposals, and queues them as `Decision` rows
- Next-Best-Course-of-Action engine: scenario-level ranking, not just task-level. Operates over a multi-quarter horizon with reversibility costs and option values
- Roadmap simulation: client can ask "what happens if we anchor Horizon-2 on Service Design vs. HR-ops" and get a forward-projected outcome chart
- Decision-tree visualization: the portal shows the branching consequence graph for any pending high-tier decision
- Pattern library exposure: the 200+ encoded delivery patterns referenced on the marketing site become a queryable surface inside the Studio
- Innovation rate metric: a new `Metric` capturing how many canonical-promoted ideas originated in the Studio vs. a traditional engagement

### Acceptance criteria

- A strategic-partner workspace can run the Autonomous Innovation Engine continuously for ≥ 30 days without human intervention except at decision gates
- Roadmap simulation produces forecasts that backtest against historical engagement outcomes within an acceptable error band (definition TBD with first partner)
- The pattern library is searchable, citable from artifacts, and growing

### Risks

- Over-promising autonomous outcomes — keep the governance gates loud and visible
- Compute cost — set per-partner budget ceilings with hard cutoff plus human escalation

### CAIA hooks

- The artifact-development-from-common-knowledge subsystem feeds the pattern library exposure

---

## Phase 8 — Multi-workspace, org rollups, cross-department visibility

**Theme**: clients with multiple departments or programs see the whole portfolio.
**Estimate**: 8–10 weeks
**Unlocks**: enterprise / large-government sales motion; multi-program engagements.

### Why now

A federal department or large enterprise has many programs. The single-workspace
model is a wall. Solving this is the unlock for the deeper public-sector contracts.

### Deliverables

- Organization-level rollup view (`/portal/org`) — KPIs and decision flow aggregated across all of an organization's workspaces
- Cross-workspace memberships: a user can hold different roles in different workspaces under the same org
- Workspace switcher in TopBar with visibility scoped by membership
- Org-level Governance view — audit log aggregated across workspaces, with redaction rules for cross-workspace viewing
- Org-level Knowledge view — canonical artifacts promoted to org-wide reuse with explicit consent and provenance
- Permission inheritance: an org-level executive can be granted optional read-only access into any workspace
- Cross-workspace dependency graph: visualize which decisions in workspace A reference artifacts from workspace B
- Tenancy isolation hardening: per-org encryption keys; per-workspace data residency where regulation requires it

### Acceptance criteria

- A test org with three workspaces correctly rolls up KPIs without cross-contaminating membership or audit visibility
- A canonical artifact promoted to org level is referenceable from every workspace under that org with the original provenance intact
- Tenancy isolation passes a red-team exercise

### Risks

- Sharing UX overwhelm — design the cross-workspace flows with explicit scopes; default to private
- Permission model complexity — keep the role table flat (no nested roles); use scopes as the granular axis

---

## Phase 9 — Public API, SDK, and the extension model

**Theme**: clients with engineering teams build on top of the portal.
**Estimate**: 10–14 weeks
**Unlocks**: integration partnerships; deeper product stickiness; the developer-tier sales motion.

### Why now

By Phase 9 the portal is the system of record for client AI operations. A read/write
API plus a typed SDK lets clients pipe their own workflows into the portal, and
lets partners build value on top.

### Deliverables

- REST + Webhook API covering every public entity (`Engagement`, `Artifact`, `Decision`, `Signal`, `Metric`, `Conversation`)
- Typed JavaScript / TypeScript SDK published as `@dauntlessagentic/portal-sdk`
- Python SDK for data-science clients (`dauntless_portal`)
- Webhooks for: decision lifecycle, artifact published, agent run completed, metric shift, signal emitted
- API keys scoped per `Membership` with rate limits and audit
- Public API explorer (`/portal/api`) — interactive docs hosted in the portal itself
- Extension model: portal pages can render a third-party panel inside a `DashboardCard` provided the extension declares its scope and tool surface
- First-party extensions: GitHub, Linear, Notion (read-only into evidence pipeline)
- Extension marketplace skeleton (no payments yet) — listing, install, scope review

### Acceptance criteria

- A client engineer with no Dauntless contact can read the API docs, get a key, and pull a real `Decision` via the SDK in under 15 minutes
- Webhooks deliver with at-least-once semantics and per-subscriber retry
- A first-party extension can render in a workspace without modifying portal code

### Risks

- API surface lock-in — version aggressively; deprecate gracefully
- Extension security model — every extension declares scope in a manifest; manifest changes require explicit workspace re-consent

---

## Phase 10 — Compliance and sector packs

**Theme**: become procurable inside government and regulated enterprise.
**Estimate**: 12–16 weeks (mostly process, partial engineering)
**Unlocks**: the federal contracts the marketing site is already targeting (TBS, ESDC, NRCan, ECCC, ISED, CIR).

### Why now

By Phase 9 the platform has real engineering depth. The remaining gate to large
public-sector contracts is compliance posture, not features.

### Deliverables

- **Protected B / IL2 readiness pack**: data classification, retention, and access controls hardened to the Government of Canada standard
- **FedRAMP Low** readiness for U.S. federal — control mapping, audit artifacts, third-party assessor coordination
- **HIPAA pack** for health-sector clients — PHI tagging, BAA template, audit log enrichment
- **SOC 2 Type II** continuous audit instrumentation
- SSO via SAML 2.0 and OIDC; SCIM for user provisioning
- Data residency options (Canada / EU / US) — workspace-level setting
- Customer-managed encryption keys (CMEK / BYOK) at the org level
- Per-workspace data-export-on-demand and right-to-delete tooling
- Sector packs include preloaded canonical artifacts (governance frameworks, risk registers) tuned to that sector's policy landscape

### Acceptance criteria

- A federal department procurement officer can complete a security questionnaire entirely from generated portal evidence
- An SSO-only enterprise client can stand up a workspace with their own identity provider
- A workspace running in Canada cannot have any of its data routed through US infrastructure

### Risks

- Audit timing — assessor scheduling can slip the calendar regardless of code readiness; pre-stage as Phase 9 closes
- Sector pack drift — assign a Governance Lead role to maintain the policy alignment per sector

---

## Phase 11 — Embedded agentic operations

**Theme**: agents take action **in client systems**, not just in the portal.
**Estimate**: 14–18 weeks
**Unlocks**: the marketing claim "managed agentic operations" becomes literal; deepest stickiness.

### Why now

Phases 1–10 build the cockpit. Phase 11 is when agents step out of the cockpit and
act inside client systems (CRMs, ticketing, ERP, custom workflows) under the same
governance contract.

### Deliverables

- Action runtime: a sandboxed worker capable of executing scoped tool calls against client systems via Phase 9's extension API and a new outbound-action contract
- Outbound action governance: every action emits a `propose → approve → commit` cycle just like a decision; high-risk actions require explicit human approval each time
- Pre-built outbound connectors: HubSpot, Salesforce, Jira, ServiceNow, Microsoft Graph, Google Workspace
- Custom connector SDK: clients can register their own outbound destinations with the same governance contract
- Counterfactual & dry-run mode: any outbound action can be simulated and shown in the Decision Surface before committing
- Failure recovery: any committed action produces an inverse action plan if it later needs to be undone
- Outbound action telemetry feeds the `met-agent-action-trace` metric to maintain 100% coverage

### Acceptance criteria

- A client can authorize the Activation Coach to schedule calibration touchpoints directly into Outlook calendars, with each scheduled meeting traceable in the audit log
- The Engagement Analyst can read from a Jira project and propose decisions using its tickets as evidence, without write access
- A high-risk outbound action requires fresh human approval even if the agent has approval to act
- The audit log preserves end-to-end provenance from agent reasoning → propose → approve → committed action → client-side artifact

### Risks

- Blast-radius — keep risk-tier gating mandatory; default everything new to "dry-run only"
- Connector maintenance cost — invest in connector test harnesses early

---

## Phase 12 — Federated trust and cross-tenant knowledge

**Theme**: organizations opt into a shared canonical layer.
**Estimate**: 16–20 weeks
**Unlocks**: the flywheel; sector-wide intelligence; defensible moat at the network level.

### Why now

After Phase 11 every workspace has accumulated canonical patterns. Sector-wide
patterns (a Protected-B governance framework, a federal procurement playbook) have
value beyond a single client. Federated trust lets clients opt in to a shared layer
without losing tenancy isolation.

### Deliverables

- Federation primitive: a `Workspace` can opt artifacts (with consent and anonymization) into a `Federation` of peer workspaces
- Anonymization pipeline: PII, client-identifying language, and engagement-specific data scrubbed before federation
- Federation governance: a federation has its own audit log, membership, and trust tier; participating workspaces can leave with their contributions revoked
- Cross-tenant search: federation members can search the shared canonical layer; provenance is preserved as federation-level, not workspace-level
- Sector federations: Federal-Canada, U.S.-Federal, Healthcare, Financial-Services — preloaded with Dauntless-managed canonical anchors
- Revenue model hooks: federation membership becomes a billable seat (foundation for Phase 14)

### Acceptance criteria

- A workspace can contribute an artifact to a federation, leave the federation, and verifiably remove that contribution
- Cross-tenant search results never expose workspace-identifying provenance
- The Protected-B Federation passes a Government of Canada cross-tenant security review

### Risks

- Anonymization correctness — invest heavily; assume adversarial deanonymization attempts
- Federation governance becoming political — pre-define the conflict-resolution protocol before launch

---

## Phase 13 — Portal-trained models and per-workspace fine-tunes

**Theme**: the agents get smarter on **your** patterns specifically.
**Estimate**: 12–16 weeks
**Unlocks**: the most defensible per-client moat; an obvious upgrade path for power clients.

### Why now

After Phase 12, workspaces (and federations) have rich, labelled, provenance-anchored
data. Fine-tuning a model on a workspace's canonical layer produces an agent that
proposes decisions in that organization's voice and within its policy posture.

### Deliverables

- Training-data extraction pipeline: turn workspace artifacts, decisions, conversations, and audit-log outcomes into a dataset
- Per-workspace fine-tuning workflow with explicit data-residency and consent boundaries
- Model registry inside the portal: a workspace can run a baseline model and a fine-tuned variant side by side, with A/B routing
- Quality gates: a fine-tuned model must outperform baseline on a workspace-specific eval set before it is allowed to replace the default
- Drift detection: continuous evaluation against new decisions; auto-rollback on regression
- Privacy: training data never leaves the workspace's data-residency boundary

### Acceptance criteria

- A workspace can fine-tune a model on its own data, evaluate it, and route the Engagement Analyst to the fine-tuned variant with measured uplift
- Fine-tuned weights never cross a workspace boundary
- Auto-rollback fires within 24 hours of a measurable regression

### Risks

- Cost — fine-tuning is expensive; bundle into a clearly-priced upgrade SKU
- Overfitting to client voice and losing critical thinking — mandate that the Governance Auditor remains on the baseline model

---

## Phase 14 — Portfolio intelligence and the Dauntless-side rollup

**Theme**: Dauntless-the-company sees its entire client portfolio as one cockpit.
**Estimate**: 6–10 weeks (mostly reuses existing surfaces)
**Unlocks**: Dauntless internal operations; pricing intelligence; account-management leverage.

### Why now

Dauntless is the operator. By Phase 14 every client workspace generates signals
worth aggregating at the firm level — engagement health, decision patterns, agent
quality, cost-to-serve. A Dauntless-side portfolio view turns the portal into the
company's operational backbone.

### Deliverables

- Dauntless-internal `Portfolio` workspace — read-only roll-up across all client workspaces (with explicit consent disclosed in client contracts)
- Account health scoring: engagement progress, agent quality, decision velocity, risk register state
- Pricing intelligence: per-engagement gross margin, cost-to-serve, churn risk score
- Pattern emergence: identify canonical artifacts emerging in multiple workspaces independently — candidates for federation
- Operations cockpit: where to invest engineering effort, which clients are quietly expanding, which need an account review
- Dauntless-internal Decision Register: high-leverage internal decisions (pricing, sector focus, hiring) tracked with the same propose→approve→commit rigour clients use

### Acceptance criteria

- Dauntless partners can see firm-level health in under a minute, drilling down to a single workspace where useful
- Account expansion candidates are surfaced automatically based on usage signals
- The internal Decision Register has been used to make and ship a real Dauntless-level decision (the first canonical example: "what should Phase 15 be?")

### Risks

- Client consent posture — every roll-up signal must be disclosed in client contracts; default-deny anything beyond aggregate metrics
- Dauntless becoming dependent on its own product — actually a feature, not a risk, but document the disaster-recovery plan

---

## Phase 15 — Open agent market and third-party tools

**Theme**: the portal is an operating system. Third parties build for it.
**Estimate**: 14–20 weeks
**Unlocks**: ecosystem; network defensibility; sales velocity from partner-led motion.

### Why now

After Phase 9 (API/SDK) and Phase 11 (outbound actions), the portal is genuinely
extensible. Phase 15 makes it a market: third-party agents and tools register
against workspaces under the same governance contract Dauntless agents follow.

### Deliverables

- Agent submission spec: a third-party agent declares archetype, scope, tools, model, eval results
- Eval harness: every submitted agent runs through a Dauntless-maintained evaluation before listing
- Marketplace surface: workspace admins browse, install, configure, and audit third-party agents
- Revenue split: per-install fee + usage share with the third-party developer
- Independent assurance: third-party agents are audited by Dauntless's Governance Auditors; published assurance reports
- Killswitch: any third-party agent can be revoked workspace-wide or globally within minutes
- Open standards: publish the agent submission spec as an open standard; invite partner consultancies to use it

### Acceptance criteria

- A third-party developer can ship a useful agent into a real workspace under the same governance contract as Dauntless's own fleet
- Revenue share is paid out monthly with full audit
- A globally killswitched agent stops running across every workspace within 5 minutes

### Risks

- Quality erosion — keep the eval bar visibly high; publish failure cases
- Liability — be explicit about the assurance contract; carry insurance for marketplace-mediated risk

---

## Cross-cutting concerns (every phase)

These don't get their own phases; they run through everything.

| Concern                    | Standing commitment                                                                   |
|----------------------------|---------------------------------------------------------------------------------------|
| **Testing**                | Each phase ships with deterministic mock-data fixtures and a smoke-test suite for its new surfaces. We add a CI workflow no later than Phase 2. |
| **Observability**          | Every shipped surface emits structured telemetry into the Phase 6 event bus from day one — even before Phase 6 lands. Backfill onto the bus when it arrives. |
| **Performance**            | Every page measures p95 render under 200ms in a real workspace at the close of every phase. |
| **Documentation**          | The architecture doc and this roadmap update in the same PR that lands the phase. No orphaned docs. |
| **Dauntless dogfooding**   | Dauntless runs its own consulting practice on the portal continuously. The internal workspace is the canary for every phase. |
| **Marketing alignment**    | Every shipped phase produces at least one marketing-site update demonstrating the capability. The portal is the proof, not the pitch. |

---

## How a fresh Claude Code session should pick this up

If you're an agent landing in a parent folder containing this repo and CAIA, read
in this order:

1. `docs/client-portal-target-architecture.md` — what the portal is.
2. `docs/client-portal-roadmap.md` — this doc.
3. `AGENTS.md` — binding chassis rules.
4. The relevant CAIA module for the phase you're picking up (mem-palace for Phase 4, calendar for Phase 5, etc.).
5. `lib/portal/types.ts` and `lib/portal/mock-data.ts` to ground the domain.

Then pick a phase, scope it down into a slice that compounds (no half-built
surfaces), and ship.

---

## Versioning this roadmap

This is v1.0. Bump the version in the title when you materially change phase order,
scope, or numbering. Phase numbers are stable once shipped (Phase 1 is forever
Phase 1). Phases that haven't shipped can be re-scoped freely as long as the
version is bumped and the change is explained in a short "Why v1.X" section here.
