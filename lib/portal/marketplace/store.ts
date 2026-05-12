// ============================================================
// Marketplace store (Phase 15.0)
//
// In-process registry of marketplace listings + installs +
// payouts. Phase 15.1 persists into the repository.
// ============================================================

import { isToolPermitted } from "@/lib/portal/agents/tool-catalog";

import type {
  MarketplaceEvalResult,
  MarketplaceInstall,
  MarketplaceListing,
  MarketplacePayout,
  SubmitListingInput,
} from "./types";

const listings: MarketplaceListing[] = [];
const installs: MarketplaceInstall[] = [];
const payouts: MarketplacePayout[] = [];
let counter = 0;
let seeded = false;

function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

function ensureSeed(): void {
  if (seeded) return;
  listings.push(
    {
      id: "mkt-policy-foresight",
      name: "Policy Foresight",
      developer: "Civic Foresight Co.",
      archetype: "strategist",
      description:
        "Cross-engagement policy-foresight strategist: scans the workspace + federation layer for emergent policy shifts and proposes a decision.",
      scopeBullets: [
        "Read-only across workspace artifacts + signals",
        "Read federation canonical layer (where the workspace is a member)",
        "propose_decision — only for engagements with kind=advisory or discovery",
      ],
      toolSurface: ["search_artifacts", "read_decision", "summarize_signals", "cite_evidence", "propose_decision"],
      models: ["claude-sonnet-4-6", "claude-haiku-4-5"],
      pricePerInstallUsd: 49,
      revenueSharePct: 70,
      evalResults: {
        decisionAccuracy: 0.86,
        evidenceCompleteness: 0.93,
        toxicityScore: 0.02,
        separationOfPowersRespect: true,
        passingControlCount: 11,
        totalControlCount: 12,
        verdict: "pass",
        notes: "Caught one borderline cite_evidence call (missing ev-id). Acceptable; vendor agreed to fix in v1.1.",
        ranAt: new Date("2026-04-20T12:00:00Z"),
      },
      assuranceReport: {
        reportedBy: "Dauntless Governance Auditor",
        reportedAt: new Date("2026-04-22T12:00:00Z"),
        summary: "Listing meets the Phase 15 assurance bar. Killswitch tested.",
        followUps: ["Vendor to ship v1.1 with explicit ev-id validation by 2026-06-15."],
      },
      status: "live",
      installCount: 1,
      submittedAt: new Date("2026-04-12T12:00:00Z"),
      publishedAt: new Date("2026-04-22T12:00:00Z"),
    },
    {
      id: "mkt-procurement-auditor",
      name: "Procurement Auditor",
      developer: "OpenGov Auditing Inc.",
      archetype: "auditor",
      description:
        "Sector-specialist evidence auditor for federal procurement decisions. Reads decisions + cites evidence; never mutates artifacts.",
      scopeBullets: [
        "Read-only across decisions and evidence",
        "audit_evidence_completeness only on decisions with engagementKind=discovery or design",
      ],
      toolSurface: ["search_artifacts", "read_decision", "cite_evidence", "audit_evidence_completeness"],
      models: ["claude-haiku-4-5"],
      pricePerInstallUsd: 29,
      revenueSharePct: 70,
      evalResults: {
        decisionAccuracy: 0.78,
        evidenceCompleteness: 0.95,
        toxicityScore: 0.01,
        separationOfPowersRespect: true,
        passingControlCount: 12,
        totalControlCount: 12,
        verdict: "pass",
        notes: "Clean pass. Strong evidence-chain coverage; conservative posture on partial-evidence proposals.",
        ranAt: new Date("2026-05-04T14:00:00Z"),
      },
      assuranceReport: {
        reportedBy: "Dauntless Governance Auditor",
        reportedAt: new Date("2026-05-05T14:00:00Z"),
        summary: "Listing meets the assurance bar with zero follow-ups.",
        followUps: [],
      },
      status: "live",
      installCount: 0,
      submittedAt: new Date("2026-04-29T12:00:00Z"),
      publishedAt: new Date("2026-05-05T14:00:00Z"),
    },
    {
      id: "mkt-rfp-drafter",
      name: "RFP Drafter",
      developer: "Atlas Procurement",
      archetype: "operator",
      description:
        "Operator-archetype agent that drafts Request-for-Proposal artifacts from canonical engagement state.",
      scopeBullets: [
        "Read-only across canonical artifacts + evidence",
        "draft_artifact_version only on artifacts with type=blueprint or roadmap",
        "Must request_review after every draft",
      ],
      toolSurface: ["search_artifacts", "cite_evidence", "draft_artifact_version", "request_review"],
      models: ["claude-haiku-4-5", "claude-sonnet-4-6"],
      pricePerInstallUsd: 39,
      revenueSharePct: 70,
      evalResults: {
        decisionAccuracy: 0.66,
        evidenceCompleteness: 0.71,
        toxicityScore: 0.03,
        separationOfPowersRespect: true,
        passingControlCount: 9,
        totalControlCount: 12,
        verdict: "fail",
        notes:
          "Borderline. Two evals failed because the agent drafted without first reading evidence. Vendor working on a fix.",
        ranAt: new Date("2026-05-08T11:00:00Z"),
      },
      assuranceReport: null,
      status: "pending-eval",
      installCount: 0,
      submittedAt: new Date("2026-05-06T11:00:00Z"),
    },
  );
  // Synthetic install on the active workspace for Policy Foresight.
  installs.push({
    id: "mkt-install-1",
    listingId: "mkt-policy-foresight",
    workspaceId: "ws-tbs-ai-modernization",
    installedBy: "Dr. Eleanor Vance",
    installedAt: new Date("2026-04-25T12:00:00Z"),
    status: "active",
  });
  payouts.push({
    developer: "Civic Foresight Co.",
    periodLabel: "2026-04",
    installs: 1,
    grossUsd: 49,
    shareUsd: 49 * 0.7,
    paidAt: new Date("2026-05-01T12:00:00Z"),
  });
  seeded = true;
}

