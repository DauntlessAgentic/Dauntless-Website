// ============================================================
// Dauntless portfolio rollup (Phase 14.0)
//
// The Dauntless-internal view across every client workspace.
// Phase 14.0 ships the shape + a deterministic seed (4 client
// accounts). Phase 14.1 reads from real per-workspace telemetry.
// ============================================================

export type AccountTier = "starter" | "core" | "advanced" | "strategic";
export type ChurnRisk = "low" | "watch" | "elevated" | "critical";

export interface PortfolioAccount {
  workspaceId: string;
  organizationName: string;
  tier: AccountTier;
  engagementsActive: number;
  monthlyRecurringUsd: number;
  costToServeUsd: number;
  grossMarginUsd: number;
  /** Health score 0–100 (re-uses org-rollup formula). */
  healthScore: number;
  churnRisk: ChurnRisk;
  expansionScore: number;
  /** Last touchpoint timestamp. */
  lastActivityAt: Date;
  /** Marketing-visible name of the primary engagement. */
  flagshipEngagement: string;
}

export interface PortfolioEmergentPattern {
  id: string;
  title: string;
  /** Workspaces where the pattern has been observed (anonymized in the UI). */
  workspaces: string[];
  category: "consulting" | "training" | "agentic" | "governance" | "activation";
  /** 0–1 confidence that this is a real cross-workspace pattern. */
  confidence: number;
  recommendedAction: "promote-to-federation" | "watch" | "ignore";
}

export interface InternalDecision {
  id: string;
  title: string;
  status: "pending-approval" | "approved" | "deferred" | "rejected";
  category: "pricing" | "sector-focus" | "hiring" | "tooling" | "marketing";
  proposedBy: string;
  rationale: string;
  riskTier: "low" | "medium" | "high";
  confidence: number;
  dueAt?: Date;
  decidedAt?: Date;
  decidedBy?: string;
}
