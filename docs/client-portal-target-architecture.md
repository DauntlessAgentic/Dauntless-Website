# Dauntless Agentic — Client Intelligence Portal

**Target Architecture (v1.0 — overnight implementation slice)**

The Client Intelligence Portal is the post-marketing surface of dauntlessagentic.com.
Where the marketing pages describe what we promise, the portal is where that promise
is operationalized into a living, governed, queryable intelligence asset for each
client.

This document is the binding architectural reference for the portal implementation
that lives under `app/(app)/portal/`. It is intentionally tight enough to be built
against, and loose enough to evolve as we wire real data, agents, and governance
in.

> **Companion document**: `docs/client-portal-roadmap.md` is the forward-looking
> roadmap — 15 phases from "real persistence" through "open agent market".
> This doc says **what the portal is**; the roadmap says **what comes next**.

---

## 1. Product Intent

> Engagements should not evaporate into static files; they should compound into a
> living, queryable, governed intelligence asset.

The portal must answer seven questions for the client, at any moment, without
asking a consultant:

1. **What are we trying to accomplish?** — Engagements, success criteria.
2. **What has Dauntless delivered so far?** — Living deliverables / artifacts.
3. **What decisions need our attention?** — Decision Surface / Decision Register.
4. **What evidence supports those recommendations?** — Evidence Vault.
5. **What changed since the last review?** — Signals, activity feed, versions.
6. **What should we do next?** — Next-best-actions, activation plan.
7. **What capability have we retained after the engagement?** — Knowledge Architecture, outcomes.

If a portal surface does not contribute to one of those seven questions, it does
not belong in v1.

---

## 2. Domain Model (target entities)

The portal models a client engagement as a connected graph, not a folder of files.
Every entity is a first-class object with status, owner, version, and an evidence
trail.

```
Organization ── Workspace ── Engagement ── Artifact ── ArtifactVersion
                  │             │            │
                  │             │            ├─ Decision ── Recommendation
                  │             │            │     │
                  │             │            │     └─ Evidence ─┐
                  │             │            ├─ Task/Milestone   │
                  │             │            ├─ Signal           │
                  │             │            └─ Metric ──────────┤
                  │             ├─ Agent ── Conversation         │
                  │             └─ KnowledgeItem (Desk/Shelf/Cabinet)
                  └─ Membership (User × role × visibility)
```

### 2.1 Core entities

| Entity                | Purpose                                                                                | Key fields                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `Organization`        | Tenant boundary. Government dept, enterprise, or partner.                              | id, name, sector, region, logo, trust tier                                                                  |
| `Workspace`           | One per organization (initially). Visibility/governance boundary.                      | id, orgId, name, visibility (`private` / `partner` / `public`), trust badge                                |
| `Membership`          | User × workspace × role × scope.                                                        | userId, role (`owner` / `executive` / `lead` / `viewer` / `auditor`), scopes                                |
| `Engagement`          | A sprint/program with success criteria.                                                 | id, workspaceId, kind (`discovery` / `design` / `build` / `activate` / `advisory`), phase, status           |
| `Artifact`            | A living deliverable. Versions are immutable; the artifact is the canonical handle.    | id, engagementId, type, owner, reviewState, currentVersionId, linkedDecisionIds, linkedEvidenceIds          |
| `ArtifactVersion`     | Immutable point-in-time snapshot. Knowledge graph anchors to these.                    | id, artifactId, version (semver), summary, changedBy, changedAt                                             |
| `Decision`            | A point requiring human judgment. Drives the Decision Surface.                          | id, engagementId, status, riskTier (`low`/`medium`/`high`), dueAt, recommendation, rationale, evidenceIds   |
| `Recommendation`      | The proposal Dauntless is asking the client to approve / defer / reject.               | summary, options, defaultChoice, confidence (0–1)                                                            |
| `Task` / `Milestone`  | Execution tracking against the engagement plan.                                         | id, engagementId, kind, phase, owner, progress, blocked, dueAt                                              |
| `Signal`              | Notable change worth surfacing. Drives "What changed?" feed.                            | id, kind (`update`/`risk`/`opportunity`/`agent-action`), severity, source, ref, capturedAt                  |
| `Agent`               | A contextual AI agent serving the engagement. Maps to the four archetypes.              | id, name, archetype (`strategist`/`operator`/`auditor`/`chief-of-staff`), state, scope, tools, model        |
| `Conversation`        | A thread between client and an agent (or between agents).                              | id, agentId, messages, lastTurnAt                                                                            |
| `KnowledgeItem`       | A piece of knowledge with provenance and freshness.                                     | id, shelf (`desk`/`bookshelf`/`cabinet`), memoryTier (M0–M4), confidence, freshness, source, canonical      |
| `Metric`              | A measured outcome.                                                                     | id, key, value, unit, period, trend, source                                                                  |
| `Evidence`            | Anything that justifies a decision/recommendation.                                      | id, kind (`artifact`/`metric`/`signal`/`source`/`workflow-log`), ref, snippet, capturedAt                   |

