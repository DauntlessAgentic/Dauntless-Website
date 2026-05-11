# CAIA → Client Intelligence Portal — Mapping Inventory

**Purpose.** This document is the durable handoff artifact from the first
"both repos open at once" session. It maps each CAIA subsystem to where it
lands in the Dauntless Client Intelligence Portal roadmap, calls out the
type-shape mismatches we will have to bridge, and flags what NOT to port.

CAIA's role is **reference, not gospel**. The portal's domain model in
`lib/portal/types.ts` wins on every conflict. CAIA's CSS / visual primitives
are not imported — everything is re-skinned through the portal's token + card
system.

> If you are picking up Phase 4+ later: this file is your starting point.
> Read it, then read the specific CAIA module before you write a line of
> portal code against it.

---

## Top-line shape difference

CAIA is a **decentralized agentic organization** product. Its primary noun
is `Member`, its primary collective is an `Alliance`, and its workflow primitives
are `Signal → Initiative → Artifact → KnowledgeProduct`. Auth is per-individual
(Google OAuth via NextAuth v5).

The portal is a **client engagement cockpit**. Its primary noun is `Workspace`
(one per organization), gated by `Membership.role`. Workflow primitives are
`Engagement → Artifact ↔ Decision ↔ Evidence`. The portal does not have
alliances, sectors, funding opportunities, or external-source ingest in its
domain model.

**Implication for ports**: when a CAIA module references `Member`, `Alliance`,
`Initiative`, `Sector`, or `FundingOpportunity` types, we replace them with
the portal's equivalents (`Membership`, `Workspace`, `Engagement`, etc.)
through an adapter layer under `lib/portal/<subsystem>/adapters.ts`.

---

## Subsystem-by-subsystem inventory

### 1. Mempalace — vector memory layer
**CAIA location**: `lib/mempalace/` (~1400 LOC across 7 files)
**What it is**: A three-layer memory store (`private_raw` / `shared_raw` /
`compiled_shared`) organized by `wing` + `room`, with chunking, embeddings,
and two adapters (`InMemoryMempalaceAdapter`, `PostgresMempalaceAdapter` using
pgvector). Search is cosine-similarity-ranked. The backend is selected via
`CAIA_MEMPALACE_BACKEND` env var.

**Portal landing**: **Phase 4 — KnowledgeItem evolution** (`lib/portal/knowledge/`)

**Why it fits**: The portal's `KnowledgeItem` already has `shelf` (desk /
bookshelf / cabinet), `memoryTier` (M0–M4), and `canonical`/`confidence`/
`freshness`. CAIA's mempalace gives us the **retrieval layer** beneath that
metadata — chunking, embeddings, similarity search, and a clean adapter
boundary so we can switch from in-memory to pgvector when Phase 2's persistence
lands.

**Mismatches to resolve**:
- CAIA's `MempalaceLayer` is three values; the portal's `KnowledgeShelf` is
  three values that mean *different things*. Map by adapter:
  - `desk` ↔ `private_raw` (per-member working memory)
  - `bookshelf` ↔ `compiled_shared` (canonical, promoted)
  - `cabinet` ↔ `shared_raw` (archived but searchable)
  Adapter lives in `lib/portal/knowledge/mempalace-adapter.ts`.
- CAIA uses `wing`/`room`; portal uses `engagementId` (optional)/`shelf`.
  Adapter maps `wing = workspaceId`, `room = engagementId ?? "workspace"`.
- CAIA embeddings call OpenAI by default. For Phase 4 we will gate on
  `EMBEDDING_PROVIDER` env var and default to **Anthropic** (or local) to
  keep the portal on a single provider when possible.

**Do NOT port**:
- The `collective-wiki-memory.ts` module — that's wiki-specific (CAIA's
  alliance-wide knowledge product). Not relevant to the portal yet.
- CAIA's chunking strategy specifics (paragraph + token limits) — we can
  reuse the interface but tune chunk sizes to artifact length in Phase 4.

---

### 2. Data repository pattern — persistence + activation gating
**CAIA location**: `lib/data/` — `sqlite-repository.ts` (huge, ~thousands of
lines), `repository-schema.ts` (migrations), `repository-runtime.ts`,
`repository-activation-status.ts`, `runtime-store.ts`, `types.ts`.

