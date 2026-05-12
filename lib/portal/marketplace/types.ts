// ============================================================
// Third-party agent marketplace (Phase 15.0)
//
// External developers submit agents that ride the same governance
// contract as Dauntless's own fleet. Phase 15.0 ships the
// submission spec, eval harness, listing surface, install /
// killswitch flow, and revenue-share placeholder. Phase 15.1
// wires real eval execution + monthly payout reporting.
// ============================================================

import type { AgentArchetype } from "@/lib/portal/types";

export type MarketplaceListingStatus =
  | "pending-eval"
  | "passed-eval"
  | "live"
  | "killswitched"
  | "withdrawn";

export interface MarketplaceListing {
  id: string;
  name: string;
  developer: string;
  archetype: AgentArchetype;
  description: string;
  scopeBullets: string[];
  toolSurface: string[];
  /** Models the agent declares it can run against. */
  models: string[];
  /** USD per workspace install per month. */
  pricePerInstallUsd: number;
  /** Usage-share % returned to the third-party developer. */
  revenueSharePct: number;
  /** Eval harness results — populated after evalListing(). */
  evalResults: MarketplaceEvalResult | null;
  /** Assurance report posted by Dauntless's Governance Auditors. */
  assuranceReport: AssuranceReport | null;
  status: MarketplaceListingStatus;
  /** Live installations across the workspace fleet. */
  installCount: number;
  submittedAt: Date;
  publishedAt?: Date;
  killSwitchedAt?: Date;
  killSwitchReason?: string;
}

export interface MarketplaceEvalResult {
  decisionAccuracy: number; // 0–1
  evidenceCompleteness: number; // 0–1
  toxicityScore: number; // 0–1 (lower better)
  separationOfPowersRespect: boolean;
  passingControlCount: number;
  totalControlCount: number;
  /** Pass / fail verdict. */
  verdict: "pass" | "fail";
  /** Notes shown alongside the verdict. */
  notes: string;
  ranAt: Date;
}

export interface AssuranceReport {
  reportedBy: string;
  reportedAt: Date;
  summary: string;
  followUps: string[];
}

export interface MarketplaceInstall {
  id: string;
  listingId: string;
  workspaceId: string;
  installedBy: string;
  installedAt: Date;
  status: "active" | "paused" | "removed";
}

export interface MarketplacePayout {
  developer: string;
  periodLabel: string;
  installs: number;
  grossUsd: number;
  shareUsd: number;
  paidAt?: Date;
}

export interface SubmitListingInput {
  name: string;
  developer: string;
  archetype: AgentArchetype;
  description: string;
  scopeBullets: string[];
  toolSurface: string[];
  models: string[];
  pricePerInstallUsd?: number;
  revenueSharePct?: number;
}