### 2.2 Trust & governance metadata (cross-cutting)

Every artifact, decision, and agent action carries:

- **Risk tier** — `low` / `medium` / `high`
- **Decision gate** — Did this require human approval? Who approved, when?
- **Confidence** — 0–1 from the producing agent
- **Provenance** — Which agent / workflow / human produced this, against which version

These are surfaced via the `EvidenceLink` and `RiskTier` patterns in the UI, never
buried in a JSON blob.

---

## 3. Information Architecture

The portal is **eight surfaces** that compose into one experience. They share the
existing app shell (`AppShell`, `SideRail`, `TopBar`, `WorkspaceHeader`,
`DashboardCard`). Routes live under `app/(app)/portal/`.

| Route                          | Surface                | Primary job                                                          |
|--------------------------------|------------------------|----------------------------------------------------------------------|
| `/portal`                      | **Command Center**     | The Decision Surface. The "open the laptop in the morning" page.    |
| `/portal/engagements`          | **Engagements**        | What we're trying to accomplish — phases, scope, success criteria.   |
| `/portal/deliverables`         | **Deliverables**       | The artifact library — living, versioned, reviewable.                |
| `/portal/decisions`            | **Decisions**          | The decision register — pending approvals, history, audit trail.    |
| `/portal/agents`               | **Agents**             | The agent fleet — what's running, scope, recent actions.            |
| `/portal/knowledge`            | **Knowledge**          | Desk / Bookshelf / Filing Cabinet — the compounding asset.          |
| `/portal/outcomes`             | **Outcomes**           | KPI tiles, before/after evidence, executive narrative.              |
| `/portal/governance`           | **Governance**         | Audit log, risk tiers, access review, retention controls.          |
| `/portal/settings` *(future)*  | Settings / Members     | Workspace controls. Reserved; not built in v1.                       |

### 3.1 The Decision Surface (canonical layout)

The marketing copy defines this explicitly (agentic-systems page → Layer 04). The
portal Command Center is the three-section dashboard:

1. **What needs my judgment?** — Pending decisions with risk tier, due date, recommendation.
2. **What changed?** — Signals / activity feed since last visit.
3. **What's running safely?** — Engagement & agent health, milestones on track.

We extend this for v1 with two additional Dauntless-specific sections:

4. **What evidence supports this?** — Evidence vault preview tied to the top decision.
5. **What should happen next?** — Next-best-actions, drawn from the activation plan.

---

## 4. Component Architecture

The portal does **not** introduce a new design language. It reuses:

- `components/shell/*` — `AppShell`, `SideRail`, `TopBar`, `WorkspaceHeader`
- `components/cards/dashboard-card.tsx` — Every workspace card.
- `components/cards/agent-card.tsx` — `ChatCard`, `TaskCard`, `AgentStatusStrip`
- `components/patterns/*` — `KpiTile`, `FeedPanel`, `SummaryCard`, `DataTable`
- `components/viz/*` — line / bar / area / donut / radar
- `components/ui/*` — buttons, badges, tabs, tooltips, content-tags, etc.

### 4.1 New portal-specific patterns

