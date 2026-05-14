# NEXT_STEPS.md

The overnight run merged **all 18 PRs into `main`** (PR #1 → #18). Local
`main` is at `a8fa9e8` and reflects the complete 15-phase Client
Intelligence Portal plus the closeout extras.

This doc is your hand-off. Read it top-to-bottom — every item is either
something you need to **do now** (operational chores) or something **to
queue** (next phase work). Estimated time tags are honest: **5m** =
minutes, **30m** = half an hour, **1d** = a working day, **wk** = ≥1
week.

---

## 1 · Operational chores (do these first)

These are things I couldn't do from the sandbox. None take long.

### 1.1 Delete the merged feature branches on the remote · **5m**

The sandbox git proxy refused remote-delete pushes, so the 18 feature
branches still exist on GitHub even though every one is merged.

Easiest path: enable the GitHub repo setting **"Automatically delete
head branches"** under *Settings → General → Pull Requests*. GitHub will
delete the already-merged heads + auto-clean future ones.

Manual fallback:

```sh
git fetch origin --prune
for b in \
  claude/client-portal-mvp-3CFwb \
  claude/portal-ci-closeout \
  claude/portal-phase-2-persistence-identity \
  claude/portal-phase-3-engagement-analyst \
  claude/portal-phase-4-mem-palace \
  claude/portal-phase-4-1-canonical-editor \
  claude/portal-phase-5-agent-fleet \
  claude/portal-phase-5-1-nba-schedule \
  claude/portal-phase-6-telemetry-impact \
  claude/portal-phase-7-innovation-studio \
  claude/portal-phase-8-multi-workspace \
  claude/portal-phase-9-api-sdk \
  claude/portal-phase-10-compliance \
  claude/portal-phase-11-outbound-actions \
  claude/portal-phase-12-federation \
  claude/portal-phase-13-fine-tunes \
  claude/portal-phase-14-portfolio \
  claude/portal-phase-15-marketplace \
  claude/setup-dev-environment-SxkBX
do
  git push origin --delete "$b" || true
done
```

### 1.2 Confirm CI is green on `main` · **5m**

`.github/workflows/portal-ci.yml` ran on every PR push before merge.
After the merge, GitHub will trigger one more run on the `main` HEAD.

Open the Actions tab and confirm the `portal-ci` workflow on `main`
goes green. If it doesn't:

- The build / test / lint commands work locally — I verified `131/131
  tests`, lint at 0 errors, build green on `a8fa9e8`. If CI fails it's
  almost certainly an environment quirk (Node version, network access
  for Google Fonts). The workflow already sets `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`.
- If lint or test fail on CI but not locally, run `npm ci` instead of
  `npm install` to match the workflow's lockfile-strict install.

### 1.3 Set the branch-protection rule on `main` · **5m**

Now that CI exists, gate merges on it. *Settings → Branches → Add rule*
for `main`:

- Require status check: `verify`
- Require pull-request review before merging (recommended)
- Disallow force pushes

### 1.4 Read the three handoff docs · **15m**

In this order:

1. `docs/session-closeout-overnight-2026-05-11.md` — what happened in
   the overnight run, what was decided autonomously, what's open.
2. `docs/client-portal-roadmap.md` — every phase with `.0 shipped` /
   `.x.y remaining` split. The pick-up list at the bottom of every
   phase is the queue.
3. `docs/caia-mapping.md` — what was ported from CAIA, what was
   skipped, what's still worth porting.

Or open `/portal/about` locally (`npm run dev` then visit
`http://localhost:3000/portal/about`) — that page is the live version
of the roadmap status, with PR links per phase.

---

## 2 · What you have now

### 2.1 Counts

- **28 portal routes** under `app/(app)/portal/`
- **7 versioned REST API routes** under `app/api/portal/v1/`
- **149+ smoke tests** under `tests/portal/*` (run with `npm test`)
- **16 phase modules** (Phase 1–15 plus closeout) all on `main`
- **CI workflow** active: `.github/workflows/portal-ci.yml`
- **CodeQL workflow** active: `.github/workflows/codeql.yml` (security-and-quality query suite)

### 2.1.1 Post-audit hardening (May 2026)

Following the May 2026 security audit (see `SECURITY_AUDIT.md`),
five phases shipped to close the highest-leverage findings:

| Phase | What landed | Closes audit § |
|---|---|---|
| **A** (PR #33) | Next 16.2.6 + postcss override; production refuses dev-bypass; constant-time bearer compare; cookies hardened | §1.A, §3.2.A, §3.2.E, §3.2.F |
| **B** (PR #34) | Token-bucket rate limiter (per-token + per-IP); CodeQL workflow | §3.2.D, §13 |
| **C** (PR #35) | zod schemas for every connector capability; propose-time payload validation | §7.A |
| **D** (PR #36) | HMAC-signed evidence exports with per-workspace key + watermark | §8.A, §10.A |
| **E** (PR #37) | Continuous Autonomous Innovation Engine (in-process watcher, 5 heuristics) | Phase 7.1 |

### 2.2 The 28 portal routes

| Group | Routes |
|-------|--------|
| Core | `/portal`, `/portal/engagements`, `/portal/engagements/[id]`, `/portal/deliverables`, `/portal/deliverables/[id]`, `/portal/deliverables/[id]/edit`, `/portal/decisions`, `/portal/decisions/[id]`, `/portal/agents`, `/portal/agents/[id]`, `/portal/knowledge`, `/portal/outcomes`, `/portal/governance` |
| Advanced | `/portal/search`, `/portal/schedule`, `/portal/innovation`, `/portal/outcomes/impact-report` |
| Enterprise / Network | `/portal/org`, `/portal/api`, `/portal/actions`, `/portal/compliance`, `/portal/federation`, `/portal/models`, `/portal/marketplace`, `/portal/portfolio` |
| Self-documenting | `/portal/about`, `/portal/changelog`, `/portal/help` |

### 2.3 The REST API

Under `/api/portal/v1`:

- `GET /engagements`, `GET /artifacts`, `GET /signals`, `GET /metrics`
- `GET /knowledge` (with `?q=…` for ranked search)
- `GET /schedule` + `POST /schedule`
- `GET /decisions` + `POST /decisions`

Auth: Bearer token in `Authorization`. Set `PORTAL_API_KEY` to enable
gating; unset means dev-bypass.

### 2.4 The typed SDK

In-repo at `lib/portal-sdk/index.ts`. Phase 9.1 publishes to npm as
`@dauntlessagentic/portal-sdk`. For now consumers import from the path:

```ts
import { createPortalClient } from "@/lib/portal-sdk";
const portal = createPortalClient({
  baseUrl: process.env.NEXT_PUBLIC_PORTAL_BASE_URL!,
  apiKey: process.env.PORTAL_API_KEY,
});
const { engagements } = await portal.engagements.list();
```

---

## 3 · How to run it

### 3.1 Local development · **5m**

```sh
git clone git@github.com:DauntlessAgentic/Dauntless-Website.git
cd Dauntless-Website
npm install
npm run dev
# open http://localhost:3000/portal
```

Without any `.env.local` configuration, the portal boots in
**dev-bypass mode**: in-memory repository, no API key, no OAuth, no
hosted database. Everything is exercisable. Use the TopBar role
switcher to walk the membership-gating.

### 3.2 Configure the live stack · **wk**

Copy `.env.local.example` to `.env.local` and start filling in. The
file is annotated with notes per phase.

Order I'd configure (matches `.env.local.example` sections):

1. `PORTAL_DEV_BYPASS=false` once OAuth is live.
2. `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` + `AUTH_SECRET` (Phase 2.1
   identity).
3. `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (Phase 2.1
   persistence; **lands the biggest unlock**).
4. `ANTHROPIC_API_KEY` + `ANTHROPIC_DEFAULT_MODEL` (Phase 3+ agents
   go live; until set, agents run in deterministic stub mode).
5. `PORTAL_API_KEY` (Phase 9 API gate; lock down the REST surface).

### 3.3 Verify

```sh
npm run lint     # 0 errors, 27 pre-existing warnings
npm test         # 131/131
NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build
# → 28 portal routes + 7 API routes registered
```

---

## 4 · The pick-up queue

Each phase shipped its `.0` slice and scoped a `.1` follow-up. The
`docs/client-portal-roadmap.md` doc has the full list; here is the
**prioritized** queue I would tackle in your shoes, with concrete
first-steps for each.

### Priority 1 · Phase 2.1 · Supabase persistence + real OAuth · **2–4 wks**

This is the **gate** for every other phase. Until it ships, every
mutation is per-process and OAuth is dev-bypass.

Concrete next-steps:

1. Provision a Supabase project. Note the URL + service-role key.
2. Write migrations mirroring `lib/portal/types.ts`. Naming convention:
   `db/migrations/0001_workspace_tables.sql` etc. Append-only audit log;
   soft-deletes only.
3. Build `lib/portal/repositories/supabase.ts` implementing
   `PortalRepository`. The interface contract is already locked.
4. Activate in `lib/portal/repositories/index.ts`'s factory:
   `if (process.env.SUPABASE_URL) return new SupabasePortalRepository();`
5. Smoke-test against a real Supabase project. The 6 tests in
   `tests/portal/repository.test.mjs` already exercise the contract.
6. Replace the `supabase` stub in `lib/auth/supabase.ts` with NextAuth
   v5 + Google OAuth wiring (pattern in `docs/caia-mapping.md` §3).
7. Drop `PORTAL_DEV_BYPASS`. Update the membership-gate to read
   real session claims.

### Priority 2 · Phase 6.1 · Persist the telemetry event bus · **1–2 wks**

Today the event bus is in-process. After a server restart, the
Quarterly Impact Report falls back to zeros.

Concrete next-steps:

1. Add a `portal_events` migration with the discriminated-union schema
   from `lib/portal/telemetry/event-bus.ts`.
2. Subscribe an emitter (`subscribePortalEvents`) that writes every
   event to the table. Keep the in-memory cache as a fast read.
3. Update `computeDerivedMetrics` to query the table instead of the
   in-memory bus.
4. Backfill historical events from the `audit_log` table on first
   migration.

### Priority 3 · Phase 4.2 · Pgvector knowledge adapter · **1–2 wks**

The current `InMemoryKnowledgeAdapter` uses TF-IDF — good for
deterministic dev but doesn't scale to ≥1000 artifacts.

1. Enable `pgvector` on Supabase.
2. Write `lib/portal/knowledge/pgvector-adapter.ts` against the
   existing `KnowledgeAdapter` interface.
3. Wire embedding generation. Default to Anthropic when the API key is
   set; fallback to a local embed model (e.g. `gte-base`) if not.
4. Update `getKnowledgeAdapter()` factory to choose by env var.
5. Reuse the existing 5 tests in `tests/portal/knowledge.test.mjs`.

### Priority 4 · Phase 9.1 · Published SDK + scoped API tokens · **1 wk**

1. Publish `lib/portal-sdk/` to npm as `@dauntlessagentic/portal-sdk`.
   Add a `package.json` exports map.
2. Replace the single `PORTAL_API_KEY` with per-`Membership` scoped
   tokens stored in the repository (new `api_tokens` table).
3. The `/portal/api` explorer should let owners issue + revoke tokens
   inline.
4. Add per-token rate limits + surface usage in `/portal/governance`.

### Priority 5 · Phase 10.1 · Data residency + control auto-evaluation · **1 wk**

Signed evidence exports already shipped (Phase D / PR #36). Remaining
for full Phase 10.1:

1. Wire a `DataResidency` per-workspace setting (CA / EU / US).
2. Phase 10's `/portal/compliance` already evaluates the controls —
   once residency lands, multiple `gap` rows will flip to `pass`
   automatically.
3. Optional: a signed-export verification CLI under `scripts/`.

### Lower priority (do in any order)

- **Phase 5.2** · Real-time signals via Supabase Realtime (live "What
  changed?" feed).
- **Phase 7.2** · Persist Autonomous Innovation Engine proposals into
  `innovation_proposals` (today the proposals are per-process; engine
  itself shipped in Phase E / PR #37).
- **Phase 11.1** · Real HTTP adapters per outbound connector (HubSpot,
  Salesforce, Jira, ServiceNow, Microsoft Graph, Google Workspace).
- **Phase 12.1** · Real cross-tenant federation repository +
  adversarial deanonymization tests.
- **Phase 13.1** · Real fine-tune jobs via the Anthropic API.
- **Phase 14.1** · Read portfolio rollup from per-workspace telemetry
  instead of the seeded fixtures.
- **Phase 15.1** · Public marketplace submission API + ACH payouts.

---

## 5 · How to extend the portal

### 5.1 Add a new phase

1. Append a record to `lib/portal/roadmap-status.ts`. `/portal/about`
   reflects it automatically.
2. Add the route(s) under `app/(app)/portal/<surface>/`. Server
   component calls `loadPortalContext()` and passes
   `{ snapshot, membership }` to a client view.
3. Add smoke tests under `tests/portal/<feature>.test.mjs`. The
   suite list in `package.json#scripts.test` needs the new file
   appended.
4. Update `docs/client-portal-roadmap.md` (mark `.0 shipped`, scope
   `.1`).
5. Verify locally: `npm run lint && npm test && NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build`.
6. Open a PR. CI will run automatically.

### 5.2 Add a new agent

1. Append an `AgentDefinition` to `lib/portal/agents/registry.ts`.
2. Choose an existing archetype (`strategist` / `operator` /
   `auditor` / `chief-of-staff`). The agent inherits that archetype's
   tool surface automatically.
3. If the agent needs a new tool, add it to
   `lib/portal/agents/tool-catalog.ts` under the appropriate
   archetype's surface. **Add a separation-of-powers test** in
   `tests/portal/agent-fleet.test.mjs` proving no other archetype can
   reach it.

### 5.3 Add a repository write path

1. Add the method signature to `lib/portal/repositories/types.ts`.
2. Implement it in `lib/portal/repositories/in-memory.ts`. **Emit an
   audit entry and a `PortalEvent` atomically.**
3. Add a server action under `lib/portal/<feature>-actions.ts` that
   wraps the repository call. Always check
   `canPerform(membership.role, action)` first.
4. The Phase 2.1 Supabase adapter will need a matching implementation.
5. Add a write-path test under `tests/portal/<feature>.test.mjs`.

### 5.4 Add a new REST API route

1. Create `app/api/portal/v1/<resource>/route.ts`.
2. Use `withApiAuth()` from `lib/portal/api/auth.ts` for read endpoints.
3. For writes: parse JSON, validate, call the repository, emit a
   webhook via `emitWebhook()`.
4. Add the route to the `ENDPOINTS` list in
   `app/(app)/portal/api/view.tsx` so it appears in the explorer.
5. Add a corresponding method to `lib/portal-sdk/index.ts`.

---

## 6 · Open architectural questions

These were decided autonomously during the overnight run. Each is
reversible; flag the one(s) you disagree with so the next pass can
revisit.

1. **Auth provider = NextAuth v5 (eventually) rather than Supabase
   Auth.** Supabase remains the data target only. Rationale in
   `docs/caia-mapping.md` §3.
2. **In-memory repository as the always-on default.** Configurable
   swap to Supabase via env var. Faithful to the roadmap's
   "non-breaking swap" promise.
3. **Anthropic-only agent runtime in Phase 3.** OpenAI is layered in
   but stubbed. Adding OpenAI is mostly an implementation pass; the
   layering is in `lib/portal/agents/runtime/`.
4. **TF-IDF retrieval in Phase 4.0.** Embedding-cosine drop-in lands
   in Phase 4.2.
5. **No BlockNote editor.** Artifact bodies are Markdown + structured
   fields. Per `caia-mapping.md` §5.
6. **`server-only` package omitted from new modules** because it
   throws under `node:test`. Bundler still rejects client imports
   because the modules pull in `next/headers` and `next/cache`.
7. **Federation withdrawals cascade.** Leaving a federation revokes
   every active contribution. Per `docs/client-portal-roadmap.md`
   Phase 12.0 acceptance.
8. **Marketplace eval re-uses the Phase 5 `isToolPermitted` predicate.**
   Separation-of-powers violations fail eval automatically, not via a
   separate check.
9. **Killswitch on a marketplace listing revokes installs globally.**
   No per-workspace override.

---

## 7 · Conventions to keep

These came from `AGENTS.md` and were preserved through every phase.
The next session needs to keep them:

- **Token-only colors.** No hex values in components. Ever.
- **Deep ultraviolet is the identity anchor** (`--accent` family).
- **Every workspace card uses `DashboardCard`.** No custom containers.
- **Agent-bearing cards set both `agentId` and `agentState`.**
- **Charts use `--chart-1`–`--chart-6` tokens.** Never hardcode.
- **No `Math.random()` in render paths.** Deterministic mock data
  only.
- **No `try/catch` around imports. No broad `eslint-disable`.**
- **Use the existing shell** (`AppShell`, `SideRail`, `TopBar`,
  `WorkspaceHeader`).
- **Vocabulary**: Client Intelligence Portal · Living Deliverables ·
  Decision Surface · Engagement Continuity · Artifact Proof · Evidence
  Vault · Decision Register · Contextual Agents · Knowledge
  Architecture · Activation Plan · Outcome Evidence · Governance Layer
  · Trust Architecture · Compounding Intelligence. Avoid SaaS-CRM
  verbs (`submit`, `ticket`, `form`, `record`, `entry`).

---

## 8 · If something breaks

### 8.1 Lint regression

`npm run lint` should always exit 0. New code that introduces a
warning should match the `^_` pattern for intentionally unused vars
(configured in `eslint.config.mjs`).

### 8.2 Test regression

`npm test` runs 131 tests across 14 suites. If one fails, the suite
name in the output points at the file under `tests/portal/`.

### 8.3 Build regression

The portal build is dynamic for every route (`force-dynamic`). If
build fails, the error is usually a type mismatch — TypeScript runs
during build. Local IDE TS hints are accurate.

### 8.4 The portal route count + roadmap status drift

`tests/portal/route-manifest.test.mjs` enforces that every advertised
route has a `page.tsx`. If you delete a route without updating the
manifest the test fails.

`lib/portal/roadmap-status.ts` is the single source of truth for
shipped phases. `/portal/about` and the README route map both flow
from it. If they diverge, update `roadmap-status.ts` first; the others
follow.

---

## 9 · Where to read code

If you're hunting for something specific:

| What | Where |
|------|-------|
| Domain types | `lib/portal/types.ts` |
| Mock data | `lib/portal/mock-data.ts` |
| Repository contract | `lib/portal/repositories/types.ts` |
| In-memory repository | `lib/portal/repositories/in-memory.ts` |
| Agent runtime (Anthropic) | `lib/portal/agents/runtime/anthropic.ts` |
| Agent registry | `lib/portal/agents/registry.ts` |
| Agent tool catalog (separation of powers) | `lib/portal/agents/tool-catalog.ts` |
| Generic agent runner | `lib/portal/agents/runner.ts` |
| Knowledge mem-palace | `lib/portal/knowledge/` |
| Telemetry event bus | `lib/portal/telemetry/event-bus.ts` |
| Telemetry-derived metrics | `lib/portal/telemetry/metrics.ts` |
| Impact Report generator | `lib/portal/telemetry/impact-report.ts` |
| Cross-engagement intelligence | `lib/portal/cross-engagement.ts` |
| Next-best-actions ranker | `lib/portal/next-best-actions.ts` |
| Innovation Studio (patterns + simulator + tree) | `lib/portal/innovation/` |
| Outbound action sandbox | `lib/portal/outbound-actions/` |
| Federation primitive | `lib/portal/federation/` |
| Compliance posture | `lib/portal/compliance.ts` |
| Per-workspace model registry | `lib/portal/models/` |
| Marketplace | `lib/portal/marketplace/` |
| Portfolio rollup | `lib/portal/portfolio/` |
| Org rollup | `lib/portal/org-rollup.ts` |
| Roadmap status (single source of truth) | `lib/portal/roadmap-status.ts` |
| Unified changelog | `lib/portal/changelog.ts` |
| SDK | `lib/portal-sdk/index.ts` |
| Markdown renderer (citation-aware) | `components/patterns/artifact-markdown.tsx` |
| Cmd+K palette | `components/shell/command-palette.tsx` |

---

## 10 · Contact tomorrow's self

The single file with the freshest snapshot of the overnight run:

```
docs/session-closeout-overnight-2026-05-11.md
```

Or in the running app: open `/portal/about` for the live phase map +
PR links, and `/portal/changelog` for the unified activity stream.
