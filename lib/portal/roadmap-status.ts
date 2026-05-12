// ============================================================
// Roadmap status — single source of truth (closeout)
//
// Every shipped phase declares itself here so the portal can
// surface its own progress at /portal/about. Updating this file
// is the canonical way to record a new phase ship; the rest of
// the surface (about page, README, marketing site) reads from it.
// ============================================================

export type PhaseShippingStatus = "shipped" | "in-progress" | "scoped" | "future";

export interface RoadmapPhase {
  id: string;
  title: string;
  /** "Phase 2.0" / "Phase 5.1" — the shipping marker. */
  marker: string;
  status: PhaseShippingStatus;
  /** Tier the phase contributes to in the marketing tier alignment. */
  tier: "core-portal" | "advanced-portal" | "innovation-studio" | "enterprise-network";
  summary: string;
  /** Specific routes / modules this phase landed. */
  features: string[];
  branch?: string;
  prNumber?: number;
  /** What's still left in the `.x.1` follow-up. */
  remaining?: string[];
}

export const ROADMAP_STATUS: RoadmapPhase[] = [
  {
    id: "phase-1-foundation",
    title: "Foundation slice",
    marker: "Phase 1.0",
    status: "shipped",
    tier: "core-portal",
    summary: "First implementation slice. Architecture doc, domain model, deterministic mock data, eight portal surfaces with the chassis design language.",
    features: [
      "docs/client-portal-target-architecture.md",
      "lib/portal/types.ts + lib/portal/mock-data.ts (deterministic seed)",
      "Eight portal surfaces (Command Center, Engagements, Deliverables, Decisions, Agents, Knowledge, Outcomes, Governance)",
      "Six reusable patterns under components/patterns/",
    ],
    branch: "claude/client-portal-mvp-3CFwb",
    prNumber: 1,
  },
  {
    id: "phase-2-persistence",
    title: "Persistence + identity",
    marker: "Phase 2.0",
    status: "shipped",
    tier: "core-portal",
    summary: "Repository abstraction, role gate, dev-bypass identity, server actions, audited mutations.",
    features: [
      "lib/portal/repositories/* — PortalRepository interface + in-memory adapter",
      "lib/auth/{runtime,session,membership-gate,actions}.ts",
      "components/shell/role-switcher.tsx",
      "lib/portal/actions.ts — approve/defer/reject + promote-knowledge",
      "/portal/governance activation-status surface",
    ],
    branch: "claude/portal-phase-2-persistence-identity",
    prNumber: 2,
    remaining: [
      "Supabase persistence adapter behind SUPABASE_URL",
      "Real Google OAuth via NextAuth v5",
      "One-shot provisioning script",
    ],
  },
  {
    id: "phase-3-engagement-analyst",
    title: "One real agent end-to-end",
    marker: "Phase 3.0",
    status: "shipped",
    tier: "core-portal",
    summary: "Engagement Analyst agent against the Anthropic Messages API with prompt caching, telemetry, and a deterministic stub mode.",
    features: [
      "lib/portal/agents/runtime/anthropic.ts — direct fetch wrapper",
      "lib/portal/agents/tools.ts — search_artifacts, read_decision, summarize_signals, cite_evidence, propose_decision",
      "lib/portal/agents/engagement-analyst.ts (delegated through the Phase 5 runner)",
      "/portal/governance Cost & Cache health card",
    ],
    branch: "claude/portal-phase-3-engagement-analyst",
    prNumber: 3,
    remaining: [
      "Evaluation harness with replayable transcripts",
      "Conversation persistence per run",
      "Cache hit rate ≥ 0.6 acceptance with real API key",
    ],
  },
  {
    id: "phase-4-mem-palace",
    title: "Knowledge mem-palace + workspace search",
    marker: "Phase 4.0",
    status: "shipped",
    tier: "core-portal",
    summary: "CAIA mem-palace ported into the portal. TF-IDF retrieval, workspace-wide search, confidence-decay revalidation queue.",
    features: [
      "lib/portal/knowledge/{types,in-memory-adapter,index}.ts",
      "/portal/search with entity / shelf / freshness filters",
      "/portal/deliverables/[id] detail with live-decayed confidence",
      "Knowledge revalidation queue with urgency ranking",
    ],
    branch: "claude/portal-phase-4-mem-palace",
    prNumber: 4,
  },
  {
    id: "phase-4-1-editor",
    title: "Artifact editor + canonical promotion",
    marker: "Phase 4.1",
    status: "shipped",
    tier: "core-portal",
    summary: "Markdown editor, inline citation chips, line-level diff, canonical-promotion via Governance Auditor.",
    features: [
      "/portal/deliverables/[id]/edit — Markdown editor with live preview",
      "components/patterns/artifact-markdown.tsx — citation-aware renderer",
      "lib/portal/artifact-actions.ts — save / mint / propose / approve canonical",
      "Naive LCS line diff on the detail page",
    ],
    branch: "claude/portal-phase-4-1-canonical-editor",
    prNumber: 6,
    remaining: ["pgvector adapter", "Confidence-decay cron", "Inline comment posting from detail view"],
  },
  {
    id: "phase-5-agent-fleet",
    title: "Full agent fleet + separation of powers",
    marker: "Phase 5.0",
    status: "shipped",
    tier: "advanced-portal",
    summary: "8 agents across 4 archetypes. Tool-catalog-enforced separation of powers.",
    features: [
      "lib/portal/agents/registry.ts — 8 agents",
      "lib/portal/agents/tool-catalog.ts — isToolPermitted predicate",
      "lib/portal/agents/runner.ts — generic orchestrator with per-archetype stub modes",
      "/portal/governance Fleet telemetry table",
    ],
    branch: "claude/portal-phase-5-agent-fleet",
    prNumber: 5,
  },
  {
    id: "phase-5-1-nba-schedule",
    title: "NBA ranking pipeline + Schedule",
    marker: "Phase 5.1",
    status: "shipped",
    tier: "advanced-portal",
    summary: "Live Next-Best-Actions ranker on the Command Center + Schedule surface for engagement touchpoints.",
    features: [
      "lib/portal/next-best-actions.ts — ranks across 5 sources",
      "/portal/schedule — propose / confirm / cancel touchpoints",
      "ScheduleItem repository contract + audit emission",
    ],
    branch: "claude/portal-phase-5-1-nba-schedule",
    prNumber: 9,
  },
  {
    id: "phase-6-telemetry",
    title: "Telemetry + Impact Report",
    marker: "Phase 6.0",
    status: "shipped",
    tier: "advanced-portal",
    summary: "Typed event bus, derived metrics, Quarterly Impact Report, cross-engagement intelligence.",
    features: [
      "lib/portal/telemetry/event-bus.ts — 11-variant PortalEvent",
      "lib/portal/telemetry/metrics.ts — 7 derived metrics",
      "/portal/outcomes/impact-report — board-ready Markdown",
      "lib/portal/cross-engagement.ts — overlap-based suggestions",
    ],
    branch: "claude/portal-phase-6-telemetry-impact",
    prNumber: 7,
  },
  {
    id: "phase-7-innovation",
    title: "Innovation Studio",
    marker: "Phase 7.0",
    status: "shipped",
    tier: "innovation-studio",
    summary: "Strategic Partner tier surface. 15-pattern library, roadmap simulator, decision-tree visualization.",
    features: [
      "/portal/innovation — KPI tiles, simulator, decision tree, pattern browser",
      "lib/portal/innovation/patterns.ts — 15 curated patterns",
      "lib/portal/innovation/simulator.ts — scenario sims + buildDecisionTree",
    ],
    branch: "claude/portal-phase-7-innovation-studio",
    prNumber: 8,
  },
  {
    id: "phase-8-multi-workspace",
    title: "Multi-workspace + org rollup",
    marker: "Phase 8.0",
    status: "shipped",
    tier: "enterprise-network",
    summary: "Read-only org rollup with peer-workspace seeds + TopBar workspace switcher.",
    features: [
      "lib/portal/org-rollup.ts — getOrgRollup with health scoring",
      "/portal/org — aggregate KPIs + per-workspace health cards",
      "components/shell/workspace-switcher.tsx",
    ],
    branch: "claude/portal-phase-8-multi-workspace",
    prNumber: 10,
  },
  {
    id: "phase-9-api-sdk",
    title: "REST API + typed SDK + webhooks",
    marker: "Phase 9.0",
    status: "shipped",
    tier: "enterprise-network",
    summary: "Versioned v1 REST surface, typed in-repo SDK, webhook ledger, API explorer.",
    features: [
      "app/api/portal/v1/* — 7 routes",
      "lib/portal/api/auth.ts — Bearer gate",
      "lib/portal/webhooks.ts — in-process ledger",
      "lib/portal-sdk/index.ts — universal typed client",
      "/portal/api — explorer page",
    ],
    branch: "claude/portal-phase-9-api-sdk",
    prNumber: 11,
  },
  {
    id: "phase-10-compliance",
    title: "Compliance posture + sector packs",
    marker: "Phase 10.0",
    status: "shipped",
    tier: "enterprise-network",
    summary: "Cross-framework readiness across Protected B IL2, FedRAMP Low, SOC 2 II, HIPAA.",
    features: [
      "lib/portal/compliance.ts — computePortalCompliance",
      "/portal/compliance — highlights, gaps, per-framework readiness",
      "5 sector packs across all four frameworks",
    ],
    branch: "claude/portal-phase-10-compliance",
    prNumber: 12,
  },
  {
    id: "phase-11-outbound",
    title: "Outbound action sandbox",
    marker: "Phase 11.0",
    status: "shipped",
    tier: "enterprise-network",
    summary: "Propose → approve → dry-run → commit → rollback contract with 7 connectors and 14 capabilities.",
    features: [
      "lib/portal/outbound-actions/* — connectors + lifecycle",
      "/portal/actions — sandbox surface",
      "Inverse-plan inspector + dry-run + simulated-diff",
    ],
    branch: "claude/portal-phase-11-outbound-actions",
    prNumber: 13,
  },
  {
    id: "phase-12-federation",
    title: "Federation + cross-tenant search",
    marker: "Phase 12.0",
    status: "shipped",
    tier: "enterprise-network",
    summary: "4 sector federations, 3-tier anonymization pipeline, cross-tenant search that strips workspace provenance.",
    features: [
      "lib/portal/federation/* — federations, contributions, anonymization",
      "/portal/federation — surface with join/leave/contribute/withdraw + search",
    ],
    branch: "claude/portal-phase-12-federation",
    prNumber: 14,
  },
  {
    id: "phase-13-fine-tunes",
    title: "Per-workspace model registry",
    marker: "Phase 13.0",
    status: "shipped",
    tier: "enterprise-network",
    summary: "Baseline + fine-tune registry with quality gate (≥ 2-point lift) + drift-based auto-rollback.",
    features: [
      "lib/portal/models/* — variants, propose, route, rollback",
      "/portal/models — registry + propose form",
      "Drift > 0.4 auto-rolls back to baseline",
    ],
    branch: "claude/portal-phase-13-fine-tunes",
    prNumber: 15,
  },
  {
    id: "phase-14-portfolio",
    title: "Dauntless portfolio rollup",
    marker: "Phase 14.0",
    status: "shipped",
    tier: "enterprise-network",
    summary: "Firm-level cockpit — health, margin, churn risk, pattern emergence, internal decision register.",
    features: [
      "lib/portal/portfolio/* — accounts, patterns, internal decisions",
      "/portal/portfolio — owner-gated firm-level surface",
    ],
    branch: "claude/portal-phase-14-portfolio",
    prNumber: 16,
  },
  {
    id: "phase-15-marketplace",
    title: "Third-party agent marketplace",
    marker: "Phase 15.0",
    status: "shipped",
    tier: "enterprise-network",
    summary: "Submission spec, eval harness (re-uses Phase 5 tool catalog), assurance reports, install / killswitch, revenue-share ledger.",
    features: [
      "lib/portal/marketplace/* — listings, evals, installs, payouts, killswitch",
      "/portal/marketplace — browse / install / killswitch surface",
    ],
    branch: "claude/portal-phase-15-marketplace",
    prNumber: 17,
  },
];

export function getShippedCount(): number {
  return ROADMAP_STATUS.filter((p) => p.status === "shipped").length;
}

export function getCoverageByTier(): Record<RoadmapPhase["tier"], { shipped: number; total: number }> {
  const tiers: RoadmapPhase["tier"][] = [
    "core-portal",
    "advanced-portal",
    "innovation-studio",
    "enterprise-network",
  ];
  const result = {} as Record<RoadmapPhase["tier"], { shipped: number; total: number }>;
  for (const tier of tiers) {
    const rows = ROADMAP_STATUS.filter((p) => p.tier === tier);
    result[tier] = {
      shipped: rows.filter((p) => p.status === "shipped").length,
      total: rows.length,
    };
  }
  return result;
}
