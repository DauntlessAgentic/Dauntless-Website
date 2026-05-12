// ============================================================
// Roadmap simulator (Phase 7)
//
// Deterministic forward projection for a small set of strategic
// scenarios. Phase 7.0 uses hand-tuned coefficients applied to
// the workspace's current metric values; Phase 7.1 will backtest
// against historical engagement series once the persisted
// metrics layer lands.
// ============================================================

// Server-only by convention.

import type { Engagement, Metric } from "@/lib/portal/types";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  /**
   * Per-metric multipliers applied across the horizon. Values >1 are
   * accretive, <1 are dilutive. Multipliers are interpolated linearly
   * from 1.0 at month 0 → target at month `horizonMonths`.
   */
  multipliers: Record<string, number>;
  reversibilityCost: "low" | "medium" | "high";
  optionValue: "low" | "medium" | "high";
}

export const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "scenario-anchor-service-design",
    title: "Anchor on Service Design (Horizon-2)",
    description:
      "Commit Horizon-2 around AI for service design. Capacity concentration favours adoption + capability lifts.",
    multipliers: {
      adoption: 1.18,
      "capability-score": 1.22,
      "governance-readiness": 1.05,
      "canonical-density": 1.12,
    },
    reversibilityCost: "medium",
    optionValue: "medium",
  },
  {
    id: "scenario-anchor-hr-ops",
    title: "Anchor on HR ops (Horizon-2)",
    description:
      "Anchor on HR-ops; lower-risk pilot but shallower capability lift.",
    multipliers: {
      adoption: 1.08,
      "capability-score": 1.06,
      "governance-readiness": 1.02,
      "canonical-density": 1.04,
    },
    reversibilityCost: "low",
    optionValue: "low",
  },
  {
    id: "scenario-pause-discovery",
    title: "Defer Horizon-2; extend Discovery",
    description:
      "Hold the gate. Re-confirm SteerCo alignment in another cycle. Lower adoption but more evidence on each surface.",
    multipliers: {
      adoption: 0.92,
      "capability-score": 0.97,
      "governance-readiness": 1.14,
      "canonical-density": 1.01,
    },
    reversibilityCost: "low",
    optionValue: "medium",
  },
];

export interface SimulationPoint {
  period: string;
  value: number;
}

export interface SimulatedMetric {
  metricKey: string;
  label: string;
  unit: Metric["unit"];
  baselineCurrent: number;
  projectedFinal: number;
  delta: number;
  series: SimulationPoint[];
}

export interface SimulationResult {
  scenario: Scenario;
  horizonMonths: number;
  metrics: SimulatedMetric[];
  /** Aggregate score: weighted sum of deltas, biased toward governance. */
  overallScore: number;
}

interface SimulationInput {
  scenarios: Scenario[];
  metrics: Metric[];
  /** Engagements that should be considered (drives baseline). */
  engagements: Engagement[];
  /** Months of forward projection. Default 6. */
  horizonMonths?: number;
}

const METRIC_WEIGHTS: Record<string, number> = {
  adoption: 1.0,
  "capability-score": 1.0,
  "governance-readiness": 1.4,
  "canonical-density": 0.8,
};

