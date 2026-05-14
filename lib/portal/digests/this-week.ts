// ============================================================
// "What changed for you this week" digest
//
// Advisory-board action #13. Personalised top-of-Command-Center
// card: my pending approvals, decisions past due, fresh canonical
// promotions, new outbound actions awaiting me, urgent autonomous
// proposals. Sized for a 9-minute Sanjay attention budget.
//
// Pure computation over the repository + telemetry bus + innovation
// engine. Same payload powers the weekly email/PDF digest in a
// follow-up phase.
// ============================================================

import { getPortalRepository } from "@/lib/portal/repositories";
import { listProposals, type InnovationProposal } from "@/lib/portal/innovation/engine";
import { listOutboundActions } from "@/lib/portal/outbound-actions/store";
import { listPortalEvents } from "@/lib/portal/telemetry/event-bus";
import type { MembershipRole } from "@/lib/portal/types";

export interface DigestItem {
  kind:
    | "pending-decision"
    | "stale-decision"
    | "outbound-awaiting-me"
    | "canonical-promotion"
    | "urgent-proposal";
  urgency: "urgent" | "notable" | "advisory";
  title: string;
  detail: string;
  href: string;
  at?: Date;
}

export interface ThisWeekDigest {
  windowDays: number;
  generatedAt: Date;
  forRole: MembershipRole;
  items: DigestItem[];
  summary: {
    urgent: number;
    notable: number;
    advisory: number;
  };
}

export async function buildThisWeekDigest(input: {
  workspaceId: string;
  role: MembershipRole;
  windowDays?: number;
}): Promise<ThisWeekDigest> {
  const windowDays = input.windowDays ?? 7;
  const repo = getPortalRepository();
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const items: DigestItem[] = [];

  const [decisions, artifacts] = await Promise.all([
    repo.listDecisions(input.workspaceId),
    repo.listArtifacts(input.workspaceId),
  ]);

  // 1. Decisions awaiting this role's approval.
  const canApprove = input.role === "owner" || input.role === "executive";
  if (canApprove) {
    const pending = decisions
      .filter((d) => d.status === "pending-approval")
      .sort((a, b) => riskWeight(b.riskTier) - riskWeight(a.riskTier))
      .slice(0, 5);
    for (const d of pending) {
      const overdue = d.dueAt && d.dueAt.getTime() < Date.now();
      items.push({
        kind: overdue ? "stale-decision" : "pending-decision",
        urgency: overdue || d.riskTier === "high" ? "urgent" : "notable",
        title: d.title,
        detail: `${d.riskTier} risk${overdue ? " · past due" : ""} · awaiting your approval`,
        href: `/portal/decisions/${d.id}`,
        at: d.dueAt,
      });
    }
  }

  // 2. Outbound actions awaiting commit (approved but not yet committed).
  const outbound = listOutboundActions(input.workspaceId);
  const awaiting = outbound
    .filter((a) => a.status === "approved")
    .slice(0, 3);
  for (const a of awaiting) {
    items.push({
      kind: "outbound-awaiting-me",
      urgency: "notable",
      title: a.title,
      detail: `${a.connectorId}/${a.capabilityId} · approved · waiting to commit`,
      href: "/portal/actions",
      at: a.approvedAt,
    });
  }

  // 3. Fresh canonical promotions within the window.
  const canonicalEvents = listPortalEvents({
    workspaceId: input.workspaceId,
    kinds: ["artifact-promoted-canonical"],
    since,
  });
  for (const ev of canonicalEvents.slice(0, 3)) {
    if (ev.kind !== "artifact-promoted-canonical") continue;
    const artifact = artifacts.find((a) => a.id === ev.artifactId);
    items.push({
      kind: "canonical-promotion",
      urgency: "advisory",
      title: artifact ? `"${artifact.name}" promoted to canonical` : "Artifact promoted to canonical",
      detail: `By ${ev.actor}${artifact ? ` · ${artifact.type}` : ""}`,
      href: artifact ? `/portal/deliverables/${artifact.id}` : "/portal/knowledge",
      at: ev.at,
    });
  }

  // 4. Urgent autonomous-engine proposals.
  const urgentProposals = listProposals(input.workspaceId)
    .filter((p: InnovationProposal) => p.urgency === "urgent")
    .slice(0, 3);
  for (const p of urgentProposals) {
    items.push({
      kind: "urgent-proposal",
      urgency: "urgent",
      title: p.title,
      detail: p.rationale,
      href: "/portal/innovation",
      at: p.generatedAt,
    });
  }

  items.sort((a, b) => {
    const order = { urgent: 0, notable: 1, advisory: 2 } as const;
    return order[a.urgency] - order[b.urgency];
  });

  return {
    windowDays,
    generatedAt: new Date(),
    forRole: input.role,
    items,
    summary: {
      urgent: items.filter((i) => i.urgency === "urgent").length,
      notable: items.filter((i) => i.urgency === "notable").length,
      advisory: items.filter((i) => i.urgency === "advisory").length,
    },
  };
}

function riskWeight(tier: "low" | "medium" | "high"): number {
  return tier === "high" ? 3 : tier === "medium" ? 2 : 1;
}
