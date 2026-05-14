// ============================================================
// Outbound-action workspace freeze switch (Advisory action #16)
//
// A per-workspace kill switch. When a workspace is frozen, every
// commitOutboundAction() call refuses with a clear error. The
// switch is held in memory (resets on server restart) — Phase 7.2
// will persist it. The point is to give a non-technical user a
// single "stop all outbound actions in this workspace" button.
//
// Three operations:
//   freezeWorkspace(workspaceId, actor, reason)
//   unfreezeWorkspace(workspaceId, actor)
//   isWorkspaceFrozen(workspaceId)
//
// All transitions are audit-logged with risk tier "high".
// ============================================================

import { getPortalRepository } from "@/lib/portal/repositories";

interface FreezeRecord {
  workspaceId: string;
  frozenAt: Date;
  frozenBy: string;
  reason: string;
}

const frozen = new Map<string, FreezeRecord>();

export function isWorkspaceFrozen(workspaceId: string): FreezeRecord | null {
  return frozen.get(workspaceId) ?? null;
}

export async function freezeWorkspace(input: {
  workspaceId: string;
  actor: string;
  reason: string;
}): Promise<FreezeRecord> {
  const record: FreezeRecord = {
    workspaceId: input.workspaceId,
    frozenAt: new Date(),
    frozenBy: input.actor,
    reason: input.reason,
  };
  frozen.set(input.workspaceId, record);
  const repo = getPortalRepository();
  await repo.appendAuditEntry({
    workspaceId: input.workspaceId,
    action: "agent-run",
    actor: input.actor,
    actorKind: "human",
    detail: `${input.actor} froze outbound actions for this workspace. Reason: ${input.reason}`,
    riskTier: "high",
  });
  return record;
}

export async function unfreezeWorkspace(input: {
  workspaceId: string;
  actor: string;
}): Promise<void> {
  const previous = frozen.get(input.workspaceId);
  frozen.delete(input.workspaceId);
  if (!previous) return;
  const repo = getPortalRepository();
  await repo.appendAuditEntry({
    workspaceId: input.workspaceId,
    action: "agent-run",
    actor: input.actor,
    actorKind: "human",
    detail: `${input.actor} un-froze outbound actions for this workspace. Previously frozen by ${previous.frozenBy}: "${previous.reason}".`,
    riskTier: "high",
  });
}

/** Test-only escape hatch. */
export function __resetWorkspaceFreezes(): void {
  frozen.clear();
}