export function listListings(): MarketplaceListing[] {
  ensureSeed();
  return listings.slice().map((l) => structuredClone(l));
}

export function listInstalls(workspaceId: string): MarketplaceInstall[] {
  ensureSeed();
  return installs
    .filter((i) => i.workspaceId === workspaceId)
    .map((i) => ({ ...i }))
    .sort((a, b) => b.installedAt.getTime() - a.installedAt.getTime());
}

export function listPayouts(): MarketplacePayout[] {
  ensureSeed();
  return payouts.slice().map((p) => ({ ...p }));
}

export function submitListing(input: SubmitListingInput): MarketplaceListing {
  ensureSeed();
  const listing: MarketplaceListing = {
    id: generateId("mkt"),
    name: input.name,
    developer: input.developer,
    archetype: input.archetype,
    description: input.description,
    scopeBullets: [...input.scopeBullets],
    toolSurface: [...input.toolSurface],
    models: [...input.models],
    pricePerInstallUsd: input.pricePerInstallUsd ?? 49,
    revenueSharePct: input.revenueSharePct ?? 70,
    evalResults: null,
    assuranceReport: null,
    status: "pending-eval",
    installCount: 0,
    submittedAt: new Date(),
  };
  listings.push(listing);
  return structuredClone(listing);
}

export function runEvalForListing(listingId: string): MarketplaceEvalResult {
  ensureSeed();
  const listing = listings.find((l) => l.id === listingId);
  if (!listing) throw new Error(`Listing not found: ${listingId}`);
  const respectsSeparation = listing.toolSurface.every((tool) =>
    isToolPermitted(listing.archetype, tool),
  );
  const totalControlCount = 12;
  const passing =
    (respectsSeparation ? 5 : 0) +
    (listing.toolSurface.length >= 3 ? 3 : 1) +
    (listing.models.length >= 1 ? 2 : 0) +
    (listing.description.length > 60 ? 2 : 0);
  const verdict: MarketplaceEvalResult["verdict"] = respectsSeparation && passing >= 10 ? "pass" : "fail";
  const accuracy = 0.6 + Math.min(0.3, listing.toolSurface.length * 0.05);
  const result: MarketplaceEvalResult = {
    decisionAccuracy: Math.min(0.99, accuracy),
    evidenceCompleteness: Math.min(0.99, accuracy + 0.05),
    toxicityScore: 0.02,
    separationOfPowersRespect: respectsSeparation,
    passingControlCount: Math.min(totalControlCount, passing),
    totalControlCount,
    verdict,
    notes: respectsSeparation
      ? "Separation-of-powers respected at the tool-catalog level."
      : "Listing declared tools outside the archetype's permitted surface; failed automatically.",
    ranAt: new Date(),
  };
  listing.evalResults = result;
  listing.status = verdict === "pass" ? "passed-eval" : "pending-eval";
  return structuredClone(result);
}

export function publishListing(listingId: string): MarketplaceListing {
  ensureSeed();
  const listing = listings.find((l) => l.id === listingId);
  if (!listing) throw new Error(`Listing not found: ${listingId}`);
  if (listing.status !== "passed-eval") {
    throw new Error(`Listing must pass eval before publishing (currently ${listing.status}).`);
  }
  listing.status = "live";
  listing.publishedAt = new Date();
  if (!listing.assuranceReport) {
    listing.assuranceReport = {
      reportedBy: "Dauntless Governance Auditor",
      reportedAt: new Date(),
      summary: "Automated assurance report. Phase 15.1 wires real human review.",
      followUps: [],
    };
  }
  return structuredClone(listing);
}

export function installListing(input: { listingId: string; workspaceId: string; installedBy: string }): MarketplaceInstall {
  ensureSeed();
  const listing = listings.find((l) => l.id === input.listingId);
  if (!listing) throw new Error(`Listing not found: ${input.listingId}`);
  if (listing.status !== "live") throw new Error(`Listing is not live (${listing.status}).`);
  if (installs.some((i) => i.workspaceId === input.workspaceId && i.listingId === input.listingId && i.status === "active")) {
    throw new Error("Listing is already installed in this workspace.");
  }
  const install: MarketplaceInstall = {
    id: generateId("mkt-install"),
    listingId: input.listingId,
    workspaceId: input.workspaceId,
    installedBy: input.installedBy,
    installedAt: new Date(),
    status: "active",
  };
  installs.push(install);
  listing.installCount += 1;
  return structuredClone(install);
}

export function removeInstall(installId: string): void {
  ensureSeed();
  const install = installs.find((i) => i.id === installId);
  if (!install || install.status !== "active") return;
  install.status = "removed";
  const listing = listings.find((l) => l.id === install.listingId);
  if (listing) listing.installCount = Math.max(0, listing.installCount - 1);
}

export function killSwitch(listingId: string, reason: string): void {
  ensureSeed();
  const listing = listings.find((l) => l.id === listingId);
  if (!listing) throw new Error(`Listing not found: ${listingId}`);
  listing.status = "killswitched";
  listing.killSwitchedAt = new Date();
  listing.killSwitchReason = reason;
  for (const install of installs) {
    if (install.listingId === listingId && install.status === "active") {
      install.status = "removed";
    }
  }
  listing.installCount = 0;
}

/** Test-only escape hatch. */
export function __resetMarketplace(): void {
  listings.length = 0;
  installs.length = 0;
  payouts.length = 0;
  counter = 0;
  seeded = false;
}
