# Session closeout · Overnight run · 2026-05-11

This document captures the full overnight autonomous run that took the
Client Intelligence Portal from Phase 1 (foundation, already shipped before
the session opened) to **Phase 15 (third-party marketplace, the final
roadmap phase)** — 16 sequential draft PRs, 117 smoke tests, 22 portal
routes plus 7 REST API routes.

The next agent should read this doc + `docs/client-portal-roadmap.md`
first; everything else flows from there.

---

## Shipped phases

Every phase below shipped as its own feature branch + draft PR, with
`npm run lint` at 0 errors, `npm run build` green, and `npm test` passing
the cumulative suite.

| PR | Phase | Branch | What landed |
|----|-------|--------|-------------|
| #2  | 2.0  | `claude/portal-phase-2-persistence-identity`  | Repository abstraction + identity gate + role switcher + audited mutations |
| #3  | 3.0  | `claude/portal-phase-3-engagement-analyst`    | Engagement Analyst agent end-to-end (Anthropic API + prompt caching + stub) |
| #4  | 4.0  | `claude/portal-phase-4-mem-palace`            | Mem-palace port + workspace search + artifact detail + confidence decay |
| #5  | 5.0  | `claude/portal-phase-5-agent-fleet`           | Full 4-archetype fleet + tool-catalog-enforced separation of powers |
| #6  | 4.1  | `claude/portal-phase-4-1-canonical-editor`    | Markdown artifact editor + canonical-promotion via Governance Auditor |
| #7  | 6.0  | `claude/portal-phase-6-telemetry-impact`      | Telemetry event bus + Quarterly Impact Report + cross-engagement intel |
| #8  | 7.0  | `claude/portal-phase-7-innovation-studio`     | Innovation Studio + pattern library + roadmap simulator + decision tree |
| #9  | 5.1  | `claude/portal-phase-5-1-nba-schedule`        | Live NBA ranking pipeline + Schedule surface |
| #10 | 8.0  | `claude/portal-phase-8-multi-workspace`       | Multi-workspace + org rollup + TopBar workspace switcher |
| #11 | 9.0  | `claude/portal-phase-9-api-sdk`               | REST API + typed SDK + webhook ledger + API explorer page |
| #12 | 10.0 | `claude/portal-phase-10-compliance`           | Compliance posture across 4 frameworks + sector packs |
| #13 | 11.0 | `claude/portal-phase-11-outbound-actions`     | Outbound action sandbox + connector registry (7 connectors) |
| #14 | 12.0 | `claude/portal-phase-12-federation`           | Federation primitive + cross-tenant search + 3-tier anonymization |
| #15 | 13.0 | `claude/portal-phase-13-fine-tunes`           | Per-workspace model registry + fine-tunes + drift auto-rollback |
| #16 | 14.0 | `claude/portal-phase-14-portfolio`            | Dauntless portfolio rollup + internal decision register |
| #17 | 15.0 | `claude/portal-phase-15-marketplace`          | Third-party agent marketplace + eval harness + killswitch |

