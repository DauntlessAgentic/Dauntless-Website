// ============================================================
// Dauntless Agentic — Client Intelligence Portal
// Repository contract (Phase 2)
//
// The repository layer is the seam between the portal UI and the
// data backend. UI imports never reach into mock-data directly
// once Phase 2 has landed — server components await a repository,
// pass the resulting snapshot down to client components.
//
// We ship two implementations:
//   - InMemoryPortalRepository      (default; wraps lib/portal/mock-data)
//   - SupabasePortalRepository      (activated when SUPABASE_URL is set;
//                                    Phase 2 ships the interface, not the
//                                    full implementation — see README)
//
// Both return identical typed shapes. The UI cannot tell the
// difference.
// ============================================================

import type {
  Agent,
  Artifact,
  AuditEntry,
  Conversation,
  Decision,
  Engagement,
  Evidence,
  KnowledgeItem,
  Membership,
  Metric,
  NextBestAction,
  Organization,
  PortalSnapshot,
  Signal,
  Task,
  Workspace,
} from "@/lib/portal/types";

/**
 * The minimum operation surface a portal repository must implement.
 *
 * Keep this small. Every method here becomes a row in the audit log
 * eventually; adding a new one is a deliberate decision.
 */
export interface PortalRepository {
  /** Identifier for telemetry / governance surface. */
  readonly id: string;
  /** Human-readable label for the activation-status banner. */
  readonly label: string;
  /** Whether this repository is the in-memory fallback or a real persistence layer. */
  readonly kind: "in-memory" | "supabase" | "postgres";

  // ── Read paths ────────────────────────────────────────────────

  /**
   * Returns the complete workspace snapshot — the shape every dashboard
   * page consumes. Implementations may compose this from per-entity
   * queries.
   */
  getSnapshot(workspaceId: string): Promise<PortalSnapshot>;

  /** Currently the portal is single-workspace; this returns it. */
  getDefaultWorkspace(): Promise<Workspace>;

  getOrganization(orgId: string): Promise<Organization | null>;
  listMemberships(workspaceId: string): Promise<Membership[]>;
  listEngagements(workspaceId: string): Promise<Engagement[]>;
  listArtifacts(workspaceId: string): Promise<Artifact[]>;
  listDecisions(workspaceId: string): Promise<Decision[]>;
  listTasks(workspaceId: string): Promise<Task[]>;
  listSignals(workspaceId: string): Promise<Signal[]>;
  listAgents(workspaceId: string): Promise<Agent[]>;
  listConversations(workspaceId: string): Promise<Conversation[]>;
  listKnowledge(workspaceId: string): Promise<KnowledgeItem[]>;
  listMetrics(workspaceId: string): Promise<Metric[]>;
  listEvidence(workspaceId: string): Promise<Evidence[]>;
  listNextBestActions(workspaceId: string): Promise<NextBestAction[]>;
  listAuditLog(workspaceId: string, limit?: number): Promise<AuditEntry[]>;

  // ── Write paths ───────────────────────────────────────────────
  //
  // Every mutation is audited. Implementations append to the audit
  // log inside the same transaction (or atomically — the in-memory
  // adapter handles this by sequencing the two calls).

  /** Append an entry to the workspace audit log. Returns the persisted row. */
  appendAuditEntry(entry: Omit<AuditEntry, "id" | "at"> & { at?: Date }): Promise<AuditEntry>;

  /**
   * Transition a decision through propose → approve / defer / reject.
   * Returns the updated decision. Implementations MUST emit a matching
   * audit-log entry as part of this call.
   */
  recordDecisionOutcome(input: DecisionOutcomeInput): Promise<Decision>;

  /**
   * Land a new Decision in `pending-approval` state. Used by the agent
   * runtime when the Engagement Analyst's `propose_decision` tool fires.
   * Implementations MUST emit an `agent-run` audit entry and a
   * `decision-proposed` signal.
   */
  proposeDecision(input: ProposeDecisionRepoInput): Promise<Decision>;

  /**
   * Promote a knowledge item to canonical (Bookshelf, M3+). Implementations
   * MUST emit a matching `knowledge-promoted` signal and audit entry.
   */
  promoteKnowledgeToCanonical(input: KnowledgePromotionInput): Promise<KnowledgeItem>;
}

export interface DecisionOutcomeInput {
  decisionId: string;
  workspaceId: string;
  actor: string;
  actorKind: "human" | "agent";
  outcome: "approved" | "deferred" | "rejected";
  notes?: string;
}

export interface KnowledgePromotionInput {
  knowledgeId: string;
  workspaceId: string;
  actor: string;
  actorKind: "human" | "agent";
  promotionNotes?: string;
}

export interface ProposeDecisionRepoInput {
  engagementId: string;
  workspaceId: string;
  title: string;
  riskTier: import("@/lib/portal/types").RiskTier;
  /** Agent id or human name; persisted into Decision.proposedBy. */
  proposedBy: string;
  /** Human-readable name for the audit-log row. */
  actorDisplayName: string;
  actorKind: "human" | "agent";
  recommendation: import("@/lib/portal/types").Recommendation;
  artifactIds: string[];
  evidenceIds: string[];
}

/**
 * Activation status — surfaced in /portal/governance so that operators can
 * see exactly which backend is wired.
 */
export interface RepositoryActivationStatus {
  repositoryId: string;
  repositoryKind: PortalRepository["kind"];
  isHosted: boolean;
  isWritable: boolean;
  configGaps: string[];
  notes: string;
}
