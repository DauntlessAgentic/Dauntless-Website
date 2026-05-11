// ============================================================
// Dauntless Agentic — Client Intelligence Portal
// Domain types (target architecture v1.0)
//
// See docs/client-portal-target-architecture.md for the
// authoritative model and naming. This file is the binding
// type surface that mock data, UI, and (eventually) Supabase
// repositories will share.
// ============================================================

import type { AgentState } from "@/lib/types";

// ── Identity, workspace, membership ─────────────────────────────────

export type WorkspaceVisibility = "private" | "partner" | "public";
export type TrustTier = "standard" | "elevated" | "restricted";

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  sector: string;
  region: string;
  trustTier: TrustTier;
}

export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  visibility: WorkspaceVisibility;
  trustBadge: string;
  primaryContact: string;
  lastUpdated: Date;
}

export type MembershipRole =
  | "owner"
  | "executive"
  | "lead"
  | "viewer"
  | "auditor";

export interface Membership {
  userId: string;
  userName: string;
  role: MembershipRole;
  workspaceId: string;
  joinedAt: Date;
}

// ── Engagements ─────────────────────────────────────────────────────

export type EngagementKind =
  | "discovery"
  | "design"
  | "build"
  | "activate"
  | "advisory";

export type EngagementPhase =
  | "discovery"
  | "design"
  | "deliver"
  | "activate"
  | "compound";

export type EngagementStatus =
  | "active"
  | "review"
  | "blocked"
  | "complete"
  | "paused";

export interface Engagement {
  id: string;
  workspaceId: string;
  name: string;
  kind: EngagementKind;
  phase: EngagementPhase;
  status: EngagementStatus;
  service: "consulting" | "training" | "agentic";
  startedAt: Date;
  targetCloseAt: Date;
  progress: number; // 0-100
  successCriteria: string[];
  risks: string[];
  ownerName: string;
}

// ── Artifacts (living deliverables) ────────────────────────────────

export type ArtifactType =
  | "roadmap"
  | "framework"
  | "blueprint"
  | "curriculum"
  | "briefing"
  | "decision-architecture"
  | "knowledge-map"
  | "activation-plan"
  | "risk-register"
  | "impact-report";

export type ReviewState =
  | "draft"
  | "in-review"
  | "approved"
  | "needs-revision"
  | "superseded";

export interface ArtifactVersion {
  id: string;
  artifactId: string;
  version: string; // semver-ish ("0.3.1", "1.0.0")
  summary: string;
  changedBy: string;
  changedAt: Date;
  /**
   * Markdown body captured at the time the version was minted. Older
   * versions persist their body even after a newer version supersedes them
   * — this is how the diff view works.
   *
   * Optional for backwards compatibility with seed data that pre-dates
   * Phase 4.1. The mock-data backfill assigns each version a body.
   */
  body?: string;
}

export interface ArtifactComment {
  id: string;
  artifactId: string;
  /** Tied to a specific version; comments on "the artifact" are tied to the current version. */
  versionId: string;
  author: string;
  authorKind: "human" | "agent";
  body: string;
  postedAt: Date;
  resolved: boolean;
}

export interface Artifact {
  id: string;
  engagementId: string;
  name: string;
  type: ArtifactType;
  description: string;
  /**
   * Authored Markdown body for the current version. The body field on
   * ArtifactVersion is the per-version snapshot; this field is a fast
   * lookup for the current state. Phase 4.1 introduces this.
   */
  body?: string;
  ownerName: string;
  reviewState: ReviewState;
  currentVersionId: string;
  versions: ArtifactVersion[];
  linkedDecisionIds: string[];
  linkedEvidenceIds: string[];
  lastReviewedAt: Date;
  canonical: boolean;
  /**
   * State of the canonical-promotion workflow. Independent of the
   * artifact's review state — a `pending-review` artifact can also
   * have an in-flight canonical proposal.
   */
  canonicalProposal?: {
    status: "pending" | "approved" | "rejected" | "needs-revision";
    proposedBy: string;
    proposedAt: Date;
    auditVerdict?: "pass" | "needs-revision" | "fail";
    auditNotes?: string;
    auditedAt?: Date;
    decidedBy?: string;
    decidedAt?: Date;
  };
  comments?: ArtifactComment[];
}

// ── Decisions & recommendations ─────────────────────────────────────

export type DecisionStatus =
  | "pending-approval"
  | "approved"
  | "deferred"
  | "rejected"
  | "superseded";

export type RiskTier = "low" | "medium" | "high";

export interface RecommendationOption {
  label: string;
  description: string;
  isDefault?: boolean;
}

export interface Recommendation {
  summary: string;
  rationale: string;
  options: RecommendationOption[];
  defaultChoice: string;
  confidence: number; // 0-1
}

export interface Decision {
  id: string;
  engagementId: string;
  title: string;
  status: DecisionStatus;
  riskTier: RiskTier;
  dueAt?: Date;
  decidedAt?: Date;
  decidedBy?: string;
  recommendation: Recommendation;
  evidenceIds: string[];
  artifactIds: string[];
  proposedBy: string; // agentId or human name
}

