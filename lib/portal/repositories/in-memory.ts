// ============================================================
// In-memory portal repository (Phase 2)
//
// Wraps the deterministic mock-data fixtures so the portal UI
// can run end-to-end without any external infrastructure.
//
// This is the default repository when the portal boots without
// SUPABASE_URL / PORTAL_DATABASE_URL configured.
//
// Mutations are kept in-process — restarting the dev server
// resets state. That's a feature for v1: every demo run begins
// from the same canonical seed.
// ============================================================

import {
  mockAuditLog,
  mockAgents,
  mockArtifacts,
  mockConversations,
  mockDecisions,
  mockEngagements,
  mockEvidence,
  mockKnowledge,
  mockMemberships,
  mockMetrics,
  mockNextBestActions,
  mockOrganization,
  mockSignals,
  mockTasks,
  mockWorkspace,
} from "@/lib/portal/mock-data";
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

import type {
  DecisionOutcomeInput,
  KnowledgePromotionInput,
  PortalRepository,
} from "./types";

/**
 * Mutable working snapshot. We seed from the deterministic fixtures and
 * then mutate in place as approvals / promotions land. Each new repository
 * instance starts fresh from the seed.
 */
function cloneSnapshot(): PortalSnapshot {
  return {
    organization: { ...mockOrganization },
    workspace: { ...mockWorkspace, lastUpdated: new Date(mockWorkspace.lastUpdated) },
    memberships: mockMemberships.map((m) => ({ ...m, joinedAt: new Date(m.joinedAt) })),
    engagements: mockEngagements.map((e) => ({
      ...e,
      startedAt: new Date(e.startedAt),
      targetCloseAt: new Date(e.targetCloseAt),
      successCriteria: [...e.successCriteria],
      risks: [...e.risks],
    })),
    artifacts: mockArtifacts.map((a) => ({
      ...a,
      lastReviewedAt: new Date(a.lastReviewedAt),
      versions: a.versions.map((v) => ({ ...v, changedAt: new Date(v.changedAt) })),
      linkedDecisionIds: [...a.linkedDecisionIds],
      linkedEvidenceIds: [...a.linkedEvidenceIds],
    })),
    decisions: mockDecisions.map((d) => ({
      ...d,
      dueAt: d.dueAt ? new Date(d.dueAt) : undefined,
      decidedAt: d.decidedAt ? new Date(d.decidedAt) : undefined,
      recommendation: {
        ...d.recommendation,
        options: d.recommendation.options.map((o) => ({ ...o })),
      },
      evidenceIds: [...d.evidenceIds],
      artifactIds: [...d.artifactIds],
    })),
    tasks: mockTasks.map((t) => ({
      ...t,
      dueAt: t.dueAt ? new Date(t.dueAt) : undefined,
    })),
    signals: mockSignals.map((s) => ({ ...s, capturedAt: new Date(s.capturedAt) })),
    agents: mockAgents.map((a) => ({
      ...a,
      scope: [...a.scope],
      tools: [...a.tools],
      exampleQuestions: [...a.exampleQuestions],
      lastActiveAt: new Date(a.lastActiveAt),
    })),
    conversations: mockConversations.map((c) => ({
      ...c,
      lastTurnAt: new Date(c.lastTurnAt),
      messages: c.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
    })),
    knowledge: mockKnowledge.map((k) => ({
      ...k,
      lastValidatedAt: new Date(k.lastValidatedAt),
      promotedAt: k.promotedAt ? new Date(k.promotedAt) : undefined,
    })),
    metrics: mockMetrics.map((m) => ({
      ...m,
      series: m.series.map((p) => ({ ...p })),
    })),
    evidence: mockEvidence.map((e) => ({ ...e, capturedAt: new Date(e.capturedAt) })),
    nextBestActions: mockNextBestActions.map((n) => ({ ...n })),
    auditLog: mockAuditLog.map((a) => ({ ...a, at: new Date(a.at) })),
  };
}

