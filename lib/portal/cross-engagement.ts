// ============================================================
// Cross-engagement intelligence (Phase 6)
//
// Given a workspace snapshot, compute "relevant prior canonical
// artifacts" for each engagement. Phase 6.0 uses overlap-of-
// significant-tokens between the engagement's success criteria
// and the artifact's name/description. Phase 6.1 swaps in
// embedding cosine similarity once the pgvector adapter lands.
// ============================================================

// Server-only by convention.

import type { Artifact, Engagement } from "@/lib/portal/types";

export interface CrossEngagementSuggestion {
  artifactId: string;
  artifactName: string;
  sourceEngagementId: string;
  /** 0–1 — share of significant query tokens that match. */
  score: number;
  /** Short human-readable hint about why this artifact is relevant. */
  reason: string;
}

const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "have", "are",
  "across", "into", "their", "they", "them", "all", "any", "into",
  "must", "should", "will", "before", "after", "around", "without",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3 && !STOPWORDS.has(t));
}

export function computeCrossEngagementSuggestions(
  engagements: Engagement[],
  artifacts: Artifact[],
  options: { limitPerEngagement?: number } = {},
): Record<string, CrossEngagementSuggestion[]> {
  const limit = options.limitPerEngagement ?? 4;
  const canonical = artifacts.filter((a) => a.canonical || a.reviewState === "approved");

  const out: Record<string, CrossEngagementSuggestion[]> = {};
  for (const engagement of engagements) {
    const queryTokens = new Set(
      [
        ...tokenize(engagement.name),
        ...tokenize(engagement.successCriteria.join(" ")),
        ...tokenize(engagement.kind),
      ].filter(Boolean),
    );
    if (queryTokens.size === 0) {
      out[engagement.id] = [];
      continue;
    }

    const scored: CrossEngagementSuggestion[] = [];
    for (const artifact of canonical) {
      if (artifact.engagementId === engagement.id) continue;
      const artifactTokens = new Set(
        [
          ...tokenize(artifact.name),
          ...tokenize(artifact.description),
          ...tokenize(artifact.type),
        ],
      );
      let overlap = 0;
      for (const t of queryTokens) if (artifactTokens.has(t)) overlap += 1;
      const score = overlap / queryTokens.size;
      if (score < 0.08) continue;
      const sharedTokens = [...queryTokens].filter((t) => artifactTokens.has(t)).slice(0, 4);
      scored.push({
        artifactId: artifact.id,
        artifactName: artifact.name,
        sourceEngagementId: artifact.engagementId,
        score,
        reason: sharedTokens.length === 0
          ? "Shape match"
          : `Shares: ${sharedTokens.join(", ")}`,
      });
    }
    scored.sort((a, b) => b.score - a.score);
    out[engagement.id] = scored.slice(0, limit);
  }
  return out;
}