These earn their place only if they reduce real duplication across 2+ portal pages:

| Pattern                                       | Lives in                                  | Why                                                                     |
|-----------------------------------------------|-------------------------------------------|-------------------------------------------------------------------------|
| `PortalStatusCard`                            | `components/patterns/portal-status-card.tsx` | Engagement / agent / artifact health at a glance with phase + progress. |
| `DecisionList`                                | `components/patterns/decision-list.tsx`   | Renders pending/approved/deferred decisions with risk + recommendation.|
| `ArtifactList`                                | `components/patterns/artifact-list.tsx`   | Compact list for living deliverables; status + version + linked refs.   |
| `AgentFleetPanel`                             | `components/patterns/agent-fleet-panel.tsx` | Strategists / Operators / Auditors / Chief of Staff grouping.          |
| `EvidenceLink`                                | `components/patterns/evidence-link.tsx`   | Inline chip linking decisions ↔ artifacts/metrics/signals.              |
| `KnowledgeShelf`                              | `components/patterns/knowledge-shelf.tsx` | Renders one of: Desk / Bookshelf / Filing Cabinet with memory tier.    |

If any of those collapse to "used once", inline it instead. We will inline rather
than abstract prematurely.

### 4.2 Agent-bearing cards

Anywhere a card is sourced from / owned by an agent, it MUST set:

```tsx
<DashboardCard
  agentId="agent-engagement-analyst"
  agentState="thinking"
  ...
/>
```

The Command Center "What changed?" feed, the AI summary card, and the embedded
agent chat panel are all agent-bearing.

---

## 5. Data Layer

### 5.1 v1 — Mock data, real types (Phase 1)

- Types live in `lib/portal/types.ts` (portal-scoped, distinct from the global `lib/types.ts` which holds chassis-wide types like `AgentState`).
- Mock data lives in `lib/portal/mock-data.ts`. Deterministic — **no `Math.random()` in module scope, no random IDs in render**. Every value is hand-curated or generated from a stable seed.
- The mock data models one realistic government client across three concurrent engagements (Discovery, Training, Agentic Systems).

### 5.2 v2 — Repository abstraction (Phase 2 — shipped)

The portal now reads through a `PortalRepository` interface (see
`lib/portal/repositories/types.ts`). Every server-component page calls
`loadPortalContext()` (from `lib/portal/server.ts`), which returns a typed
`{ snapshot, membership }` tuple. Client components consume props; **no
client-side imports of `mock-data` remain in `app/(app)/portal/*`.**

Two implementations exist:

- `InMemoryPortalRepository` — the default. Wraps `lib/portal/mock-data.ts`
  and keeps mutations in-process for the lifetime of the server.
- `SupabasePortalRepository` — placeholder interface, activated when
  `SUPABASE_URL` / `PORTAL_DATABASE_URL` is set. Migrations and the concrete
  adapter land in Phase 2.1.

Mutations route through `lib/portal/actions.ts` (server actions). Each action:

1. Resolves the current membership via `lib/auth/session.ts`.
2. Checks the membership-gate (`lib/auth/membership-gate.ts`).
3. Delegates to the repository, which appends an `AuditEntry` and emits a
   `Signal` so the Command Center "What changed?" feed updates.
4. Calls `revalidatePath("/portal", "layout")`.

The two write paths wired in Phase 2 are:

- `approveDecision` / `deferDecision` / `rejectDecision` — exposed on the
  Decisions page detail panel.
- `promoteKnowledge` — exposed on the Knowledge page "Canonical promotion"
  panel.

### 5.3 v3 — Database migrations + RLS (Phase 2.1)

When the Supabase adapter lands:

- Per-entity repositories returning typed `Promise<T>`.
- Row-level security keyed off `workspaceId` and `Membership.role`.
- Versions are append-only; soft-deletes only.
- Migrations mirror `lib/portal/types.ts`; seed fixtures come from
  `mock-data.ts` so demo and production share a shape.

This will be the first time the portal ships a database migration.

### 5.3 v3 — Agent integration

