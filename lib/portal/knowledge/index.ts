// ============================================================
// Knowledge adapter factory + workspace projection (Phase 4)
//
// One entry point for both the workspace search surface and the
// confidence-decay helpers. Lifetime is per-process and cached so
// the in-memory index is built once when a server boots.
// ============================================================

// Server-only by convention.

import { getPortalRepository } from "@/lib/portal/repositories";
import type {
  Artifact,
  Conversation,
  Decision,
  Evidence,
  KnowledgeItem,
  Signal,
} from "@/lib/portal/types";

import { InMemoryKnowledgeAdapter } from "./in-memory-adapter";
import type {
  DecayInput,
  DecayOutput,
  KnowledgeAdapter,
  KnowledgeIndexedRow,
  RevalidationCandidate,
  SearchQuery,
  SearchResult,
  SearchableEntity,
} from "./types";

let cachedAdapter: KnowledgeAdapter | null = null;
const indexedWorkspaces = new Set<string>();

export function getKnowledgeAdapter(): KnowledgeAdapter {
  if (cachedAdapter) return cachedAdapter;
  cachedAdapter = new InMemoryKnowledgeAdapter();
  return cachedAdapter;
}

export function __resetKnowledgeAdapter(): void {
  cachedAdapter = null;
  indexedWorkspaces.clear();
}

/**
 * Ensures the active workspace is indexed before serving a search.
 * In Phase 4.0 we re-index lazily; Phase 4.1 will swap to event-
 * driven incremental upserts.
 */
async function ensureIndexed(workspaceId: string): Promise<KnowledgeAdapter> {
  const adapter = getKnowledgeAdapter();
  if (indexedWorkspaces.has(workspaceId)) return adapter;
  const repo = getPortalRepository();
  const [artifacts, decisions, knowledge, signals, conversations, evidence] = await Promise.all([
    repo.listArtifacts(workspaceId),
    repo.listDecisions(workspaceId),
    repo.listKnowledge(workspaceId),
    repo.listSignals(workspaceId),
    repo.listConversations(workspaceId),
    repo.listEvidence(workspaceId),
  ]);
  const evidenceById = new Map(evidence.map((e) => [e.id, e]));

  const rows: KnowledgeIndexedRow[] = [
    ...artifacts.map((a) => artifactToRow(a, workspaceId, evidenceById)),
    ...decisions.map((d) => decisionToRow(d, workspaceId)),
    ...knowledge.map((k) => knowledgeToRow(k)),
    ...signals.map((s) => signalToRow(s)),
    ...conversations.map((c) => conversationToRow(c)),
  ];
  await adapter.reindex(rows);
  indexedWorkspaces.add(workspaceId);
  return adapter;
}

/**
 * Invalidate the indexed snapshot for a workspace so the next
 * search call re-projects from the repository.
 */
export function invalidateKnowledgeIndex(workspaceId?: string): void {
  if (workspaceId) {
    indexedWorkspaces.delete(workspaceId);
  } else {
    indexedWorkspaces.clear();
  }
}

export async function searchWorkspace(query: SearchQuery): Promise<SearchResult[]> {
  const adapter = await ensureIndexed(query.workspaceId);
  return adapter.search(query);
}

// ── Confidence decay ──────────────────────────────────────────

/**
 * Pure function — given a knowledge row's last validation date and
 * memory tier, returns the decayed confidence + freshness label.
 *
 * The model is intentionally simple in Phase 4.0:
 *   - half-life depends on memory tier (M0 fastest, M4 slowest)
 *   - freshness drops bucket-wise (fresh→aging→stale) on top of the
 *     continuous confidence decay
 */
