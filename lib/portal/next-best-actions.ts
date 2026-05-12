// ============================================================
// Next-Best-Actions ranking pipeline (Phase 5.1)
//
// Derives a ranked NBA list from the current workspace state.
// Replaces the static `mockNextBestActions` seed for the Command
// Center.
//
// Score model (Phase 5.1):
//   - Pending decisions: tierWeight × confidence × due-date weight
//   - Engagement risks: each risk contributes a low-urgency action
//   - Stale knowledge: revalidation candidates above an urgency floor
//   - Audit gaps: pending decisions with thin evidence chains
//   - Schedule touchpoints: upcoming items without a prep artifact
// ============================================================

// Server-only by convention.

import type {
  Artifact,
  Decision,
  Engagement,
  KnowledgeItem,
  NextBestAction,
  ScheduleItem,
} from "@/lib/portal/types";

interface ComputeInput {
  decisions: Decision[];
  engagements: Engagement[];
  artifacts: Artifact[];
  knowledge: KnowledgeItem[];
  schedule: ScheduleItem[];
  /** Optional pre-existing actions (seeded) — merged into the result. */
  seeded?: NextBestAction[];
  now?: Date;
}

const TIER_WEIGHT: Record<"low" | "medium" | "high", number> = {
  low: 0.4,
  medium: 0.7,
  high: 1.0,
};
const DAY_MS = 24 * 60 * 60 * 1000;

export function computeNextBestActions(input: ComputeInput): NextBestAction[] {
  const now = input.now ?? new Date();
  const actions: NextBestAction[] = [];

  // 1. Pending decisions
  for (const decision of input.decisions) {
    if (decision.status !== "pending-approval") continue;
    const due = decision.dueAt?.getTime() ?? now.getTime() + 14 * DAY_MS;
    const daysUntilDue = Math.max(-30, (due - now.getTime()) / DAY_MS);
    const dueBoost = daysUntilDue <= 0 ? 1.2 : daysUntilDue <= 3 ? 1.0 : daysUntilDue <= 7 ? 0.7 : 0.5;
    const tier = TIER_WEIGHT[decision.riskTier];
    const score = tier * decision.recommendation.confidence * dueBoost;
    actions.push({
      id: `nba-decision-${decision.id}`,
      label: `Decide: ${decision.title}`,
      rationale: `${decision.riskTier} tier · default ${decision.recommendation.defaultChoice} at ${Math.round(decision.recommendation.confidence * 100)}% confidence. ${daysUntilDue <= 0 ? "Past due." : daysUntilDue <= 3 ? `Due in ${Math.round(daysUntilDue)}d.` : `Due in ${Math.round(daysUntilDue)}d.`}`,
      engagementId: decision.engagementId,
      estimatedEffort: "minutes",
      priority: score >= 0.7 ? "primary" : "secondary",
      score,
      source: "pending-decision",
      refKind: "decision",
      refId: decision.id,
    });
  }

  // 2. Engagement risks — one action per active risk on a non-complete engagement
  for (const engagement of input.engagements) {
    if (engagement.status === "complete" || engagement.status === "paused") continue;
    for (const risk of engagement.risks.slice(0, 2)) {
      actions.push({
        id: `nba-risk-${engagement.id}-${hashLine(risk)}`,
        label: `Mitigate risk on ${engagement.name}`,
        rationale: risk,
        engagementId: engagement.id,
        estimatedEffort: "hours",
        priority: "secondary",
        score: 0.4,
        source: "engagement-risk",
      });
    }
  }

  // 3. Stale knowledge — top revalidation candidate per shelf
  const stale = input.knowledge.filter((k) => k.freshness === "stale" || k.confidence < 0.55);
  const staleByShelf = new Map<string, KnowledgeItem>();
  for (const k of stale) {
    if (!staleByShelf.has(k.shelf)) staleByShelf.set(k.shelf, k);
  }
  for (const item of staleByShelf.values()) {
    actions.push({
      id: `nba-knowledge-${item.id}`,
      label: `Revalidate "${item.title}"`,
      rationale: `${item.shelf} · ${item.memoryTier} · confidence ${Math.round(item.confidence * 100)}%. ${item.freshness === "stale" ? "Beyond freshness threshold." : "Below confidence floor."}`,
      estimatedEffort: "hours",
      priority: item.canonical ? "primary" : "secondary",
      score: item.canonical ? 0.65 : 0.45,
      source: "stale-knowledge",
      refKind: "knowledge",
      refId: item.id,
    });
  }

  // 4. Audit gaps — pending decisions with too few evidence rows
  for (const decision of input.decisions) {
    if (decision.status !== "pending-approval") continue;
    if (decision.evidenceIds.length < 2) {
      actions.push({
        id: `nba-audit-gap-${decision.id}`,
        label: `Backfill evidence on "${decision.title}"`,
        rationale: `Decision cites only ${decision.evidenceIds.length} evidence row${decision.evidenceIds.length === 1 ? "" : "s"}. The Governance Auditor will mark this needs-revision otherwise.`,
        engagementId: decision.engagementId,
        estimatedEffort: "hours",
        priority: "secondary",
        score: 0.55,
        source: "audit-gap",
        refKind: "decision",
        refId: decision.id,
      });
    }
  }

  // 5. Schedule touchpoints — within the next 7 days, no prep artifact
  const upcomingWindow = 7 * DAY_MS;
  for (const item of input.schedule) {
    if (item.status === "completed" || item.status === "cancelled") continue;
    const delta = item.startsAt.getTime() - now.getTime();
    if (delta < 0 || delta > upcomingWindow) continue;
    if (item.linkedArtifactId || item.linkedDecisionId) continue;
    actions.push({
      id: `nba-schedule-${item.id}`,
      label: `Prep for "${item.title}"`,
      rationale: `${item.kind} in ${Math.max(0, Math.round(delta / DAY_MS))}d. No prep artifact attached.`,
      engagementId: item.engagementId,
      estimatedEffort: "hours",
      priority: "secondary",
      score: 0.5,
      source: "scheduled-touchpoint",
      refKind: "schedule",
      refId: item.id,
    });
  }

  // 6. Seeded actions (manual NBA seeds get the lowest tie-breaking score).
  if (input.seeded) {
    for (const seed of input.seeded) {
      actions.push({ ...seed, source: seed.source ?? "manual", score: seed.score ?? 0.3 });
    }
  }

  // Sort by score desc, then promote primaries above secondaries within a score band.
  actions.sort((a, b) => {
    const sa = a.score ?? 0;
    const sb = b.score ?? 0;
    if (Math.abs(sa - sb) < 0.05) {
      if (a.priority === b.priority) return sb - sa;
      return a.priority === "primary" ? -1 : 1;
    }
    return sb - sa;
  });

  return actions.slice(0, 10);
}

function hashLine(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).slice(0, 6);
}