let mutationCounter = 0;
function generateId(prefix: string): string {
  mutationCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${mutationCounter.toString(36)}`;
}

export class InMemoryPortalRepository implements PortalRepository {
  readonly id = "in-memory";
  readonly label = "In-memory (deterministic seed)";
  readonly kind = "in-memory" as const;

  private state: PortalSnapshot;

  constructor(initial?: PortalSnapshot) {
    this.state = initial ? structuredClone(initial) : cloneSnapshot();
  }

  // ── Reads ─────────────────────────────────────────────────────

  async getSnapshot(workspaceId: string): Promise<PortalSnapshot> {
    this.assertWorkspace(workspaceId);
    return structuredClone(this.state);
  }

  async getDefaultWorkspace(): Promise<Workspace> {
    return structuredClone(this.state.workspace);
  }

  async getOrganization(orgId: string): Promise<Organization | null> {
    if (this.state.organization.id !== orgId) return null;
    return structuredClone(this.state.organization);
  }

  async listMemberships(workspaceId: string): Promise<Membership[]> {
    return this.scope(workspaceId, this.state.memberships, (m) => m.workspaceId);
  }
  async listEngagements(workspaceId: string): Promise<Engagement[]> {
    return this.scope(workspaceId, this.state.engagements, (e) => e.workspaceId);
  }
  async listArtifacts(workspaceId: string): Promise<Artifact[]> {
    const engagementIds = new Set(
      this.state.engagements.filter((e) => e.workspaceId === workspaceId).map((e) => e.id),
    );
    return structuredClone(this.state.artifacts.filter((a) => engagementIds.has(a.engagementId)));
  }
  async listDecisions(workspaceId: string): Promise<Decision[]> {
    const engagementIds = new Set(
      this.state.engagements.filter((e) => e.workspaceId === workspaceId).map((e) => e.id),
    );
    return structuredClone(this.state.decisions.filter((d) => engagementIds.has(d.engagementId)));
  }
  async listTasks(workspaceId: string): Promise<Task[]> {
    const engagementIds = new Set(
      this.state.engagements.filter((e) => e.workspaceId === workspaceId).map((e) => e.id),
    );
    return structuredClone(this.state.tasks.filter((t) => engagementIds.has(t.engagementId)));
  }
  async listSignals(workspaceId: string): Promise<Signal[]> {
    return this.scope(workspaceId, this.state.signals, (s) => s.workspaceId);
  }
  async listAgents(workspaceId: string): Promise<Agent[]> {
    this.assertWorkspace(workspaceId);
    return structuredClone(this.state.agents);
  }
  async listConversations(workspaceId: string): Promise<Conversation[]> {
    return this.scope(workspaceId, this.state.conversations, (c) => c.workspaceId);
  }
  async listKnowledge(workspaceId: string): Promise<KnowledgeItem[]> {
    return this.scope(workspaceId, this.state.knowledge, (k) => k.workspaceId);
  }
  async listMetrics(workspaceId: string): Promise<Metric[]> {
    return this.scope(workspaceId, this.state.metrics, (m) => m.workspaceId);
  }
  async listEvidence(workspaceId: string): Promise<Evidence[]> {
    return this.scope(workspaceId, this.state.evidence, (e) => e.workspaceId);
  }
  async listNextBestActions(workspaceId: string): Promise<NextBestAction[]> {
    this.assertWorkspace(workspaceId);
    return structuredClone(this.state.nextBestActions);
  }
  async listAuditLog(workspaceId: string, limit?: number): Promise<AuditEntry[]> {
    const rows = this.state.auditLog
      .filter((a) => a.workspaceId === workspaceId)
      .slice()
      .sort((a, b) => b.at.getTime() - a.at.getTime());
    const truncated = typeof limit === "number" ? rows.slice(0, limit) : rows;
    return structuredClone(truncated);
  }

  // ── Writes ────────────────────────────────────────────────────

  async appendAuditEntry(
    entry: Omit<AuditEntry, "id" | "at"> & { at?: Date },
  ): Promise<AuditEntry> {
    const persisted: AuditEntry = {
      id: generateId("au"),
      at: entry.at ?? new Date(),
      workspaceId: entry.workspaceId,
      action: entry.action,
      actor: entry.actor,
      actorKind: entry.actorKind,
      refId: entry.refId,
      detail: entry.detail,
      riskTier: entry.riskTier,
    };
    this.state.auditLog.push(persisted);
    return structuredClone(persisted);
  }

  async recordDecisionOutcome(input: DecisionOutcomeInput): Promise<Decision> {
    const target = this.state.decisions.find((d) => d.id === input.decisionId);
    if (!target) {
      throw new Error(`Decision not found: ${input.decisionId}`);
    }
    const statusMap = {
      approved: "approved",
      deferred: "deferred",
      rejected: "rejected",
    } as const;
    target.status = statusMap[input.outcome];
    target.decidedAt = new Date();
    target.decidedBy = input.actor;

    await this.appendAuditEntry({
      workspaceId: input.workspaceId,
      action:
        input.outcome === "approved"
          ? "decision-approved"
          : input.outcome === "deferred"
            ? "decision-deferred"
            : "decision-rejected",
      actor: input.actor,
      actorKind: input.actorKind,
      refId: target.id,
      detail: input.notes
        ? `${humanize(input.outcome)}: ${target.title}. ${input.notes}`
        : `${humanize(input.outcome)}: ${target.title}.`,
      riskTier: target.riskTier,
    });

    // Emit a signal so the Command Center "What changed?" feed updates.
    this.state.signals.unshift({
      id: generateId("sig"),
      workspaceId: input.workspaceId,
      engagementId: target.engagementId,
      kind: "decision-decided",
      severity: target.riskTier === "high" ? "important" : "notable",
      title: `${target.title} — ${humanize(input.outcome)}`,
      detail: input.notes ?? `Decision marked ${input.outcome} by ${input.actor}.`,
      source: input.actor,
      refId: target.id,
      capturedAt: new Date(),
    });

    return structuredClone(target);
  }

  async promoteKnowledgeToCanonical(input: KnowledgePromotionInput): Promise<KnowledgeItem> {
    const target = this.state.knowledge.find((k) => k.id === input.knowledgeId);
    if (!target) {
      throw new Error(`Knowledge item not found: ${input.knowledgeId}`);
    }
    target.canonical = true;
    target.shelf = "bookshelf";
    target.memoryTier = target.memoryTier === "M0" || target.memoryTier === "M1" ? "M3" : target.memoryTier;
    target.promotedAt = new Date();
    target.lastValidatedAt = new Date();

    await this.appendAuditEntry({
      workspaceId: input.workspaceId,
      action: "artifact-published",
      actor: input.actor,
      actorKind: input.actorKind,
      refId: target.id,
      detail: input.promotionNotes
        ? `Promoted "${target.title}" to canonical. ${input.promotionNotes}`
        : `Promoted "${target.title}" to canonical.`,
      riskTier: "low",
    });

    this.state.signals.unshift({
      id: generateId("sig"),
      workspaceId: input.workspaceId,
      kind: "knowledge-promoted",
      severity: "notable",
      title: `Knowledge promoted: ${target.title}`,
      detail: input.promotionNotes ?? "Item promoted to the canonical Bookshelf.",
      source: input.actor,
      refId: target.id,
      capturedAt: new Date(),
    });

    return structuredClone(target);
  }

  // ── helpers ──────────────────────────────────────────────────

  private assertWorkspace(workspaceId: string) {
    if (this.state.workspace.id !== workspaceId) {
      throw new Error(
        `Unknown workspaceId: ${workspaceId}. In v1 the portal is single-workspace; expected ${this.state.workspace.id}.`,
      );
    }
  }

  private scope<T>(workspaceId: string, rows: T[], selector: (row: T) => string): T[] {
    this.assertWorkspace(workspaceId);
    return structuredClone(rows.filter((row) => selector(row) === workspaceId));
  }
}

function humanize(outcome: "approved" | "deferred" | "rejected"): string {
  return outcome.charAt(0).toUpperCase() + outcome.slice(1);
}
