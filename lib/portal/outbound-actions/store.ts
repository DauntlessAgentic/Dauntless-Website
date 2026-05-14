// ============================================================
// Outbound action store (Phase 11.0)
//
// In-process store. Phase 11.1 will persist into the repository
// once the `outbound_actions` table lands. Today: the store is
// per-server-process and resets on restart, which is the same
// shape as Phase 5's telemetry ledger.
// ============================================================

import { getPortalRepository } from "@/lib/portal/repositories";
import { emitWebhook } from "@/lib/portal/webhooks";

import { findCapability } from "./connectors";
import { isConnectorEnabled } from "./enabled-connectors";
import { isWorkspaceFrozen } from "./freeze";
import { validateOutboundPayload } from "./schemas";
import type {
  ApproveOutboundActionInput,
  CommitOutboundActionInput,
  OutboundAction,
  OutboundActionInverseStep,
  ProposeOutboundActionInput,
  RollbackOutboundActionInput,
} from "./types";

const actions: OutboundAction[] = [];
let counter = 0;

function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

export function listOutboundActions(workspaceId: string): OutboundAction[] {
  return actions
    .filter((a) => a.workspaceId === workspaceId)
    .slice()
    .sort((a, b) => b.proposedAt.getTime() - a.proposedAt.getTime());
}

export function getOutboundAction(id: string): OutboundAction | null {
  return actions.find((a) => a.id === id) ?? null;
}

export async function proposeOutboundAction(input: ProposeOutboundActionInput): Promise<OutboundAction> {
  const capability = findCapability(input.connectorId, input.capabilityId);
  if (!capability) {
    throw new Error(`Unknown capability: ${input.connectorId}/${input.capabilityId}`);
  }
  // Advisory-board action #19: per-workspace connector approval. Until
  // a workspace owner explicitly enables a connector, propose calls
  // referencing it are refused. Marcus's requirement.
  if (!isConnectorEnabled(input.workspaceId, input.connectorId)) {
    throw new Error(
      `Connector "${input.connectorId}" is not enabled for this workspace. A workspace owner must enable it on /portal/governance first.`,
    );
  }
  // Phase 11.1: validate payload against the per-capability schema at
  // propose-time so malformed payloads can't sit in pending-approval.
  const validation = validateOutboundPayload(input.connectorId, input.capabilityId, input.payload);
  if (!validation.ok) {
    throw new Error(`Payload validation failed: ${validation.errors?.join("; ")}`);
  }
  const repo = getPortalRepository();
  const action: OutboundAction = {
    id: generateId("oa"),
    workspaceId: input.workspaceId,
    engagementId: input.engagementId,
    connectorId: input.connectorId,
    capabilityId: input.capabilityId,
    title: input.title,
    description: input.description,
    riskTier: input.riskTier ?? capability.defaultRiskTier,
    status: "proposed",
    proposedBy: input.proposedBy,
    proposedByKind: input.proposedByKind,
    proposedAt: new Date(),
    proposedPayload: structuredClone(input.payload),
    inversePlan: capability.reversible ? generateInversePlan(input) : [],
  };
  actions.push(action);

  await repo.appendAuditEntry({
    workspaceId: input.workspaceId,
    action: "agent-run",
    actor: input.proposedBy,
    actorKind: input.proposedByKind,
    refId: action.id,
    detail: `${input.proposedBy} proposed outbound action "${action.title}" (${input.connectorId}/${input.capabilityId}).`,
    riskTier: action.riskTier,
  });
  emitWebhook({
    kind: "decision-proposed",
    workspaceId: input.workspaceId,
    payload: { outboundActionId: action.id, capability: `${input.connectorId}/${input.capabilityId}` },
  });
  return structuredClone(action);
}

export async function approveOutboundAction(input: ApproveOutboundActionInput): Promise<OutboundAction> {
  const action = mustGet(input.actionId);
  if (action.status !== "proposed" && action.status !== "audited") {
    throw new Error(`Cannot approve from status ${action.status}.`);
  }
  action.status = "approved";
  action.approvedBy = input.actor;
  action.approvedAt = new Date();

  const repo = getPortalRepository();
  await repo.appendAuditEntry({
    workspaceId: input.workspaceId,
    action: "decision-approved",
    actor: input.actor,
    actorKind: input.actorKind,
    refId: action.id,
    detail: `${input.actor} approved outbound action "${action.title}".`,
    riskTier: action.riskTier,
  });
  return structuredClone(action);
}

