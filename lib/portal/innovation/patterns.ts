// ============================================================
// Pattern Library (Phase 7)
//
// Curated, deterministic set of delivery patterns Dauntless has
// distilled across engagements. The marketing site promises 200+;
// Phase 7.0 ships the shape + a curated 15-pattern seed. Phase
// 7.1 will plumb in pattern emergence detection (Phase 12's
// federation precursor).
// ============================================================

// Server-only by convention.

export type PatternCategory =
  | "consulting"
  | "training"
  | "agentic"
  | "governance"
  | "activation";

export type PatternMaturity = "emergent" | "validated" | "canonical";

export interface PatternLibraryEntry {
  id: string;
  title: string;
  category: PatternCategory;
  maturity: PatternMaturity;
  summary: string;
  /** Short description of when this pattern applies. */
  whenItApplies: string;
  /** Markdown bullets of evidence anchoring the pattern. */
  evidence: string[];
  /** Engagement archetypes that have proven this pattern. */
  provenAcrossKinds: Array<"discovery" | "design" | "build" | "activate" | "advisory">;
  /** Approximate impact (1–5) if applied to a fitting engagement. */
  impactScore: number;
  /** Reversibility (1–5; 5 = fully reversible). */
  reversibilityScore: number;
  /** Approximate time horizon to see results in days. */
  timeToImpactDays: number;
}

