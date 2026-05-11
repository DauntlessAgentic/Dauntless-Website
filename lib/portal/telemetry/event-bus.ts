// ============================================================
// Portal telemetry event bus (Phase 6)
//
// Single in-process bus that every mutation through the
// PortalRepository emits to. Phase 6.0 keeps the bus in-memory;
// Phase 6.1 will persist into a `metrics` table and a
// `portal_events` table so the Quarterly Impact Report becomes
// a true cross-session artifact.
//
// Event shapes are stable — adding a new event kind requires:
//   1. Append to PortalEventKind below.
//   2. Add the typed payload to PortalEventPayload.
//   3. Call `emitPortalEvent()` from the repository write path.
//   4. Update the metric reducers in `metrics.ts`.
// ============================================================

// Server-only by convention.

import type {
  AgentArchetype,
  AuditAction,
  RiskTier,
  SignalSeverity,
} from "@/lib/portal/types";

export type PortalEventKind =
  | "artifact-saved"
  | "artifact-version-minted"
  | "artifact-promoted-canonical"
  | "canonical-proposal-submitted"
  | "canonical-audit-verdict"
  | "decision-proposed"
  | "decision-outcome-recorded"
  | "knowledge-promoted"
  | "agent-run-completed"
  | "agent-handoff"
  | "comment-posted";

export interface PortalEventBase {
  id: string;
  kind: PortalEventKind;
  at: Date;
  workspaceId: string;
  engagementId?: string;
  actor: string;
  actorKind: "human" | "agent";
}

export interface ArtifactSavedEvent extends PortalEventBase {
  kind: "artifact-saved";
  artifactId: string;
  reopenedForReview: boolean;
}
export interface ArtifactVersionMintedEvent extends PortalEventBase {
  kind: "artifact-version-minted";
  artifactId: string;
  versionId: string;
  version: string;
  versionBump: "major" | "minor" | "patch";
}
export interface ArtifactPromotedEvent extends PortalEventBase {
  kind: "artifact-promoted-canonical";
  artifactId: string;
}
export interface CanonicalProposalSubmittedEvent extends PortalEventBase {
  kind: "canonical-proposal-submitted";
  artifactId: string;
}
export interface CanonicalAuditVerdictEvent extends PortalEventBase {
  kind: "canonical-audit-verdict";
  artifactId: string;
  verdict: "pass" | "needs-revision" | "fail";
}
export interface DecisionProposedEvent extends PortalEventBase {
  kind: "decision-proposed";
  decisionId: string;
  riskTier: RiskTier;
  proposerId: string;
}
export interface DecisionOutcomeRecordedEvent extends PortalEventBase {
  kind: "decision-outcome-recorded";
  decisionId: string;
  outcome: "approved" | "deferred" | "rejected";
  /** ms between propose → decided. Negative if propose-time is unavailable. */
  decisionCycleMs?: number;
  riskTier: RiskTier;
}
export interface KnowledgePromotedEvent extends PortalEventBase {
  kind: "knowledge-promoted";
  knowledgeId: string;
}
export interface AgentRunCompletedEvent extends PortalEventBase {
  kind: "agent-run-completed";
  agentId: string;
  archetype: AgentArchetype;
  status: "completed" | "errored" | "stub";
  totalUsd: number;
  inputTokens: number;
  outputTokens: number;
  cacheHitRate: number;
  proposedDecisionId?: string;
}
export interface AgentHandoffEvent extends PortalEventBase {
  kind: "agent-handoff";
  fromAgentId: string;
  toArchetype: AgentArchetype;
}
export interface CommentPostedEvent extends PortalEventBase {
  kind: "comment-posted";
  artifactId: string;
  resolved: boolean;
}

export type PortalEvent =
  | ArtifactSavedEvent
  | ArtifactVersionMintedEvent
  | ArtifactPromotedEvent
  | CanonicalProposalSubmittedEvent
  | CanonicalAuditVerdictEvent
  | DecisionProposedEvent
  | DecisionOutcomeRecordedEvent
  | KnowledgePromotedEvent
  | AgentRunCompletedEvent
  | AgentHandoffEvent
  | CommentPostedEvent;

// ── In-memory bus ────────────────────────────────────────────

const events: PortalEvent[] = [];
const subscribers = new Set<(event: PortalEvent) => void>();
const MAX_EVENTS = 5_000;

let eventCounter = 0;
function nextEventId(): string {
  eventCounter += 1;
  return `evt-${Date.now().toString(36)}-${eventCounter.toString(36)}`;
}

// Discriminated-union friendly: distribute Omit over each variant so the
// caller's `kind` literal narrows the rest of the required fields.
type EmitPayload =
  | Omit<ArtifactSavedEvent, "id" | "at">
  | Omit<ArtifactVersionMintedEvent, "id" | "at">
  | Omit<ArtifactPromotedEvent, "id" | "at">
  | Omit<CanonicalProposalSubmittedEvent, "id" | "at">
  | Omit<CanonicalAuditVerdictEvent, "id" | "at">
  | Omit<DecisionProposedEvent, "id" | "at">
  | Omit<DecisionOutcomeRecordedEvent, "id" | "at">
  | Omit<KnowledgePromotedEvent, "id" | "at">
  | Omit<AgentRunCompletedEvent, "id" | "at">
  | Omit<AgentHandoffEvent, "id" | "at">
  | Omit<CommentPostedEvent, "id" | "at">;

export function emitPortalEvent(event: EmitPayload & { at?: Date }): PortalEvent {
  const enriched = {
    ...event,
    id: nextEventId(),
    at: event.at ?? new Date(),
  } as PortalEvent;
  events.push(enriched);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  for (const sub of subscribers) {
    try { sub(enriched); } catch { /* subscribers must not crash the bus */ }
  }
  return enriched;
}

export function subscribePortalEvents(handler: (event: PortalEvent) => void): () => void {
  subscribers.add(handler);
  return () => subscribers.delete(handler);
}

export function listPortalEvents(filter?: { kinds?: PortalEventKind[]; workspaceId?: string; since?: Date; limit?: number }): PortalEvent[] {
  let rows: PortalEvent[] = events.slice();
  if (filter?.kinds && filter.kinds.length > 0) {
    const allowed = new Set(filter.kinds);
    rows = rows.filter((e) => allowed.has(e.kind));
  }
  if (filter?.workspaceId) rows = rows.filter((e) => e.workspaceId === filter.workspaceId);
  if (filter?.since) {
    const since = filter.since.getTime();
    rows = rows.filter((e) => e.at.getTime() >= since);
  }
  rows.sort((a, b) => b.at.getTime() - a.at.getTime());
  if (filter?.limit) rows = rows.slice(0, filter.limit);
  return rows;
}

/** Test-only escape hatch — clears the in-memory bus. */
export function __resetPortalEvents(): void {
  events.length = 0;
  eventCounter = 0;
  subscribers.clear();
}

// Re-export for downstream consumers (typed-only re-exports keep the
// public surface tight).
export type { AuditAction, SignalSeverity };