export async function commitOutboundAction(input: CommitOutboundActionInput): Promise<OutboundAction> {
  const action = mustGet(input.actionId);
  if (action.status !== "approved" && action.status !== "dry-run") {
    throw new Error(`Cannot commit from status ${action.status}.`);
  }
  // Advisory-board action #16: workspace-level kill switch. Honoured
  // before any external work. Dry-runs are blocked too — the point of
  // the freeze is to give the workspace owner a single stop button.
  const freeze = isWorkspaceFrozen(input.workspaceId);
  if (freeze) {
    throw new Error(
      `Outbound actions are frozen for this workspace by ${freeze.frozenBy}: "${freeze.reason}". Lift the freeze on /portal/help/something-went-wrong before retrying.`,
    );
  }
  const capability = findCapability(action.connectorId, action.capabilityId);
  if (!capability) {
    throw new Error("Capability no longer registered.");
  }

  // Phase 11.0 simulates the call. Phase 11.1 wires the real HTTP.
  const result = simulateAction(action);

  if (input.dryRunOnly) {
    if (!capability.supportsDryRun) {
      throw new Error("Capability does not support dry-run.");
    }
    action.status = "dry-run";
    action.dryRunOutput = result;
    const repo = getPortalRepository();
    await repo.appendAuditEntry({
      workspaceId: input.workspaceId,
      action: "agent-run",
      actor: input.actor,
      actorKind: input.actorKind,
      refId: action.id,
      detail: `${input.actor} ran dry-run on "${action.title}".`,
      riskTier: action.riskTier,
    });
    return structuredClone(action);
  }

  action.status = "committed";
  action.committedAt = new Date();
  action.committedBy = input.actor;
  action.dryRunOutput = result;
  const repo = getPortalRepository();
  await repo.appendAuditEntry({
    workspaceId: input.workspaceId,
    action: "agent-run",
    actor: input.actor,
    actorKind: input.actorKind,
    refId: action.id,
    detail: `${input.actor} committed outbound action "${action.title}".`,
    riskTier: action.riskTier,
  });
  emitWebhook({
    kind: "decision-outcome",
    workspaceId: input.workspaceId,
    payload: { outboundActionId: action.id, status: "committed" },
  });
  return structuredClone(action);
}

export async function rollbackOutboundAction(input: RollbackOutboundActionInput): Promise<OutboundAction> {
  const action = mustGet(input.actionId);
  if (action.status !== "committed") {
    throw new Error(`Cannot rollback from status ${action.status}.`);
  }
  if (action.inversePlan.length === 0) {
    throw new Error("Action has no inverse plan; rollback is not supported.");
  }
  action.status = "rolled-back";
  action.rolledBackAt = new Date();
  action.rolledBackBy = input.actor;
  const repo = getPortalRepository();
  await repo.appendAuditEntry({
    workspaceId: input.workspaceId,
    action: "decision-rejected",
    actor: input.actor,
    actorKind: "human",
    refId: action.id,
    detail: `${input.actor} rolled back outbound action "${action.title}". ${input.reason ?? ""}`.trim(),
    riskTier: action.riskTier,
  });
  return structuredClone(action);
}

/** Test-only escape hatch. */
export function __resetOutboundActions(): void {
  actions.length = 0;
  counter = 0;
}

// ── helpers ──────────────────────────────────────────────────

function mustGet(id: string): OutboundAction {
  const action = actions.find((a) => a.id === id);
  if (!action) throw new Error(`Outbound action not found: ${id}`);
  return action;
}

function generateInversePlan(input: ProposeOutboundActionInput): OutboundActionInverseStep[] {
  return [
    {
      label: `Reverse ${input.connectorId}/${input.capabilityId}`,
      capability: `${input.connectorId}/${input.capabilityId}.inverse`,
      notes:
        "Phase 11.0 records the rollback intent; Phase 11.1 wires real inverse actions per capability.",
    },
    {
      label: "Notify the requesting member",
      capability: "internal/post-signal",
      notes: "Emit a signal so the workspace audit reflects the rollback in the activity feed.",
    },
  ];
}

function simulateAction(action: OutboundAction): Record<string, unknown> {
  return {
    connector: action.connectorId,
    capability: action.capabilityId,
    payload: action.proposedPayload,
    simulatedAt: new Date().toISOString(),
    note:
      "Phase 11.0 simulates outbound calls. Wire a connector adapter in Phase 11.1 to produce real diff output.",
  };
}
