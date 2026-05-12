// ============================================================
// In-memory KnowledgeAdapter (Phase 4)
//
// Deterministic retrieval over the workspace. Ports the
// "InMemoryMempalaceAdapter" pattern from CAIA, but using a
// TF-IDF + token-overlap scorer instead of cosine similarity
// over embeddings. The interface is identical so the Phase 4.1
// embedding-backed adapter is a drop-in replacement.
//
// Implementation notes:
//   - Tokenizer: lowercase, strip non-alnum, drop tokens ≤2 chars,
//     drop a tiny English stopword list. Good enough for the
//     deterministic seed; replaced when embeddings land.
//   - Scoring: query overlap × (0.6 + 0.4 × idf), then a modest
//     boost for canonical knowledge and fresh signals.
//   - Snippet: pull the first window containing a query token, or
//     the row's first ~140 chars if no overlap.
// ============================================================

// Server-only by convention; consumers route through `lib/portal/server.ts`.

import type {
  KnowledgeAdapter,
  KnowledgeIndexedRow,
  SearchQuery,
  SearchResult,
} from "./types";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "have", "has", "are",
  "was", "were", "but", "not", "you", "your", "our", "their", "they", "them",
  "all", "any", "can", "should", "would", "will", "just", "into", "onto",
  "what", "which", "when", "while", "where", "why", "how", "who", "whom",
  "out", "over", "than", "then", "there",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

interface IndexedDoc {
  row: KnowledgeIndexedRow;
  tokens: string[];
  termFreq: Map<string, number>;
}

function buildDoc(row: KnowledgeIndexedRow): IndexedDoc {
  const tokens = tokenize(`${row.title}\n${row.body}`);
  const termFreq = new Map<string, number>();
  for (const t of tokens) {
    termFreq.set(t, (termFreq.get(t) ?? 0) + 1);
  }
  return { row, tokens, termFreq };
}

export class InMemoryKnowledgeAdapter implements KnowledgeAdapter {
  readonly id = "in-memory-knowledge";
  readonly kind = "in-memory" as const;

  private docs = new Map<string, IndexedDoc>();
  private docFreq = new Map<string, number>();

  size(): number {
    return this.docs.size;
  }

  async reindex(rows: KnowledgeIndexedRow[]): Promise<void> {
    this.docs.clear();
    this.docFreq.clear();
    for (const row of rows) {
      const doc = buildDoc(row);
      this.docs.set(this.key(row), doc);
      for (const term of new Set(doc.tokens)) {
        this.docFreq.set(term, (this.docFreq.get(term) ?? 0) + 1);
      }
    }
  }

  async upsert(row: KnowledgeIndexedRow): Promise<void> {
    const k = this.key(row);
    const prev = this.docs.get(k);
    if (prev) {
      for (const term of new Set(prev.tokens)) {
        const count = (this.docFreq.get(term) ?? 1) - 1;
        if (count <= 0) this.docFreq.delete(term);
        else this.docFreq.set(term, count);
      }
    }
    const doc = buildDoc(row);
    this.docs.set(k, doc);
    for (const term of new Set(doc.tokens)) {
      this.docFreq.set(term, (this.docFreq.get(term) ?? 0) + 1);
    }
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const tokens = tokenize(query.query);
    if (tokens.length === 0) return [];

    const totalDocs = this.docs.size || 1;
    const entitiesFilter = query.entities && query.entities.length > 0
      ? new Set(query.entities)
      : null;
    const freshnessRank = { fresh: 3, aging: 2, stale: 1 } as const;
    const minFreshnessRank = query.minFreshness ? freshnessRank[query.minFreshness] : 0;

    const scored: SearchResult[] = [];
    for (const [, doc] of this.docs) {
      const row = doc.row;
      if (row.workspaceId !== query.workspaceId) continue;
      if (entitiesFilter && !entitiesFilter.has(row.entity)) continue;
      if (query.shelf && row.shelf !== query.shelf) continue;

      let score = 0;
      for (const term of tokens) {
        const tf = doc.termFreq.get(term);
        if (!tf) continue;
        const df = this.docFreq.get(term) ?? 1;
        const idf = Math.log(1 + totalDocs / df);
        score += tf * (0.6 + 0.4 * idf);
      }
      if (score === 0) continue;

      if (row.canonical) score *= 1.2;
      const ageMs = Date.now() - row.lastTouchedAt.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      if (ageDays < 7) score *= 1.1;
      else if (ageDays > 60) score *= 0.85;

      const freshness = computeFreshnessFromAge(ageDays, row.memoryTier);
      if (freshnessRank[freshness] < minFreshnessRank) continue;

      scored.push({
        entity: row.entity,
        id: row.id,
        title: row.title,
        snippet: extractSnippet(row.body, tokens),
        source: row.source,
        score,
        provenance: {
          workspaceId: row.workspaceId,
          engagementId: row.engagementId,
          shelf: row.shelf,
          memoryTier: row.memoryTier,
          freshness,
          canonical: row.canonical,
          lastTouchedAt: row.lastTouchedAt,
        },
        reference: referenceFor(row),
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, query.limit ?? 20);
  }

  private key(row: KnowledgeIndexedRow): string {
    return `${row.entity}:${row.id}`;
  }
}

function referenceFor(row: KnowledgeIndexedRow): SearchResult["reference"] {
  switch (row.entity) {
    case "artifact":      return { artifactId: row.id };
    case "decision":      return { decisionId: row.id };
    case "knowledge":     return { knowledgeId: row.id };
    case "signal":        return { signalId: row.id };
    case "conversation":  return { conversationId: row.id };
  }
}

function extractSnippet(body: string, tokens: string[]): string {
  if (!body) return "";
  const normalized = body.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();
  for (const t of tokens) {
    const idx = lower.indexOf(t);
    if (idx >= 0) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(normalized.length, idx + 100);
      const head = start > 0 ? "…" : "";
      const tail = end < normalized.length ? "…" : "";
      return `${head}${normalized.slice(start, end)}${tail}`;
    }
  }
  return normalized.slice(0, 140) + (normalized.length > 140 ? "…" : "");
}

function computeFreshnessFromAge(
  ageDays: number,
  memoryTier?: KnowledgeIndexedRow["memoryTier"],
): "fresh" | "aging" | "stale" {
  // M3+ (canonical layer) decays slowly; M0/M1 (working surface) faster.
  const tier = memoryTier ?? "M2";
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
