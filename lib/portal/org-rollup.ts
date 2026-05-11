// ============================================================
// Org rollup (Phase 8.0)
//
// Single-tenant workspaces inside the same organization aggregate
// to an Org Rollup view. Phase 8.0 ships the shape + a deterministic
// peer-workspace seed (the active workspace + 2 synthetic peers so
// the rollup has non-trivial structure). Phase 8.1 wires the
// switcher to actually swap the active repository workspace + adds
// cross-workspace dependency analysis.
// ============================================================

// Server-only by convention.

import { getPortalRepository } from "@/lib/portal/repositories";
import type { Engagement, Organization } from "@/lib/portal/types";

export type WorkspaceHealth = "healthy" | "watch" | "at-risk";

export interface WorkspaceSummary {
  id: string;
  orgId: string;
  name: string;
  visibility: "private" | "partner" | "public";
  trustBadge: string;
  active: boolean;
  /** Engagement count + breakdown. */
  engagements: {
    total: number;
    active: number;
    blocked: number;
    complete: number;
  };
  decisions: {
    pending: number;
    approvedLast30d: number;
  };
  artifacts: {
    canonical: number;
    inReview: number;
  };
  health: WorkspaceHealth;
  /** 0–100 composite. */
  healthScore: number;
  /** Snapshot of recent agent activity. */
  recentAgentRuns: number;
  primaryEngagementName: string | null;
}

export interface OrgRollup {
  organization: Organization;
  workspaces: WorkspaceSummary[];
  /** Aggregate KPIs across the whole org. */
  totals: {
    engagements: number;
    pendingDecisions: number;
    canonicalArtifacts: number;
    healthScore: number;
  };
  /** Cross-workspace dependency hints (Phase 8.0 stub list). */
  dependencies: Array<{
    fromWorkspaceId: string;
    toWorkspaceId: string;
    summary: string;
  }>;
}

/**
 * Returns the rollup for the active organization. The primary workspace
 * comes from the live repository; peer workspaces are seeded
 * deterministically so the rollup view has meaningful comparison
 * surface without a multi-tenant backend.
 */
export async function getOrgRollup(orgId: string): Promise<OrgRollup> {
  const repo = getPortalRepository();
  const activeWorkspace = await repo.getDefaultWorkspace();
  const organization = (await repo.getOrganization(orgId)) ?? {
    id: orgId,
    name: "Treasury Board of Canada Secretariat",
    shortName: "TBS",
    sector: "Federal Government — Central Agency",
    region: "Ottawa, Canada",
    trustTier: "elevated" as const,
  };

  const [engagements, decisions, artifacts] = await Promise.all([
    repo.listEngagements(activeWorkspace.id),
    repo.listDecisions(activeWorkspace.id),
    repo.listArtifacts(activeWorkspace.id),
  ]);
  const activeAgentRuns = (await repo.listAuditLog(activeWorkspace.id, 50)).filter(
    (a) => a.actorKind === "agent",
  ).length;
  const recentApprovedDecisions = decisions.filter(
    (d) => d.status === "approved" && d.decidedAt && Date.now() - d.decidedAt.getTime() < 30 * 24 * 60 * 60 * 1000,
  );

  const primary: WorkspaceSummary = {
    id: activeWorkspace.id,
    orgId,
    name: activeWorkspace.name,
    visibility: activeWorkspace.visibility,
    trustBadge: activeWorkspace.trustBadge,
    active: true,
    engagements: tallyEngagements(engagements),
    decisions: {
      pending: decisions.filter((d) => d.status === "pending-approval").length,
      approvedLast30d: recentApprovedDecisions.length,
    },
    artifacts: {
      canonical: artifacts.filter((a) => a.canonical).length,
      inReview: artifacts.filter((a) => a.reviewState === "in-review").length,
    },
    health: "healthy",
    healthScore: 0, // filled below
    recentAgentRuns: activeAgentRuns,
    primaryEngagementName: engagements[0]?.name ?? null,
  };
  primary.healthScore = computeHealthScore(primary);
  primary.health = primary.healthScore >= 70 ? "healthy" : primary.healthScore >= 45 ? "watch" : "at-risk";

  const peers = synthesizePeerWorkspaces(orgId);
  const workspaces = [primary, ...peers];

  const totals = workspaces.reduce(
    (acc, w) => ({
      engagements: acc.engagements + w.engagements.total,
      pendingDecisions: acc.pendingDecisions + w.decisions.pending,
      canonicalArtifacts: acc.canonicalArtifacts + w.artifacts.canonical,
      healthScore: acc.healthScore + w.healthScore,
    }),
    { engagements: 0, pendingDecisions: 0, canonicalArtifacts: 0, healthScore: 0 },
  );
  totals.healthScore = Math.round(totals.healthScore / Math.max(1, workspaces.length));

  const dependencies = [
    {
      fromWorkspaceId: activeWorkspace.id,
      toWorkspaceId: "ws-tbs-policy-modernization",
      summary:
        "Active workspace's Decision Architecture references the Policy Modernization governance pillars.",
    },
    {
      fromWorkspaceId: "ws-tbs-policy-modernization",
      toWorkspaceId: activeWorkspace.id,
      summary:
        "Policy Modernization team cites this workspace's Operating Model Blueprint as canonical.",
    },
    {
      fromWorkspaceId: "ws-tbs-service-design",
      toWorkspaceId: activeWorkspace.id,
      summary:
        "Service Design pilot looking to inherit this workspace's three-tier risk-gating framework.",
    },
  ];

  return { organization, workspaces, totals, dependencies };
}

