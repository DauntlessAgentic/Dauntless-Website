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

  /**
   * Land a new ArtifactVersion in the artifact's version stack and shift
   * the artifact's reviewState to `in-review`. Used by Operator-archetype
   * agents (Report Builder, Artifact Drafter) and by the Phase 4.1
   * artifact editor.
   *
   * Implementations MUST emit an audit-log entry and a signal.
   */
  draftArtifactVersion(input: DraftArtifactVersionInput): Promise<import("@/lib/portal/types").ArtifactVersion>;

  /**
   * Hand the artifact off to an Auditor. Emits an `artifact-published`-shaped
   * audit entry with action `agent-run` and a `risk-raised` signal.
   */
  requestArtifactReview(input: RequestReviewRepoInput): Promise<void>;

  /**
   * Surface a revision request against an artifact or decision. Emits a
   * `risk-raised` signal and an audit-log entry.
   */
  proposeRevision(input: ProposeRevisionRepoInput): Promise<void>;

  /**
   * Inter-agent handoff entry. Emits an audit-log row and a signal.
   * Used when one archetype completes its work and routes to another.
   */
  recordAgentHandoff(input: AgentHandoffInput): Promise<void>;

  /**
   * Save the working body of an artifact. Phase 4.1's editor calls this
   * on every save. Doesn't mint a new version — that's `draftArtifactVersion`.
   * Implementations MUST emit an audit-log entry but should NOT spam the
   * signals feed for every keystroke; emit a signal only when the
   * artifact's reviewState changes.
   */
  saveArtifactBody(input: SaveArtifactBodyInput): Promise<void>;

  /**
   * Submit the artifact for canonical promotion. Sets
   * `artifact.canonicalProposal.status = "pending"` and emits an audit
   * entry + signal. The Governance Auditor agent picks up from here.
   */
  proposeArtifactForCanonical(input: ProposeForCanonicalInput): Promise<void>;

  /**
   * Record the Governance Auditor's verdict on a canonical proposal.
   * Doesn't approve the artifact — that's an executive's call.
   */
  recordCanonicalAuditVerdict(input: RecordCanonicalAuditInput): Promise<void>;

  /**
   * Approve a canonical proposal. Sets `artifact.canonical = true`,
   * updates `canonicalProposal.status`, and emits a knowledge-promoted
   * signal (the artifact joins the Bookshelf).
   */
  approveCanonicalProposal(input: DecideCanonicalInput): Promise<void>;

  /**
   * Reject or send back for revision.
   */
  rejectCanonicalProposal(input: DecideCanonicalInput & { reason?: string }): Promise<void>;

  /**
   * Post a comment thread entry against an artifact version. Emits an
   * audit entry but no signal (comments are routine traffic).
   */
  postArtifactComment(input: PostArtifactCommentInput): Promise<import("@/lib/portal/types").ArtifactComment>;

  /**
   * Mark a comment as resolved.
   */
  resolveArtifactComment(input: ResolveArtifactCommentInput): Promise<void>;
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

export interface DraftArtifactVersionInput {
  workspaceId: string;
  artifactId: string;
  versionBump: "major" | "minor" | "patch";
  summary: string;
  body: string;
  actor: string;
  actorKind: "human" | "agent";
}

export interface RequestReviewRepoInput {
  workspaceId: string;
  artifactId: string;
  actor: string;
  actorKind: "human" | "agent";
  notes?: string;
  /** Optional target archetype the handoff should land at. */
  targetArchetype?: import("@/lib/portal/types").AgentArchetype;
}

export interface ProposeRevisionRepoInput {
  workspaceId: string;
  targetKind: "artifact" | "decision";
  targetId: string;
  requestedChange: string;
  severity: "low" | "medium" | "high";
  actor: string;
  actorKind: "human" | "agent";
}

export interface SaveArtifactBodyInput {
  workspaceId: string;
  artifactId: string;
  body: string;
  actor: string;
  actorKind: "human" | "agent";
  /** If true and the artifact was `approved`, drops it back to `in-review`. */
  reopenForReview?: boolean;
}

export interface ProposeForCanonicalInput {
  workspaceId: string;
  artifactId: string;
  proposedBy: string;
  proposedByKind: "human" | "agent";
}

export interface RecordCanonicalAuditInput {
  workspaceId: string;
  artifactId: string;
  verdict: "pass" | "needs-revision" | "fail";
  notes: string;
  auditedBy: string;
}

export interface DecideCanonicalInput {
  workspaceId: string;
  artifactId: string;
  actor: string;
  actorKind: "human" | "agent";
}

export interface PostArtifactCommentInput {
  workspaceId: string;
  artifactId: string;
  versionId: string;
  body: string;
  author: string;
  authorKind: "human" | "agent";
}

export interface ResolveArtifactCommentInput {
  workspaceId: string;
  artifactId: string;
  commentId: string;
  actor: string;
}

export interface AgentHandoffInput {
  workspaceId: string;
  fromAgentId: string;
  toArchetype: import("@/lib/portal/types").AgentArchetype;
  reason: string;
  refKind?: "artifact" | "decision" | "knowledge";
  refId?: string;
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