The first slice (Phase 1) was already shipped before this session began
on `claude/client-portal-mvp-3CFwb` (PR #1).

---

## Cumulative footprint

- **22 portal routes** under `app/(app)/portal/`.
- **7 versioned REST API routes** under `app/api/portal/v1/`.
- **117 smoke tests** under `tests/portal/*` (run with `npm test`).
- **CI workflow** at `.github/workflows/portal-ci.yml` runs lint + tests + build on every push and pull request.
- **Per-phase docs** updated in `docs/client-portal-target-architecture.md` and `docs/client-portal-roadmap.md` inside the PR that ships the phase.

---

## What survived from CAIA, what didn't

Followed `docs/caia-mapping.md` throughout:

- **Mem-palace pattern** → `lib/portal/knowledge/*` (TF-IDF scorer in 4.0;
  embedding adapter scoped for 4.2).
- **Provider runtime** (`runtime-core.ts` shape, `ProviderRuntimeError`)
  → `lib/portal/agents/runtime/anthropic.ts`.
- **Repository activation status** → `lib/portal/repositories/activation-status.ts`.
- **Auth tagged-union session context** → `lib/auth/runtime.ts` +
  `lib/auth/session.ts` (pattern only — NextAuth wiring deferred to 2.1).

What was **explicitly skipped**:

- BlockNote editor — too heavy for "cockpit, not Notion clone".
- CAIA per-member provider vault — Phase 10 territory.
- CAIA wiki / publications — off-roadmap.

---

## Cross-cutting concerns

- **Token-only colors throughout.** Zero hex values in any new component.
- **DashboardCard** is the universal card primitive. No custom containers.
- **Every workspace mutation appends an audit entry + emits a typed Signal
  + emits a typed `PortalEvent` to the telemetry bus.**
- **Separation-of-powers is enforced at the tool-catalog level** (Phase 5),
  not at the prompt level. Tool calls outside an archetype's surface
  return an error before executing.
- **Every write surface is role-gated** through `lib/auth/membership-gate.ts`.
- **Dev-bypass mode is the default**; OAuth wiring lands in Phase 2.1.

---

## Autonomous architectural calls (for human review)

These were the reversible product decisions made when the operator was
offline. Each is documented in the relevant PR's "Run notes" section:

1. **Auth = NextAuth v5 pattern (not Supabase Auth).** Supabase remains
   the data target only.
2. **In-memory repository as the always-on default**; Supabase adapter
   gated on env vars. Faithful to the roadmap's "non-breaking swap" promise.
3. **Anthropic-only for Phase 3.** OpenAI is a Phase 5 concern; CAIA's
   dual-provider layering preserved but stubbed.
4. **Stub mode is intentional, not a placeholder.** Every agent has an
   archetype-specific stub that produces real state mutations so the UX
   is exercisable offline.
5. **No BlockNote.** Markdown + structured fields per the
   `caia-mapping.md` decision.
6. **TF-IDF retrieval in Phase 4.0**; pgvector swap is a drop-in
   replacement.
7. **`server-only` package is omitted from new modules** because it
   throws under `node --test`. Bundler still rejects client imports of
   modules that pull in `next/headers` or `next/cache`.
8. **Federation membership** is opt-in with cascade-on-leave. Withdrawal
   revokes all active contributions immediately.
9. **Marketplace eval re-uses the Phase 5 `isToolPermitted` predicate** so
   separation-of-powers violations fail eval automatically, not via a
   secondary check.
10. **Killswitch on a marketplace listing revokes installs globally** —
    no per-workspace override.

---

## What the next session should pick up

In priority order:

1. **Phase 2.1**: stand up the Supabase `PortalRepository` adapter +
   Google OAuth via NextAuth v5. Once those are wired, every other phase
   inherits real persistence. The repository contract is already locked
   (`lib/portal/repositories/types.ts`).
2. **Phase 6.1 persistence**: persist `PortalEvent` records into a
   `portal_events` table. Once historical events outlive a server restart,
   the Phase 7 simulator can backtest and the Phase 13 fine-tune
   evaluator can fit on real data.
3. **Phase 4.2 embedding-backed knowledge adapter**. Drop-in for the
   `InMemoryKnowledgeAdapter`. Unlocks better cross-engagement
   suggestions + Phase 6 metric reductions.
4. **Phase 5.2 real-time signals via Supabase Realtime.** The "What
   changed?" feed updates without a page reload.
5. **Phase 9.1 published SDK + per-Membership scoped API tokens**.
   Replaces the single `PORTAL_API_KEY`.
6. **Phase 10.1 signed evidence exports + data residency configuration**.
   Required for the procurement officer to complete a security
   questionnaire from portal state alone.
7. **Phase 11.1 real HTTP adapters per connector.** The shape is
   already in place; this is implementation work.

---

## Open architectural questions

- **Should the workspace switcher actually swap the live repository,
  or stay read-only routing to `/portal/org`?** Phase 8.0 punted on this
  to keep the change reversible. Phase 8.1 needs to decide.
- **Should the Innovation Studio's Autonomous Innovation Engine
  long-poll the signal feed, or run on a cron?** Phase 7.1 needs a
  decision before wiring the continuous-run path.
- **Per-Membership API tokens vs. workspace-level keys** — Phase 9.1
  decision. The Phase 9.0 surface assumes the former is coming.
- **Federation governance protocol** — who arbitrates when two
  workspaces contribute conflicting canonical anchors? Phase 12.1.

---

## How to verify the cumulative state

```sh
git checkout main
# Each phase shipped as its own PR; rebase or merge in roadmap order.
npm install
npm run lint                  # → 0 errors
npm test                      # → 117/117 portal smoke tests
NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build
                              # → 22 portal routes + 7 API routes registered
npm run dev                   # → walk the portal
```

The portal boots without any external infrastructure. Configure
`PORTAL_DATABASE_URL`, `ANTHROPIC_API_KEY`, `PORTAL_API_KEY`, and OAuth
keys to graduate from dev-bypass to a hosted posture (see
`.env.local.example`).