**What it is**: A `DataRepository` interface with two concrete implementations
(better-sqlite3 / libsql / postgres via `pg`). Schema is migration-driven
(`DATA_REPOSITORY_MIGRATIONS`). An activation-status tracker exposes
"is this repository configured & ready?" to the UI. Demo data seeds the
repo on first boot. AsyncLocalStorage threads the active repository handle
through server-component requests.

**Portal landing**: **Phase 2 — Persistence**.
`lib/portal/repositories/` becomes the canonical data interface. Mirror the
shape:

- `lib/portal/repositories/types.ts` — `PortalRepository` interface
- `lib/portal/repositories/index.ts` — `getPortalRepository()` with
  AsyncLocalStorage threading
- `lib/portal/repositories/in-memory.ts` — wraps `mock-data.ts` (default)
- `lib/portal/repositories/supabase.ts` — Supabase/Postgres adapter (
  activated by `SUPABASE_URL` env var)
- `lib/portal/repositories/migrations/` — SQL migrations mirroring `types.ts`
- `lib/portal/repositories/activation-status.ts` — surfaces config gaps in
  `/portal/governance`

**Mismatches to resolve**:
- CAIA's repo interface is enormous (~80+ methods covering alliance chat,
  member auth identities, knowledge products, etc.). The portal's surface is
  smaller — keep our interface to one method per entity (`list`, `get`,
  `create`, `update`, `softDelete`, `listVersions`) plus a single
  `getSnapshot()` for the dashboard read.
- CAIA uses `better-sqlite3` and `libsql` and `pg`. Phase 2 should pick **one**
  hosted target (Supabase / Postgres) and ship the in-memory adapter as the
  always-on default. We can add SQLite later if dev-loop testing demands it.
- CAIA's migrations are hand-written SQL strings. We will do the same — no
  ORM. Drizzle is tempting but adds a heavy build dependency.

**Do NOT port**:
- CAIA's mock-data seeding logic — we already have deterministic mock-data
  in `lib/portal/mock-data.ts`. Re-use that for seeding, don't replicate.
- CAIA's `delivery-awareness.ts` — that's their dashboard rollup math; the
  portal computes these inline in `app/(app)/portal/page.tsx` and that's fine
  until Phase 6 (telemetry bus).

---

### 3. Auth — identity + session
**CAIA location**: `auth.ts` (NextAuth v5 config), `lib/auth/` (8 files:
session, session-identity, runtime, signal-permissions, member-session,
current-member-* guards, identity-recovery).

**What it is**: NextAuth v5 with Google OAuth, JWT session strategy, careful
provider-subject → member-record resolution including conflict + recovery
flows. `getCurrentMemberContext()` returns a tagged union covering every
auth state including `dev-bypass` and `auth-unavailable`.

**Portal landing**: **Phase 2 — Identity**.
- `auth.ts` at the repo root, mirroring the CAIA shape.
- `lib/auth/runtime.ts` — `getAuthRuntimeState()` exposing `isConfigured`,
  `isDevBypassEnabled`, and a safe redirect resolver.
- `lib/auth/session.ts` — `getCurrentMembership(workspaceId)` returning a
  `MembershipContext` tagged union (member / unmapped / unauthenticated /
  bypass / auth-unavailable).
- `lib/auth/membership-gate.ts` — role-based UI gating (`canRead` /
  `canWrite` / `canApprove` / `canAudit`).
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handler.
- Login button on `app/login/page.tsx` (page already exists).

**Mismatches to resolve**:
- CAIA's `Member` has no `role` — every member is structurally equal until
  membership claims (sector contributions, alliance briefs) differentiate
  them. Portal's `Membership.role` is the gate. We do NOT need CAIA's
  conflict-recovery flow in v1 — single-workspace, single-role-per-user keeps
  it tractable. We can borrow the *shape* (tagged-union context) without
  the *complexity* (auto-link conflict resolution).
- Portal's existing `lib/auth/supabase.ts` is a stub that pretends to be
  Supabase OAuth. **Replace it** with NextAuth v5. Supabase is for data, not
  auth. (Reversible decision documented in Phase 2 commit.)

**Do NOT port**:
- `identity-recovery-mutation-authority.ts` — multi-provider account
  reconciliation; YAGNI for v1.
