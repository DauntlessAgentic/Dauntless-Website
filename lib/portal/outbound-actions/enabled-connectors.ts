// ============================================================
// Per-workspace connector enablement (Advisory action #19)
//
// Connectors are gated by explicit workspace approval. The default
// catalog ships *defined* — but until an owner enables a connector
// for their workspace, propose/commit calls referencing it refuse.
//
// Workspaces start with `internal` enabled by default (it is the
// in-portal signal poster and has no external blast radius). All
// other connectors require a deliberate enable action, audit-logged.
//
// Phase 7.2: persist into an `enabled_connectors` table. Today: an
// in-process map.
// ============================================================

import { getPortalRepository } from "@/lib/portal/repositories";

const DEFAULT_ENABLED = new Set(["internal"]);

const enabledByWorkspace = new Map<string, Set<string>>();

function ensure(workspaceId: string): Set<string> {
  let set = enabledByWorkspace.get(workspaceId);
  if (!set) {
    set = new Set(DEFAULT_ENABLED);
    enabledByWorkspace.set(workspaceId, set);
  }
  return set;
}

export function isConnectorEnabled(workspaceId: string, connectorId: string): boolean {
  return ensure(workspaceId).has(connectorId);
}

export function listEnabledConnectors(workspaceId: string): string[] {
  return Array.from(ensure(workspaceId)).sort();
}

export async function enableConnector(input: {
  workspaceId: string;
  connectorId: string;
  actor: string;
}): Promise<void> {
  const set = ensure(input.workspaceId);
  if (set.has(input.connectorId)) return;
  set.add(input.connectorId);
  const repo = getPortalRepository();
  await repo.appendAuditEntry({
    workspaceId: input.workspaceId,
    action: "agent-run",
    actor: input.actor,
    actorKind: "human",
    detail: `${input.actor} enabled the "${input.connectorId}" connector for this workspace.`,
    riskTier: "medium",
  });
}

export async function disableConnector(input: {
  workspaceId: string;
  connectorId: string;
  actor: string;
}): Promise<void> {
  const set = ensure(input.workspaceId);
  if (!set.has(input.connectorId)) return;
  set.delete(input.connectorId);
  const repo = getPortalRepository();
  await repo.appendAuditEntry({
    workspaceId: input.workspaceId,
    action: "agent-run",
    actor: input.actor,
    actorKind: "human",
    detail: `${input.actor} disabled the "${input.connectorId}" connector for this workspace.`,
    riskTier: "medium",
  });
}

/** Test-only escape hatch. */
export function __resetEnabledConnectors(): void {
  enabledByWorkspace.clear();
}
