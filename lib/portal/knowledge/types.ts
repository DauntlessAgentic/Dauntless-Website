// ============================================================
// Knowledge subsystem — types (Phase 4)
//
// Adapter-friendly shapes for the workspace-wide retrieval layer.
// Ports the CAIA mem-palace pattern (`lib/mempalace/types.ts`) and
// adapts it to the portal's domain:
//
//   CAIA `layer`      → portal `shelf` (desk/bookshelf/cabinet)
//   CAIA `wing`/`room`→ portal `workspaceId` + optional `engagementId`
//   CAIA `sourceType` → portal `sourceKind`
//
// The KnowledgeAdapter interface is intentionally minimal so the
// Phase 4.1 embedding-backed adapter can drop in without refactor.
// ============================================================

import type {
  Artifact,
  Decision,
  KnowledgeItem,
  KnowledgeShelf,
  MemoryTier,
  Signal,
} from "@/lib/portal/types";

/** Anything that can be retrieved through workspace search. */
export type SearchableEntity = "artifact" | "decision" | "knowledge" | "signal" | "conversation";

export interface SearchResult {
  entity: SearchableEntity;
  id: string;
  title: string;
  snippet: string;
  source: string;
  /** 0–1 relevance score from the adapter. */
  score: number;
  /** Provenance chip — shown next to every result row. */
  provenance: {
    workspaceId: string;
    engagementId?: string;
    shelf?: KnowledgeShelf;
    memoryTier?: MemoryTier;
    /** Best-known freshness signal — drives the "Freshness" filter. */
    freshness?: "fresh" | "aging" | "stale";
    canonical?: boolean;
    /** When the underlying row was last touched. */
    lastTouchedAt: Date;
  };
  /** Back-reference into the original entity for client-side rendering. */
  reference: {
    artifactId?: string;
    decisionId?: string;
    knowledgeId?: string;
    signalId?: string;
    conversationId?: string;
  };
}

export interface SearchQuery {
  workspaceId: string;
  query: string;
  /** Restrict to one or more entity kinds. Empty = all. */
  entities?: SearchableEntity[];
  /** Restrict knowledge results to a specific shelf. */
  shelf?: KnowledgeShelf;
  /** Drop results whose freshness is below this threshold. */
  minFreshness?: "fresh" | "aging" | "stale";
  /** Cap returned results. Defaults to 20. */
  limit?: number;
}

/**
 * Snapshot of one row indexed by the adapter. Implementations
 * choose whether to store the embedding inline (Phase 4.1
 * postgres-pgvector adapter) or recompute on the fly.
 */
export interface KnowledgeIndexedRow {
  entity: SearchableEntity;
  id: string;
  workspaceId: string;
  engagementId?: string;
  title: string;
  body: string;
  source: string;
  shelf?: KnowledgeShelf;
  memoryTier?: MemoryTier;
  canonical?: boolean;
  lastTouchedAt: Date;
}

export interface KnowledgeAdapter {
  /** Identifier used in /portal/governance for activation-status banners. */
  readonly id: string;
  /** "in-memory" | "pgvector" | …; mirrors the repository pattern. */
  readonly kind: "in-memory" | "pgvector";

  /** Bulk-index the workspace. Called once at workspace boot. */
  reindex(rows: KnowledgeIndexedRow[]): Promise<void>;

  /** Append a single row to the index (e.g. when a new decision lands). */
  upsert(row: KnowledgeIndexedRow): Promise<void>;

  search(query: SearchQuery): Promise<SearchResult[]>;

  /** Number of rows currently indexed (for telemetry / health checks). */
  size(): number;
}

// ── Confidence decay (Phase 4.0) ──────────────────────────────

export interface DecayInput {
  /** ISO datestring of the row's last validation. */
  lastValidatedAt: Date;
  /** Current memory tier; M0/M1 decay fastest, M4 effectively never. */
  memoryTier: MemoryTier;
  /** Current confidence — input value the decay function ages. */
  confidence: number;
}

export interface DecayOutput {
  /** New 0–1 confidence after decay. */
  confidence: number;
  /** Re-evaluated freshness label. */
  freshness: "fresh" | "aging" | "stale";
}

// ── Re-validation queue ───────────────────────────────────────

export interface RevalidationCandidate {
  knowledgeId: string;
  title: string;
  memoryTier: MemoryTier;
  shelf: KnowledgeShelf;
  /** Why this row is in the queue. */
  reason: "stale" | "low-confidence" | "high-decay-rate";
  recommendedAction: "revalidate" | "supersede" | "archive";
  /** Computed score for ranking the queue (higher = more urgent). */
  urgency: number;
}

// ── Helpers exposed by the index module ───────────────────────

export type KnowledgeRowFactory = (entity: SearchableEntity, item: unknown) => KnowledgeIndexedRow;

/** Re-export for downstream consumers. */
export type { Artifact, Decision, KnowledgeItem, Signal };