- `signal-permissions.ts` — CAIA's permission model is per-signal and
  per-sector; the portal's gate is at the workspace level.

---

### 4. Providers — hosted model runtime
**CAIA location**: `lib/providers/` — `catalog.ts` (Anthropic/OpenAI model list),
`runtime-core.ts` (HTTP transport + error normalization for both providers),
`artifact-body-draft.ts`, `artifact-body-revision-suggestion.ts`,
`signal-draft.ts`, `self-test.ts`, `personal-workspace-agent.ts`.

**What it is**: A thin, well-shaped provider abstraction. Each task (draft an
artifact body, draft a signal, run a self-test) is its own module that calls
`runAnthropicMessagesRequest` / `runOpenAiResponsesRequest` from
`runtime-core.ts`. Error signals are normalized (`auth-failed`,
`model-unavailable`, `rate-limited`, etc.). Provider secrets come from an
encrypted vault.

**Portal landing**: **Phase 3 — One real agent end-to-end**.
- `lib/portal/agents/runtime/` — the per-call abstraction (we'll only support
  Anthropic + prompt caching from day one; OpenAI can come later)
- `lib/portal/agents/engagement-analyst.ts` — the one agent we ship in Phase 3
- `lib/portal/agents/tools.ts` — tool surface (`search_artifacts`,
  `read_decision`, `propose_decision`, `summarize_signals`, `cite_evidence`)
- Telemetry: token counts, cache hit rate, cost per decision surfaced via
  `app/(app)/portal/governance/page.tsx`

**Mismatches to resolve**:
- CAIA's provider abstraction supports both Anthropic and OpenAI as peers.
  The portal is Anthropic-first. Keep the runtime layered the same way (so
  OpenAI can be added later without refactor) but stub OpenAI in v1.
- CAIA does NOT use prompt caching (or doesn't expose it as a first-class
  metric). The portal will — see `claude-api` skill guidance about caching
  the system prompt + the workspace canonical bookshelf.
- CAIA uses a provider-vault (encrypted member secret) so each member brings
  their own key. Portal is single-tenant per workspace — workspace admin
  sets one Anthropic key in `.env.local` for v1; per-workspace key vault
  comes in Phase 10 (compliance pack).

**Do NOT port**:
- `personal-workspace-agent.ts` — that's CAIA's per-member chat (BlockNote-
  bound). Portal has its own conversation model.
- `self-test.ts` — useful, but we will build an evaluation harness (Phase 3
  acceptance criterion) tuned to decision-proposal traces, not generic
  provider connectivity.

---

### 5. Personal workspace — thread memory + agent settings
**CAIA location**: `lib/personal-workspace/` — `blocknote-markdown.ts`
(BlockNote editor ↔ markdown round-trip), `personal-agent-settings.ts`
(per-member agent config — reasoning mode, enabled tools), `thread-memory.ts`
(mempalace-backed thread → memory promotion).

**What it is**: The bridge between per-member chats and the mempalace.
Threads are filed into the `private_raw` layer; promotion turns them into
shared knowledge.

**Portal landing**: **Phase 4 — KnowledgeItem evolution + Conversation
persistence**.
- `lib/portal/conversations/` — the conversation store; promotion-to-knowledge
  workflow mirrors CAIA's `thread-memory.ts` shape.
- BlockNote markdown conversion is **dependency-heavy** (Mantine, multiple
  Radix imports). For Phase 4, the artifact editor will be Markdown +
  structured fields — defer BlockNote integration to a later phase or skip
  it entirely. Use a lighter editor (CodeMirror 6 or just `<textarea>` +
  preview).

**Mismatches to resolve**:
- CAIA's `personal-agent-settings.ts` is per-Member. Portal equivalent is
  per-Membership + per-workspace policy.

**Do NOT port**:
- BlockNote itself (`@blocknote/core`, `@blocknote/mantine`, `@blocknote/react`)
  — too heavy for the portal's "premium cockpit, not Notion clone" stance.

---

### 6. Workspace — layout / card registry
**CAIA location**: `lib/workspace/` — `card-registry.ts`, `storage-keys.ts`,
`use-workspace.ts`.