// ── Tasks / milestones ──────────────────────────────────────────────

export type TaskStatus = "todo" | "in-progress" | "blocked" | "complete";

export interface Task {
  id: string;
  engagementId: string;
  title: string;
  status: TaskStatus;
  phase: EngagementPhase;
  ownerName: string;
  progress: number;
  dueAt?: Date;
  isMilestone: boolean;
  blockedReason?: string;
}

// ── Signals (the "what changed" feed) ───────────────────────────────

export type SignalKind =
  | "artifact-updated"
  | "decision-proposed"
  | "decision-decided"
  | "milestone-hit"
  | "risk-raised"
  | "agent-action"
  | "knowledge-promoted"
  | "metric-shift";

export type SignalSeverity = "info" | "notable" | "important" | "urgent";

export interface Signal {
  id: string;
  workspaceId: string;
  engagementId?: string;
  kind: SignalKind;
  severity: SignalSeverity;
  title: string;
  detail: string;
  source: string;
  refId?: string; // points to an artifact / decision / metric / agent
  capturedAt: Date;
}

// ── Agents ──────────────────────────────────────────────────────────

export type AgentArchetype =
  | "strategist"
  | "operator"
  | "auditor"
  | "chief-of-staff";

export interface Agent {
  id: string;
  name: string;
  archetype: AgentArchetype;
  role: string; // short description, e.g. "Engagement Analyst"
  state: AgentState;
  model: string;
  scope: string[]; // engagement ids it covers (empty = workspace-wide)
  tools: string[];
  decisionsTouched: number;
  conversationsLast7d: number;
  lastActiveAt: Date;
  exampleQuestions: string[];
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  agentId?: string;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  agentId: string;
  workspaceId: string;
  title: string;
  messages: ConversationMessage[];
  lastTurnAt: Date;
}

// ── Knowledge ───────────────────────────────────────────────────────

export type KnowledgeShelf = "desk" | "bookshelf" | "cabinet";
export type MemoryTier = "M0" | "M1" | "M2" | "M3" | "M4";
export type FreshnessState = "fresh" | "aging" | "stale";

export interface KnowledgeItem {
  id: string;
  workspaceId: string;
  title: string;
  shelf: KnowledgeShelf;
  memoryTier: MemoryTier;
  confidence: number; // 0-1
  freshness: FreshnessState;
  source: string;
  sourceKind: "artifact" | "decision" | "conversation" | "external" | "playbook";
  canonical: boolean;
  promotedAt?: Date;
  lastValidatedAt: Date;
  summary: string;
}

// ── Metrics / outcomes ──────────────────────────────────────────────

export type MetricUnit = "percent" | "days" | "score" | "count" | "ratio";

export interface MetricSeriesPoint {
  period: string; // "2025-Q4", "Wk 12", etc.
  value: number;
}

export interface Metric {
  id: string;
  workspaceId: string;
  key: string;
  label: string;
  unit: MetricUnit;
  current: number;
  baseline: number;
  target: number;
  trend: "up" | "down" | "flat";
  trendValue: string;
  series: MetricSeriesPoint[];
  narrative: string;
}

// ── Evidence ────────────────────────────────────────────────────────

export type EvidenceKind =
  | "artifact"
  | "metric"
  | "signal"
  | "source"
  | "workflow-log";

export interface Evidence {
  id: string;
  workspaceId: string;
  kind: EvidenceKind;
  refId: string;
  title: string;
  snippet: string;
  source: string;
  capturedAt: Date;
}

// ── Next-best-action (Command Center surface) ───────────────────────

export interface NextBestAction {
  id: string;
  label: string;
  rationale: string;
  engagementId?: string;
  estimatedEffort: "minutes" | "hours" | "days";
  priority: "primary" | "secondary";
}

// ── Audit / governance ──────────────────────────────────────────────

export type AuditAction =
  | "decision-approved"
  | "decision-rejected"
  | "decision-deferred"
  | "artifact-published"
  | "artifact-superseded"
  | "agent-run"
  | "access-granted"
  | "access-revoked"
  | "evidence-exported";

export interface AuditEntry {
  id: string;
  workspaceId: string;
  action: AuditAction;
  actor: string;
  actorKind: "human" | "agent";
  refId?: string;
  detail: string;
  riskTier: RiskTier;
  at: Date;
}

// ── Portal index — the shape returned by repositories ────────────────

export interface PortalSnapshot {
  organization: Organization;
  workspace: Workspace;
  memberships: Membership[];
  engagements: Engagement[];
  artifacts: Artifact[];
  decisions: Decision[];
  tasks: Task[];
  signals: Signal[];
  agents: Agent[];
  conversations: Conversation[];
  knowledge: KnowledgeItem[];
  metrics: Metric[];
  evidence: Evidence[];
  nextBestActions: NextBestAction[];
  auditLog: AuditEntry[];
}