function tallyEngagements(engagements: Engagement[]) {
  return {
    total: engagements.length,
    active: engagements.filter((e) => e.status === "active").length,
    blocked: engagements.filter((e) => e.status === "blocked").length,
    complete: engagements.filter((e) => e.status === "complete").length,
  };
}

function computeHealthScore(w: WorkspaceSummary): number {
  // Health bands:
  //   100 max
  //   −10 per blocked engagement
  //   −5 per pending high-risk decision proxy (we use count > 3)
  //   +5 per canonical artifact (capped at +30)
  //   +5 per approved-last-30d decision (capped at +15)
  let score = 100;
  score -= w.engagements.blocked * 10;
  if (w.decisions.pending > 3) score -= (w.decisions.pending - 3) * 5;
  score += Math.min(30, w.artifacts.canonical * 5);
  score += Math.min(15, w.decisions.approvedLast30d * 5);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Deterministic peer-workspace seeds. They are intentionally hand-curated
 * so the rollup view has meaningful structure. Phase 8.1 will replace
 * this with a real multi-tenant query once Supabase persistence lands.
 */
function synthesizePeerWorkspaces(orgId: string): WorkspaceSummary[] {
  return [
    {
      id: "ws-tbs-policy-modernization",
      orgId,
      name: "TBS · Policy Modernization",
      visibility: "private",
      trustBadge: "Protected B · Need-to-Know",
      active: false,
      engagements: { total: 2, active: 2, blocked: 0, complete: 1 },
      decisions: { pending: 2, approvedLast30d: 4 },
      artifacts: { canonical: 3, inReview: 1 },
      health: "healthy",
      healthScore: 82,
      recentAgentRuns: 6,
      primaryEngagementName: "Treasury policy stack — AI lens",
    },
    {
      id: "ws-tbs-service-design",
      orgId,
      name: "TBS · Service Design Pilot",
      visibility: "partner",
      trustBadge: "Protected B · Partner Visibility",
      active: false,
      engagements: { total: 1, active: 1, blocked: 1, complete: 0 },
      decisions: { pending: 5, approvedLast30d: 1 },
      artifacts: { canonical: 1, inReview: 2 },
      health: "watch",
      healthScore: 58,
      recentAgentRuns: 3,
      primaryEngagementName: "AI for Service Design — discovery",
    },
  ];
}