**What it is**: Same hook the Dauntless chassis already has
(`useWorkspaceLayout`). The portal's `lib/workspace/` is already aligned.

**Portal landing**: **Already merged conceptually.** No port needed.

---

### 7. Other CAIA modules (not landing in v1)

| CAIA module | What it is | Why we skip |
|-------------|------------|-------------|
| `lib/member-augmentation.ts`, `member-augmentation-runtime.ts` | Auto-generates alliance briefs and signal classification suggestions for members | Portal has no "member augmentation" concept; the equivalent is the Engagement Analyst agent we'll build in Phase 3 directly |
| `lib/security/provider-vault.ts` | Per-member encrypted secret store | Defer to Phase 10 — Phase 2/3 use a single workspace-level `ANTHROPIC_API_KEY` env var |
| `lib/publications/` | Marp slide export | Off-roadmap |
| `lib/design-intelligence/` | CAIA's marketing-site design system intelligence | Off-roadmap; portal has its own token system |
| `lib/private-memory.ts` (711 LOC) | Personal-only memory store (separate from mempalace) | Redundant once mempalace is the single retrieval layer |
| `lib/content/app-guidance.ts` | In-app guidance content | Portal's tone is different (premium cockpit, not member-onboarding) |
| `app/api/admin/`, `scripts/admin/` | Bootstrap-first-admin scripts | Portal's bootstrap will be a one-shot seed from `mock-data.ts` |
| `lib/alliance-chat-links.ts` | Per-alliance chat | No alliances in the portal domain |

---

## Decisions made autonomously (Phase 2 doorstep)

These are reversible product calls made when the operator was offline. Each
is documented here so a reviewer can dispute and revert.

1. **Auth = NextAuth v5 + Google OAuth (port CAIA pattern), not Supabase Auth.**
   - Supabase remains the **data** target only (Postgres + RLS), not the auth
     provider. NextAuth v5 has a cleaner JWT story and CAIA already proved
     out the Google-only flow.
   - Rollback: re-instate Supabase Auth by swapping `auth.ts` and adding
     `@supabase/ssr` callers. Most of the membership gating lives in
     `lib/auth/membership-gate.ts`, which is provider-agnostic.

2. **Persistence = repository abstraction with in-memory adapter first,
   Supabase/Postgres adapter shipped but gated on env vars.**
   - The portal can run with `npm run dev` and nothing else. When
     `SUPABASE_URL` (or `PORTAL_DATABASE_URL`) is set, the Postgres adapter
     takes over.
   - The acceptance criterion "pulling the plug on mock-data imports leaves
     the UI fully functional" is met because the in-memory adapter wraps the
     same mock-data fixtures.
   - This is faithful to the roadmap's Phase 2 promise without forcing the
     overnight run to commit to a hosted database the operator may not have
     provisioned.

3. **Anthropic-only in Phase 3.** OpenAI support will be a Phase 5 (full
   fleet) concern. CAIA's runtime is dual-provider; we keep the layering but
   stub OpenAI.

4. **No BlockNote editor.** The artifact editor in Phase 4 ships as
   Markdown + structured fields (per `ArtifactType`). BlockNote integration
   is deferred indefinitely — the portal's tone is "premium cockpit, not
   Notion clone" (per architecture doc §10.2).

---

## What the next session should read first

1. This file.
2. The relevant CAIA module for the phase being picked up:
   - Phase 2: `auth.ts`, `lib/auth/*`, `lib/data/repository-schema.ts`,
     `lib/data/sqlite-repository.ts` (skim for migration patterns).
   - Phase 3: `lib/providers/runtime-core.ts`, `lib/providers/catalog.ts`,
     `lib/providers/artifact-body-draft.ts` (canonical "call Anthropic,
     normalize the response" reference).
   - Phase 4: `lib/mempalace/*` (port the adapter pattern), `lib/data/types.ts`
     (read the `KnowledgeProduct` shape for inspiration only — do not adopt
     it).

3. The portal phase target in `docs/client-portal-roadmap.md` — every phase
   has an explicit "Deliverables / Acceptance criteria / Risks" block.

---

*Compiled 2026-05-11 in an overnight session running both repos at once. If
CAIA evolves after this date, treat this inventory as a snapshot — re-walk
the subsystem before porting.*