export const PATTERN_LIBRARY: PatternLibraryEntry[] = [
  {
    id: "ptn-decision-architecture-tiers",
    title: "Three-tier risk gating for AI decisions",
    category: "governance",
    maturity: "canonical",
    summary:
      "Split AI decisions into low / medium / high tiers with separate evidence bars; reject one-source recommendations at the high tier.",
    whenItApplies:
      "Any engagement where AI proposes recommendations that materially affect policy, procurement, or workforce decisions.",
    evidence: [
      "TBS Governance Framework v1.0 — six pillars",
      "TB Directive on Automated Decision-Making cross-reference",
    ],
    provenAcrossKinds: ["design", "build", "advisory"],
    impactScore: 5,
    reversibilityScore: 4,
    timeToImpactDays: 21,
  },
  {
    id: "ptn-canonical-promotion-loop",
    title: "Canonical promotion gated by Governance Auditor",
    category: "governance",
    maturity: "canonical",
    summary:
      "Route every promotion-to-canonical through an independent Auditor agent before an executive approval; keeps the Bookshelf honest.",
    whenItApplies:
      "Any engagement that needs to ship reusable artifacts across teams or programs.",
    evidence: ["Phase 4.1 architecture", "Six-pillar trust framework"],
    provenAcrossKinds: ["design", "advisory"],
    impactScore: 4,
    reversibilityScore: 5,
    timeToImpactDays: 14,
  },
  {
    id: "ptn-hard-separation-agents",
    title: "Hard separation of strategist / operator / auditor",
    category: "agentic",
    maturity: "canonical",
    summary:
      "Enforce separation at the tool-catalog level: no agent should both route and execute, no agent should both produce and audit.",
    whenItApplies:
      "Multi-agent deployments where governance posture matters more than throughput.",
    evidence: ["Phase 5 separation-of-powers test suite"],
    provenAcrossKinds: ["design", "build"],
    impactScore: 5,
    reversibilityScore: 3,
    timeToImpactDays: 30,
  },
  {
    id: "ptn-stop-after-discovery",
    title: "Pause-and-decide gate at Discovery → Design boundary",
    category: "consulting",
    maturity: "validated",
    summary:
      "Force a mandatory pause-and-decide moment between Discovery and Design. Re-confirms scope; saves an average 2–3 weeks of rework.",
    whenItApplies:
      "Discovery engagements that surface a non-trivial reframing of the original scope.",
    evidence: ["3 of 4 prior engagements slipped 18–22 days when this gate was skipped"],
    provenAcrossKinds: ["discovery", "design"],
    impactScore: 4,
    reversibilityScore: 5,
    timeToImpactDays: 7,
  },
  {
    id: "ptn-curriculum-rebuild-from-feedback",
    title: "Cohort-driven module rebuild",
    category: "training",
    maturity: "canonical",
    summary:
      "Rebuild the lowest-rated module after each cohort using direct feedback; treat curriculum as living deliverable, not fixed asset.",
    whenItApplies: "Multi-cohort training programs running > 8 weeks.",
    evidence: ["Cohort-2 module 6 rebuild: 81% rated 'most valuable'"],
    provenAcrossKinds: ["build", "activate"],
    impactScore: 4,
    reversibilityScore: 5,
    timeToImpactDays: 21,
  },
  {
    id: "ptn-activation-coach-cadence",
    title: "Fortnightly champion calibration cadence",
    category: "activation",
    maturity: "validated",
    summary:
      "Run a 30-minute champion calibration touchpoint every two weeks for 90 days post-engagement.",
    whenItApplies:
      "Post-engagement activation phases with department-level champions.",
    evidence: ["Activation Coach proposal — Q3 cadence"],
    provenAcrossKinds: ["activate"],
    impactScore: 3,
    reversibilityScore: 5,
    timeToImpactDays: 30,
  },
  {
    id: "ptn-evidence-bar-three-sources",
    title: "Three-evidence-source rule for high-tier decisions",
    category: "governance",
    maturity: "canonical",
    summary:
      "High-risk decisions require ≥3 independent evidence rows before they can be approved.",
    whenItApplies: "Any workspace running propose→approve→commit governance.",
    evidence: ["Governance Auditor audit verdict rules"],
    provenAcrossKinds: ["design", "advisory"],
    impactScore: 4,
    reversibilityScore: 4,
    timeToImpactDays: 14,
  },
  {
    id: "ptn-procurement-front-load",
    title: "Procurement vehicle staged before Design closes",
    category: "consulting",
    maturity: "validated",
    summary:
      "Pre-stage Phase-2 procurement during Discovery to avoid the typical 18–22-day gate slippage at Design → Build.",
    whenItApplies:
      "Federal engagements with multi-phase procurement timelines.",
    evidence: ["TBS Procurement timeline — historical slippage analysis"],
    provenAcrossKinds: ["discovery", "design"],
    impactScore: 5,
    reversibilityScore: 4,
    timeToImpactDays: 30,
  },
  {
    id: "ptn-membership-role-gate",
    title: "Role-based UI gating on every write",
    category: "governance",
    maturity: "validated",
    summary:
      "All UI writes pass through a typed membership predicate. No client-side bypass possible.",
    whenItApplies: "Workspaces with multiple stakeholder personas.",
    evidence: ["Phase 2 membership-gate.ts"],
    provenAcrossKinds: ["build"],
    impactScore: 3,
    reversibilityScore: 5,
    timeToImpactDays: 14,
  },
  {
    id: "ptn-confidence-decay-revalidate",
    title: "Confidence decay with revalidation queue",
    category: "agentic",
    maturity: "validated",
    summary:
      "Apply half-life decay to knowledge confidence based on memory tier; surface a ranked revalidation queue.",
    whenItApplies: "Workspaces accumulating > 30 canonical knowledge items.",
    evidence: ["Phase 4 decayConfidence + computeRevalidationQueue"],
    provenAcrossKinds: ["design", "build"],
    impactScore: 4,
    reversibilityScore: 5,
    timeToImpactDays: 60,
  },
  {
    id: "ptn-stub-mode-stays-honest",
    title: "Stub mode that produces real state",
    category: "agentic",
    maturity: "canonical",
    summary:
      "When the LLM key is unset, run a deterministic stub that still produces a real Decision / Artifact / handoff. UX is exercisable offline; the audit log doesn't lie.",
    whenItApplies:
      "Any portal demo, training, or proof-of-concept before keys land.",
    evidence: ["Phase 3 stub mode + Phase 5 per-archetype stubs"],
    provenAcrossKinds: ["design", "build"],
    impactScore: 3,
    reversibilityScore: 5,
    timeToImpactDays: 7,
  },
  {
    id: "ptn-inline-citation-chips",
    title: "Inline `[[ev-id]]` citation chips",
    category: "agentic",
    maturity: "validated",
    summary:
      "Citation references are first-class Markdown tokens that render as link chips with kind + source. Forces every claim to anchor in evidence.",
    whenItApplies: "Authoring living deliverables in a portal context.",
    evidence: ["Phase 4.1 artifact-markdown.tsx"],
    provenAcrossKinds: ["build", "design"],
    impactScore: 4,
    reversibilityScore: 5,
    timeToImpactDays: 14,
  },
  {
    id: "ptn-cross-engagement-suggestions",
    title: "Cross-engagement canonical surface",
    category: "consulting",
    maturity: "emergent",
    summary:
      "When a new engagement starts, surface relevant canonical artifacts and knowledge from prior engagements within the same workspace.",
    whenItApplies:
      "Workspaces running more than one engagement in parallel or sequence.",
    evidence: ["Phase 6.0 computeCrossEngagementSuggestions"],
    provenAcrossKinds: ["discovery", "design", "advisory"],
    impactScore: 4,
    reversibilityScore: 5,
    timeToImpactDays: 21,
  },
  {
    id: "ptn-impact-report-from-bus",
    title: "Telemetry-driven impact report",
    category: "consulting",
    maturity: "emergent",
    summary:
      "Quarterly impact report assembles itself from the telemetry event bus. The Report Builder agent elaborates; the data is deterministic.",
    whenItApplies:
      "Engagements with a quarterly steering-committee cadence.",
    evidence: ["Phase 6.0 generateImpactReport"],
    provenAcrossKinds: ["advisory"],
    impactScore: 3,
    reversibilityScore: 5,
    timeToImpactDays: 90,
  },
  {
    id: "ptn-mem-palace-shelf-mapping",
    title: "Three-shelves memory mapping",
    category: "agentic",
    maturity: "validated",
    summary:
      "Map portal knowledge shelves (Desk/Bookshelf/Cabinet) to a mem-palace's private/shared/compiled layers via a thin adapter.",
    whenItApplies: "Workspaces porting CAIA-style memory into the portal.",
    evidence: ["Phase 4.0 knowledge-adapter port from CAIA mem-palace"],
    provenAcrossKinds: ["design", "build"],
    impactScore: 4,
    reversibilityScore: 5,
    timeToImpactDays: 30,
  },
];

