// ============================================================
// Outbound actions (Phase 11.0)
//
// Outbound actions are the "agents step out of the cockpit"
// surface. Every outbound action travels the same governance
// contract as a Decision: propose → audit → approve → commit →
// (optionally) rollback. The repository tracks the lifecycle;
// each connector declares its scope + tool surface.
// ============================================================

export type ConnectorId =
  | "hubspot"
  | "salesforce"
  | "jira"
  | "servicenow"
  | "ms-graph"
  | "google-workspace"
  | "internal";

export type OutboundActionStatus =
  | "proposed"
  | "audited"
  | "approved"
  | "dry-run"
  | "committed"
  | "failed"
  | "rolled-back";

export type OutboundActionRiskTier = "low" | "medium" | "high";

export interface ConnectorCapability {
  id: string;
  label: string;
  description: string;
  /** What this capability touches in the client system. */
  scope: string;
  /** Risk tier this capability inherits when no override is set. */
  defaultRiskTier: OutboundActionRiskTier;
  /** Is dry-run supported on this capability? Most are; some (deletes) are not. */
  supportsDryRun: boolean;
  /** Does committing this capability emit a corresponding inverse action? */
  reversible: boolean;
}

export interface ConnectorDefinition {
  id: ConnectorId;
  label: string;
  category: "crm" | "ticketing" | "calendar" | "directory" | "internal";
  capabilities: ConnectorCapability[];
  /** Whether the connector is wired to a live integration in this workspace. */
  connected: boolean;
}

export interface OutboundActionAuditVerdict {
  status: "pass" | "needs-revision" | "fail";
  notes: string;
}

export interface OutboundActionInverseStep {
  label: string;
  /** Repository call or capability id that would undo the action. */
  capability: string;
  /** Notes for the human reading the rollback plan. */
  notes: string;
}

export interface OutboundAction {
  id: string;
  workspaceId: string;
  engagementId?: string;
  connectorId: ConnectorId;
  capabilityId: string;
  title: string;
  description: string;
  riskTier: OutboundActionRiskTier;
  status: OutboundActionStatus;
  proposedBy: string;
  proposedByKind: "human" | "agent";
  proposedAt: Date;
  /** Diff that running the action would produce, in human-readable JSON. */
  proposedPayload: Record<string, unknown>;
  /** Optional dry-run output — populated after a dry-run pass. */
  dryRunOutput?: Record<string, unknown>;
  auditVerdict?: OutboundActionAuditVerdict;
  approvedBy?: string;
  approvedAt?: Date;
  committedAt?: Date;
  committedBy?: string;
  failedAt?: Date;
  failureReason?: string;
  rolledBackAt?: Date;
  rolledBackBy?: string;
  /** Inverse-action plan generated alongside the proposal. */
  inversePlan: OutboundActionInverseStep[];
}

export interface ProposeOutboundActionInput {
  workspaceId: string;
  engagementId?: string;
  connectorId: ConnectorId;
  capabilityId: string;
  title: string;
  description: string;
  riskTier?: OutboundActionRiskTier;
  proposedBy: string;
  proposedByKind: "human" | "agent";
  payload: Record<string, unknown>;
}

export interface ApproveOutboundActionInput {
  workspaceId: string;
  actionId: string;
  actor: string;
  actorKind: "human" | "agent";
}

export interface CommitOutboundActionInput extends ApproveOutboundActionInput {
  /** If true, run a dry-run and stop. Default: false (commit live). */
  dryRunOnly?: boolean;
}

export interface RollbackOutboundActionInput {
  workspaceId: string;
  actionId: string;
  actor: string;
  reason?: string;
}
