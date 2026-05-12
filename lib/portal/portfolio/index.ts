// ============================================================
// Portfolio rollup data (Phase 14.0)
//
// Synthetic seed for Dauntless-internal portfolio view. Mirrors
// the org rollup pattern but at the firm level. Phase 14.1 will
// project from real telemetry once cross-workspace persistence
// lands.
// ============================================================

import type {
  InternalDecision,
  PortfolioAccount,
  PortfolioEmergentPattern,
} from "./types";

export const PORTFOLIO_ACCOUNTS: PortfolioAccount[] = [
  {
    workspaceId: "ws-tbs-ai-modernization",
    organizationName: "Treasury Board of Canada Secretariat",
    tier: "strategic",
    engagementsActive: 3,
    monthlyRecurringUsd: 86_000,
    costToServeUsd: 31_500,
    grossMarginUsd: 54_500,
    healthScore: 84,
    churnRisk: "low",
    expansionScore: 0.78,
    lastActivityAt: new Date("2026-05-11T09:00:00Z"),
    flagshipEngagement: "AI Operations Discovery Sprint",
  },
  {
    workspaceId: "ws-esdc-foresight",
    organizationName: "ESDC (Service Foresight Lab)",
    tier: "core",
    engagementsActive: 2,
    monthlyRecurringUsd: 41_000,
    costToServeUsd: 19_500,
    grossMarginUsd: 21_500,
    healthScore: 72,
    churnRisk: "watch",
    expansionScore: 0.58,
    lastActivityAt: new Date("2026-05-09T18:00:00Z"),
    flagshipEngagement: "Service foresight retrospective sprint",
  },
  {
    workspaceId: "ws-health-canada-foresight",
    organizationName: "Health Canada",
    tier: "advanced",
    engagementsActive: 2,
    monthlyRecurringUsd: 58_000,
    costToServeUsd: 22_400,
    grossMarginUsd: 35_600,
    healthScore: 64,
    churnRisk: "watch",
    expansionScore: 0.42,
    lastActivityAt: new Date("2026-04-28T14:00:00Z"),
    flagshipEngagement: "Clinical AI risk register pilot",
  },
  {
    workspaceId: "ws-nrcan-energy",
    organizationName: "NRCan · Clean Energy",
    tier: "starter",
    engagementsActive: 1,
    monthlyRecurringUsd: 22_000,
    costToServeUsd: 14_000,
    grossMarginUsd: 8_000,
    healthScore: 41,
    churnRisk: "elevated",
    expansionScore: 0.22,
    lastActivityAt: new Date("2026-03-31T13:00:00Z"),
    flagshipEngagement: "Energy-transition discovery scan",
  },
];

export const EMERGENT_PATTERNS: PortfolioEmergentPattern[] = [
  {
    id: "epn-canonical-promotion-cadence",
    title: "Canonical promotion paired with SteerCo cadence",
    workspaces: ["ws-tbs-ai-modernization", "ws-esdc-foresight", "ws-health-canada-foresight"],
    category: "governance",
    confidence: 0.82,
    recommendedAction: "promote-to-federation",
  },
  {
    id: "epn-activation-cadence",
    title: "Fortnightly champion calibration cadence",
    workspaces: ["ws-tbs-ai-modernization", "ws-esdc-foresight"],
    category: "activation",
    confidence: 0.65,
    recommendedAction: "promote-to-federation",
  },
  {
    id: "epn-three-tier-evidence",
    title: "Three-evidence-source rule on high-tier decisions",
    workspaces: ["ws-tbs-ai-modernization", "ws-health-canada-foresight", "ws-nrcan-energy"],
    category: "governance",
    confidence: 0.88,
    recommendedAction: "promote-to-federation",
  },
  {
    id: "epn-confidence-decay-ui",
    title: "Confidence-decay revalidation queue surfaced inline",
    workspaces: ["ws-tbs-ai-modernization", "ws-health-canada-foresight"],
    category: "agentic",
    confidence: 0.54,
    recommendedAction: "watch",
  },
];

export const INTERNAL_DECISIONS: InternalDecision[] = [
  {
    id: "idec-q3-pricing-revisit",
    title: "Re-tier the Strategic Partner SKU upward to reflect Phase 7 + 13 differentiation",
    status: "pending-approval",
    category: "pricing",
    proposedBy: "Cassandra Reyes",
    rationale:
      "Phase 7 Innovation Studio + Phase 13 fine-tunes shift Strategic Partner from feature-parity with Advanced into a real differentiated tier. Pricing intelligence shows headroom of ~30% across the strategic accounts.",
    riskTier: "medium",
    confidence: 0.74,
    dueAt: new Date("2026-06-15T17:00:00Z"),
  },
  {
    id: "idec-sector-energy",
    title: "Open the energy sector with a Q3 NRCan + AESO pilot",
    status: "pending-approval",
    category: "sector-focus",
    proposedBy: "Devak Kapoor",
    rationale:
      "Federal-CA federation has thin energy-sector coverage; NRCan + AESO are warm. Bringing energy in surfaces a new federation candidate (sector-energy) and increases canonical density in 'governance/decision-architecture'.",
    riskTier: "high",
    confidence: 0.61,
    dueAt: new Date("2026-06-30T17:00:00Z"),
  },
  {
    id: "idec-hire-evidence-auditor-lead",
    title: "Hire a Lead Evidence Auditor (governance archetype)",
    status: "approved",
    category: "hiring",
    proposedBy: "Cassandra Reyes",
    rationale:
      "Evidence Auditor agent runs land OK but volume of audit gaps per workspace is climbing; human-in-the-loop coverage is the bottleneck.",
    riskTier: "medium",
    confidence: 0.81,
    decidedAt: new Date("2026-04-25T14:00:00Z"),
    decidedBy: "Cassandra Reyes",
  },
  {
    id: "idec-marketing-phase7-launch",
    title: "Launch Innovation Studio external marketing alongside Phase 7.0 GA",
    status: "deferred",
    category: "marketing",
    proposedBy: "Marie Tremblay",
    rationale:
      "Studio is shippable on the strategic-partner workspace but a marketing-ready demo workspace needs Phase 13 fine-tunes first.",
    riskTier: "low",
    confidence: 0.55,
    decidedAt: new Date("2026-04-20T11:00:00Z"),
    decidedBy: "Cassandra Reyes",
  },
];

export interface PortfolioTotals {
  monthlyRecurringUsd: number;
  costToServeUsd: number;
  grossMarginUsd: number;
  averageHealthScore: number;
  accountsAtRisk: number;
  totalEngagementsActive: number;
}

export function computePortfolioTotals(accounts: PortfolioAccount[]): PortfolioTotals {
  const monthlyRecurringUsd = accounts.reduce((acc, a) => acc + a.monthlyRecurringUsd, 0);
  const costToServeUsd = accounts.reduce((acc, a) => acc + a.costToServeUsd, 0);
  const grossMarginUsd = accounts.reduce((acc, a) => acc + a.grossMarginUsd, 0);
  const averageHealthScore =
    accounts.length === 0 ? 0 : Math.round(accounts.reduce((acc, a) => acc + a.healthScore, 0) / accounts.length);
  const accountsAtRisk = accounts.filter((a) => a.churnRisk === "elevated" || a.churnRisk === "critical").length;
  const totalEngagementsActive = accounts.reduce((acc, a) => acc + a.engagementsActive, 0);
  return {
    monthlyRecurringUsd,
    costToServeUsd,
    grossMarginUsd,
    averageHealthScore,
    accountsAtRisk,
    totalEngagementsActive,
  };
}