export function listPatterns(filter?: {
  category?: PatternCategory;
  maturity?: PatternMaturity;
}): PatternLibraryEntry[] {
  let rows = PATTERN_LIBRARY.slice();
  if (filter?.category) rows = rows.filter((p) => p.category === filter.category);
  if (filter?.maturity) rows = rows.filter((p) => p.maturity === filter.maturity);
  return rows;
}

export function getPattern(id: string): PatternLibraryEntry | null {
  return PATTERN_LIBRARY.find((p) => p.id === id) ?? null;
}

export interface PatternMatch {
  pattern: PatternLibraryEntry;
  score: number;
  reasons: string[];
}

/**
 * Match patterns against an engagement's success criteria. Returns a
 * ranked list — Phase 7.1 will replace overlap with embedding cosine.
 */
export function matchPatternsForEngagement(criteria: string[], kind: string): PatternMatch[] {
  const queryTokens = new Set(
    criteria
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 4),
  );
  const matches: PatternMatch[] = [];
  for (const pattern of PATTERN_LIBRARY) {
    const patternTokens = new Set(
      `${pattern.title} ${pattern.summary} ${pattern.whenItApplies}`
        .toLowerCase()
        .replace(/[^a-z0-9\s]+/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 4),
    );
    let overlap = 0;
    const reasons: string[] = [];
    for (const t of queryTokens) {
      if (patternTokens.has(t)) {
        overlap += 1;
      }
    }
    let score = queryTokens.size === 0 ? 0 : overlap / queryTokens.size;
    if (pattern.provenAcrossKinds.includes(kind as "discovery")) {
      score += 0.15;
      reasons.push(`proven in ${kind} engagements`);
    }
    if (pattern.maturity === "canonical") {
      score += 0.1;
      reasons.push("canonical maturity");
    }
    if (score < 0.05) continue;
    matches.push({
      pattern,
      score: Math.min(1, score),
      reasons,
    });
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 8);
}