export function decayConfidence(input: DecayInput, now: Date = new Date()): DecayOutput {
  const ageDays = (now.getTime() - input.lastValidatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const halfLife = HALF_LIFE_DAYS[input.memoryTier];
  const factor = Math.pow(0.5, ageDays / halfLife);
  const confidence = clamp01(input.confidence * factor);
  const freshness = freshnessForAge(ageDays, input.memoryTier);
  return { confidence, freshness };
}

export function computeRevalidationQueue(items: KnowledgeItem[]): RevalidationCandidate[] {
  const candidates: RevalidationCandidate[] = [];
  for (const item of items) {
    const decayed = decayConfidence({
      lastValidatedAt: item.lastValidatedAt,
      memoryTier: item.memoryTier,
      confidence: item.confidence,
    });
    const reason: RevalidationCandidate["reason"] =
      decayed.freshness === "stale" ? "stale" : decayed.confidence < 0.45 ? "low-confidence" : "high-decay-rate";
    const recommended: RevalidationCandidate["recommendedAction"] =
      decayed.confidence < 0.3 ? "supersede" : decayed.freshness === "stale" ? "archive" : "revalidate";

    if (decayed.freshness !== "fresh" || decayed.confidence < 0.6) {
      const urgency =
        (item.canonical ? 0.4 : 0.15) + (1 - decayed.confidence) * 0.6 +
        (decayed.freshness === "stale" ? 0.4 : decayed.freshness === "aging" ? 0.15 : 0);
      candidates.push({
        knowledgeId: item.id,
        title: item.title,
        memoryTier: item.memoryTier,
        shelf: item.shelf,
        reason,
        recommendedAction: recommended,
        urgency,
      });
    }
  }
  return candidates.sort((a, b) => b.urgency - a.urgency);
}

const HALF_LIFE_DAYS: Record<KnowledgeItem["memoryTier"], number> = {
  M0: 2,
  M1: 14,
  M2: 60,
  M3: 180,
  M4: 730,
};

function freshnessForAge(ageDays: number, tier: KnowledgeItem["memoryTier"]): "fresh" | "aging" | "stale" {
  const thresholds = {
    M0: { fresh: 1, aging: 4 },
    M1: { fresh: 7, aging: 21 },
    M2: { fresh: 30, aging: 75 },
    M3: { fresh: 90, aging: 180 },
    M4: { fresh: 365, aging: 1000 },
  }[tier];
  if (ageDays <= thresholds.fresh) return "fresh";
  if (ageDays <= thresholds.aging) return "aging";
  return "stale";
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

// ── Row factories (typed) ─────────────────────────────────────

function artifactToRow(
  a: Artifact,
  workspaceId: string,
  evidenceById: Map<string, Evidence>,
): KnowledgeIndexedRow {
  const evidenceSnippets = a.linkedEvidenceIds
    .map((id) => evidenceById.get(id))
    .filter((e): e is Evidence => Boolean(e))
    .map((e) => `${e.title}: ${e.snippet}`)
    .join("\n");
  return {
    entity: "artifact",
    id: a.id,
    workspaceId,
    engagementId: a.engagementId,
    title: a.name,
    body: `${a.description}\n${evidenceSnippets}`,
    source: a.ownerName,
    canonical: a.canonical,
    lastTouchedAt: a.lastReviewedAt,
  };
}

function decisionToRow(d: Decision, workspaceId: string): KnowledgeIndexedRow {
  return {
    entity: "decision",
    id: d.id,
    workspaceId,
    engagementId: d.engagementId,
    title: d.title,
    body: `${d.recommendation.summary}\n${d.recommendation.rationale}\n${d.recommendation.options
      .map((o) => `${o.label}: ${o.description}`)
      .join("\n")}`,
    source: d.proposedBy,
    canonical: d.status === "approved",
    lastTouchedAt: d.decidedAt ?? d.dueAt ?? new Date(),
  };
}

function knowledgeToRow(k: KnowledgeItem): KnowledgeIndexedRow {
  return {
    entity: "knowledge",
    id: k.id,
    workspaceId: k.workspaceId,
    title: k.title,
    body: k.summary,
    source: k.source,
    shelf: k.shelf,
    memoryTier: k.memoryTier,
    canonical: k.canonical,
    lastTouchedAt: k.promotedAt ?? k.lastValidatedAt,
  };
}

function signalToRow(s: Signal): KnowledgeIndexedRow {
  return {
    entity: "signal",
    id: s.id,
    workspaceId: s.workspaceId,
    engagementId: s.engagementId,
    title: s.title,
    body: s.detail,
    source: s.source,
    lastTouchedAt: s.capturedAt,
  };
}

function conversationToRow(c: Conversation): KnowledgeIndexedRow {
  const body = c.messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  return {
    entity: "conversation",
    id: c.id,
    workspaceId: c.workspaceId,
    title: c.title,
    body,
    source: c.agentId,
    lastTouchedAt: c.lastTurnAt,
  };
}

export type {
  KnowledgeAdapter,
  KnowledgeIndexedRow,
  RevalidationCandidate,
  SearchQuery,
  SearchResult,
  SearchableEntity,
} from "./types";