Each agent record exposes a tool surface and a model identifier. When the
Anthropic API integration lands, the agent fleet panel becomes the live control
room — same UI, real backing. The `agentState` lifecycle is already wired in the
chassis (`idle` / `active` / `thinking` / `blocked` / `complete` / `updated`).

---

## 6. Trust Architecture (how the four marketing pillars show up in code)

| Pillar (marketing)     | How the portal encodes it                                                                |
|------------------------|------------------------------------------------------------------------------------------|
| Full Transparency      | Activity feed + version history on every artifact. No work happens off-portal.           |
| Reversibility          | Decisions support `defer` and `reject`. Approved decisions are versioned, not destroyed. |
| Artifact Proof         | Every artifact has owner, version, last-review, and the linked decisions that cite it.   |
| Accountability         | Outcomes page shows the success criteria from each engagement against current state.    |

These map 1-for-1 to the `/method` and `/platform` marketing pages — clients see
the same architecture in the portal that we sold them in the pitch.

---

## 7. Knowledge Architecture (the Three Shelves model, in code)

The portal renders knowledge using the three-shelves mental model from the
marketing site:

- **Desk** — `M0`–`M1`. Operational surface. Active conversations, in-flight artifacts, today's signals.
- **Bookshelf** — `M2`–`M3`. Proven, promoted knowledge. Canonical artifacts, repeat patterns, executive briefings.
- **Filing Cabinet** — `M4`. Archived evidence and superseded versions. Retrievable, not noisy.

Each `KnowledgeItem` carries `shelf`, `memoryTier`, `confidence`, `freshness`,
`canonical`. Confidence decay isn't simulated dynamically in v1 — we hardcode
freshness states. The shape is ready for a background job to update them.

---

## 8. Identity & Visibility

Phase 2 ships the gate, not the OAuth round-trip.

- `lib/auth/runtime.ts` resolves the auth mode (`dev-bypass` /
  `oauth-configured` / `auth-unavailable`) from environment variables.
  Phase 2 default is `dev-bypass`.
- `lib/auth/session.ts#getCurrentMembership(workspaceId)` returns a typed
  `MembershipContext` tagged union (`member` / `dev-bypass` / `unmapped` /
  `unauthenticated` / `auth-unavailable`). Every server component calls this.
- `lib/auth/membership-gate.ts` exposes pure `canRead(role, surface)` and
  `canPerform(role, action)` predicates used by both UI and server actions.
- The TopBar role switcher (`components/shell/role-switcher.tsx`) is visible
  in `dev-bypass` mode. It writes the `portal-role` cookie via a server
  action and revalidates the portal layout.

Role gates currently in effect:

- `owner` (Dauntless staff) → full read + write everywhere.
- `executive` → read everywhere; can `approve-decision` / `defer-decision`
  / `reject-decision`; can `export-audit-log`.
- `lead` → read everywhere except governance; can `edit-artifact` /
  `promote-knowledge`.
- `viewer` → read everywhere except governance; no write surface.
- `auditor` → read everywhere including governance; can `export-audit-log`;
  no write surface on artifacts.

OAuth (Google via NextAuth v5, ported pattern from CAIA) lands in Phase 2.1.

Trust badge on the workspace header is a token-only visual (`private` /
`partner` / `public`). It remains a static prop on the seeded workspace.

---

## 9. Non-negotiables for portal code

Inherited verbatim from `AGENTS.md`:

- **No hardcoded hex colors.** Tokens only.
- **Deep ultraviolet stays the identity anchor.** Service-colored gradients
  (consulting blue, training green, agentic pink) are allowed for engagement
  cards because the marketing site already maps engagements to those colors.
- **Every workspace card uses `DashboardCard`.** No custom card containers.
- **Use the existing shell.** Do not recreate `AppShell`, `SideRail`, `TopBar`,
  or `WorkspaceHeader`.
- **Compact controls.** `h-7` / `h-8` for inputs and buttons.
- **Dark-first.** Light mode tokens already exist; do not branch on theme in
  components.
- **Charts use `--chart-1`–`--chart-6` tokens.** Never hardcode chart colors.
- **No `Math.random()` in render or in module scope** for portal mock data — it
  causes hydration drift and breaks deterministic visual review.
