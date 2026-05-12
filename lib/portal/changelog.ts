// ============================================================
// Unified activity stream (closeout)
//
// Compiles a workspace's living history from every available
// signal source: audit log, signal feed, portal telemetry events,
// outbound action records, marketplace installs. Drives the
// /portal/changelog surface.
//
// Server-only by convention.
// ============================================================

import { listAgentRuns } from "@/lib/portal/agents/telemetry";
import { listMemberships as listFederationMemberships } from "@/lib/portal/federation";
import { listOutboundActions } from "@/lib/portal/outbound-actions/store";
import { listInstalls as listMarketplaceInstalls, listListings as listMarketplaceListings } from "@/lib/portal/marketplace/store";
import { listPortalEvents } from "@/lib/portal/telemetry/event-bus";
import type {
  AuditEntry,
  Signal,
} from "@/lib/portal/types";

export type ChangelogSource =
  | "audit"
  | "signal"
  | "telemetry"
  | "outbound"
  | "marketplace"
  | "federation"
  | "agent-run";

export interface ChangelogEntry {
  id: string;
  source: ChangelogSource;
  at: Date;
  title: string;
  detail: string;
  actor?: string;
  actorKind?: "human" | "agent";
  riskTier?: "low" | "medium" | "high";
  /** Optional deep-link target. */
  link?: string;
}

interface CollectInput {
  workspaceId: string;
  auditLog: AuditEntry[];
  signals: Signal[];
}

export function collectChangelog(input: CollectInput, options: { limit?: number; since?: Date } = {}): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];

  for (const audit of input.auditLog) {
    entries.push({
      id: `audit-${audit.id}`,
      source: "audit",
      at: audit.at,
      title: humanizeAction(audit.action),
      detail: audit.detail,
      actor: audit.actor,
      actorKind: audit.actorKind,
      riskTier: audit.riskTier,
    });
  }

  for (const signal of input.signals) {
    entries.push({
      id: `signal-${signal.id}`,
      source: "signal",
      at: signal.capturedAt,
      title: signal.title,
      detail: signal.detail,
      actor: signal.source,
    });
  }

  for (const event of listPortalEvents({ workspaceId: input.workspaceId, limit: 200 })) {
    entries.push({
      id: `tele-${event.id}`,
      source: "telemetry",
      at: event.at,
      title: humanizeEventKind(event.kind),
      detail: `${event.actor} · ${event.kind}`,
      actor: event.actor,
      actorKind: event.actorKind,
    });
  }

  for (const action of listOutboundActions(input.workspaceId)) {
    entries.push({
      id: `oa-${action.id}`,
      source: "outbound",
      at: action.proposedAt,
      title: `Outbound: ${action.title}`,
      detail: `${action.connectorId}/${action.capabilityId} · status ${action.status}`,
      actor: action.proposedBy,
      actorKind: action.proposedByKind,
      riskTier: action.riskTier,
      link: "/portal/actions",
    });
  }

  for (const install of listMarketplaceInstalls(input.workspaceId)) {
    const listing = listMarketplaceListings().find((l) => l.id === install.listingId);
    entries.push({
      id: `mkt-install-${install.id}`,
      source: "marketplace",
      at: install.installedAt,
      title: `Marketplace install: ${listing?.name ?? install.listingId}`,
      detail: `Installed by ${install.installedBy} · status ${install.status}`,
      actor: install.installedBy,
      link: "/portal/marketplace",
    });
  }

  for (const membership of listFederationMemberships(input.workspaceId)) {
    entries.push({
      id: `fed-${membership.federationId}-${membership.workspaceId}`,
      source: "federation",
      at: membership.joinedAt,
      title: `Federation membership: ${membership.federationId}`,
      detail: `${membership.contributionCount} contributions · status ${membership.status}`,
      link: "/portal/federation",
    });
  }

  for (const run of listAgentRuns(50)) {
    if (run.workspaceId !== input.workspaceId) continue;
    entries.push({
      id: `agent-run-${run.id}`,
      source: "agent-run",
      at: run.finishedAt,
      title: `Agent run: ${run.agentId}`,
      detail: `${run.model} · ${run.status} · $${run.cost.totalUsd.toFixed(4)}`,
      actor: run.agentId,
      actorKind: "agent",
      link: "/portal/governance",
    });
  }

  let filtered = entries;
  if (options.since) {
    const since = options.since.getTime();
    filtered = filtered.filter((e) => e.at.getTime() >= since);
  }
  filtered.sort((a, b) => b.at.getTime() - a.at.getTime());
  if (options.limit) filtered = filtered.slice(0, options.limit);
  return filtered;
}

function humanizeAction(action: string): string {
  return action
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function humanizeEventKind(kind: string): string {
  return kind
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