export function runScenarioSimulations(input: SimulationInput): SimulationResult[] {
  const horizon = input.horizonMonths ?? 6;
  const results: SimulationResult[] = [];

  for (const scenario of input.scenarios) {
    const simulated: SimulatedMetric[] = [];
    let scoreAcc = 0;
    let scoreWeightSum = 0;

    for (const metric of input.metrics) {
      const targetMultiplier = scenario.multipliers[metric.key] ?? 1;
      const series: SimulationPoint[] = [];
      for (let month = 0; month <= horizon; month += 1) {
        const t = month / horizon;
        // Linear interpolation from 1.0 to targetMultiplier, applied to
        // the metric's `current` baseline.
        const multiplier = 1 + (targetMultiplier - 1) * t;
        series.push({
          period: `M+${month}`,
          value: roundForUnit(metric.current * multiplier, metric.unit),
        });
      }
      const projectedFinal = series[series.length - 1].value;
      const delta = projectedFinal - metric.current;
      simulated.push({
        metricKey: metric.key,
        label: metric.label,
        unit: metric.unit,
        baselineCurrent: metric.current,
        projectedFinal,
        delta,
        series,
      });
      const weight = METRIC_WEIGHTS[metric.key] ?? 0.5;
      const normalizedDelta = metric.current === 0 ? 0 : delta / Math.max(1, metric.current);
      scoreAcc += normalizedDelta * weight;
      scoreWeightSum += weight;
    }

    // Reversibility cost penalty (negative); option value (positive).
    const reversibilityPenalty =
      scenario.reversibilityCost === "high" ? -0.15
      : scenario.reversibilityCost === "medium" ? -0.07
      : -0.02;
    const optionBonus =
      scenario.optionValue === "high" ? 0.12
      : scenario.optionValue === "medium" ? 0.05
      : 0;

    const overallScore = (scoreWeightSum === 0 ? 0 : scoreAcc / scoreWeightSum) + reversibilityPenalty + optionBonus;

    results.push({
      scenario,
      horizonMonths: horizon,
      metrics: simulated,
      overallScore: Number(overallScore.toFixed(3)),
    });
  }

  results.sort((a, b) => b.overallScore - a.overallScore);
  return results;
}

function roundForUnit(value: number, unit: Metric["unit"]): number {
  if (unit === "percent" || unit === "score") return Math.round(value);
  if (unit === "days") return Number(value.toFixed(1));
  return Number(value.toFixed(2));
}

// ── Decision-tree consequence graph ───────────────────────────

export interface DecisionTreeNode {
  id: string;
  label: string;
  description: string;
  probability: number; // 0-1
  /** Cumulative impact score if this branch is followed. */
  impactScore: number;
  children: DecisionTreeNode[];
}

/**
 * Build a 3-level branching consequence graph for a decision. The shape
 * is deterministic from the decision's options + risk tier so the
 * visualization is reproducible.
 */
export function buildDecisionTree(decision: {
  id: string;
  title: string;
  riskTier: "low" | "medium" | "high";
  recommendation: {
    options: Array<{ label: string; description: string; isDefault?: boolean }>;
    confidence: number;
  };
}): DecisionTreeNode {
  const tierWeight = decision.riskTier === "high" ? 3 : decision.riskTier === "medium" ? 2 : 1;
  return {
    id: `tree-${decision.id}`,
    label: decision.title,
    description: `Risk ${decision.riskTier} · confidence ${Math.round(decision.recommendation.confidence * 100)}%.`,
    probability: 1,
    impactScore: 0,
    children: decision.recommendation.options.map((option, idx) => ({
      id: `${decision.id}-opt-${idx}`,
      label: option.label,
      description: option.description,
      probability: option.isDefault ? decision.recommendation.confidence : (1 - decision.recommendation.confidence) / Math.max(1, decision.recommendation.options.length - 1),
      impactScore: option.isDefault ? tierWeight : tierWeight - 1,
      children: [
        {
          id: `${decision.id}-opt-${idx}-good`,
          label: "Best-case outcome",
          description: `Reverberates positively across ${tierWeight + 1} engagements within ${30 + idx * 7} days.`,
          probability: 0.55,
          impactScore: tierWeight * 2,
          children: [],
        },
        {
          id: `${decision.id}-opt-${idx}-neutral`,
          label: "Mid-case outcome",
          description: "Achieves the stated outcome with minor scope creep.",
          probability: 0.3,
          impactScore: tierWeight,
          children: [],
        },
        {
          id: `${decision.id}-opt-${idx}-bad`,
          label: "Worst-case outcome",
          description: `Forces a rollback within ${14 + idx * 5} days; needs a follow-up decision at the next gate.`,
          probability: 0.15,
          impactScore: -tierWeight,
          children: [],
        },
      ],
    })),
  };
}