- **No `try/catch` around imports.** No broad `eslint-disable`.
- **Agent-bearing cards must set `agentState` and `agentId`.**

---

## 10. Implementation Slice — what ships in this PR

### Built

- `docs/client-portal-target-architecture.md` *(this document)*
- `lib/portal/types.ts` — every entity in §2.
- `lib/portal/mock-data.ts` — one Org, one Workspace, 3 engagements, 10
  artifacts, 9 decisions, 5 agents, 14 tasks, 12 signals, 12 knowledge items,
  8 metrics, 8 evidence records. All deterministic.
- `app/(app)/portal/page.tsx` — **Command Center**: Decision Surface (5
  sections), engagement health, living deliverables, decision queue, agent panel,
  outcomes preview, knowledge preview.
- `app/(app)/portal/engagements/page.tsx`
- `app/(app)/portal/deliverables/page.tsx`
- `app/(app)/portal/decisions/page.tsx`
- `app/(app)/portal/agents/page.tsx`
- `app/(app)/portal/knowledge/page.tsx`
- `app/(app)/portal/outcomes/page.tsx`
- `app/(app)/portal/governance/page.tsx`
- `components/patterns/portal-status-card.tsx`
- `components/patterns/decision-list.tsx`
- `components/patterns/artifact-list.tsx`
- `components/patterns/agent-fleet-panel.tsx`
- `components/patterns/evidence-link.tsx`
- `components/patterns/knowledge-shelf.tsx`
- `SideRail` + mobile nav extended with a Portal entry.
- Stray `dauntless-changes.patch` (an HTTP 404 dump committed by accident) removed.

### Explicitly not in this PR

- Real auth wiring (Supabase OAuth round-trip).
- Persisted state — the portal is in-memory mock data.
- Database migration / Supabase schema.
- Agent runtime — chat is mock conversation, not an LLM call.
- Cross-engagement intelligence search.
- Settings / Members surface.
- Cross-workspace org switcher.

### Next backlog (in priority order)

The short list below is the immediate next-up; the full long-arc plan lives in
`docs/client-portal-roadmap.md` (15 phases, mapped onto the four marketing tiers).

1. Wire `Membership.role` into the portal pages and add a real role switcher in the TopBar.
2. Move mock data into per-entity `lib/portal/repositories/*.ts` and behind a feature flag for real data.
3. Land the Supabase schema and seed it from the same `mock-data.ts` factories.
4. Stand up one real agent (Engagement Analyst) backed by the Claude API with prompt caching.
5. Add `/portal/decisions/[id]` and `/portal/deliverables/[slug]` detail routes.
6. Wire artifact diff view + version timeline.
7. Add full-text search across the workspace (Knowledge tab).
8. Outcomes evidence stream — connect metrics to source workflows.

---

## 11. Naming conventions (portal-specific)

- Routes: `/portal/<surface>` — singular for the surface, the page handles pluralization in copy.
- File names: kebab-case `.tsx`, types in PascalCase.
- Pattern components: `<Domain><Pattern>` — `DecisionList`, `ArtifactList`, `AgentFleetPanel`.
- Mock data exports: `mock<Plural>` for collections (`mockEngagements`, `mockArtifacts`), `mock<Singular>` for a single canonical record (`mockOrganization`, `mockWorkspace`).
- Status enums: lowercase string literal unions; never strings-with-spaces. Display labels live in component lookup tables.

---

## 12. Tone

The portal is a **premium AI strategy and operations cockpit**, not a SaaS admin
console. Use this vocabulary in copy:

> Client Intelligence Portal · Living Deliverables · Decision Surface ·
> Engagement Continuity · Artifact Proof · Evidence Vault · Decision Register ·
> Contextual Agents · Knowledge Architecture · Activation Plan · Outcome
> Evidence · Governance Layer · Trust Architecture · Compounding Intelligence

Avoid: "submit", "ticket", "form", "record", "row", "entry" as user-facing copy.
The portal is not a CRM.
