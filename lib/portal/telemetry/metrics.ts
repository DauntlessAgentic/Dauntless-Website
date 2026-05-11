// ============================================================
// Telemetry-derived metrics (Phase 6)
//
// Reduces the in-memory portal event bus into the metric shapes
// the Outcomes page already renders. Phase 6.1 will replace this
// with a persisted metrics table updated by background workers;
// today the reducers run at request time.
// ============================================================

// Server-only by convention.

import {
  listPortalEvents,
  type PortalEvent,
} from "./event-bus";

export interface DerivedMetric {
  key: string;
  label: string;
  unit: "percent" | "days" | "score" | "count" | "ratio";
  current: number;
  trend: "up" | "down" | "flat";
  trendValue: string;
  /** Free-form sentence the Outcomes page surfaces beneath the tile. */
  narrative: string;
  series: Array<{ period: string; value: number }>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function windowEvents(workspaceId: string, sinceDays: number): PortalEvent[] {
  const since = new Date(Date.now() - sinceDays * DAY_MS);
  return listPortalEvents({ workspaceId, since });
}

function buildSeries(events: PortalEvent[], bucketCount = 4, bucketSize = 7 * DAY_MS): Array<{ period: string; value: number }> {
  const series: Array<{ period: string; value: number }> = [];
  const now = Date.now();
  for (let i = bucketCount - 1; i >= 0; i -= 1) {
    const end = now - i * bucketSize;
    const start = end - bucketSize;
    const value = events.filter((e) => e.at.getTime() >= start && e.at.getTime() < end).length;
    series.push({ period: `Wk -${i}`, value });
  }
  return series;
}

export function computeDerivedMetrics(workspaceId: string): DerivedMetric[] {
  const events = windowEvents(workspaceId, 28);

  // Decisions proposed in the last 28 days.
  const proposed = events.filter((e) => e.kind === "decision-proposed");
  const decided = events.filter((e) => e.kind === "decision-outcome-recorded");
  const approved = decided.filter((e) => e.kind === "decision-outcome-recorded" && e.outcome === "approved");
  const handoffs = events.filter((e) => e.kind === "agent-handoff");
  const canonicalPromoted = events.filter((e) => e.kind === "artifact-promoted-canonical");
  const auditVerdicts = events.filter((e) => e.kind === "canonical-audit-verdict");

  const approvalRate = decided.length === 0 ? 0 : approved.length / decided.length;

  // Decision cycle time — mean of (decisionCycleMs / day) across decided events.
  const cycleSamples = decided
    .filter((e) => e.kind === "decision-outcome-recorded" && typeof e.decisionCycleMs === "number" && e.decisionCycleMs! >= 0)
    .map((e) => (e as Extract<PortalEvent, { kind: "decision-outcome-recorded" }>).decisionCycleMs! / DAY_MS);
  const avgCycleDays =
    cycleSamples.length === 0 ? 0 : cycleSamples.reduce((a, b) => a + b, 0) / cycleSamples.length;

  // Agent run cost in the window.
  const agentRuns = events.filter((e) => e.kind === "agent-run-completed");
  const totalSpend = agentRuns.reduce(
    (acc, e) =>
      e.kind === "agent-run-completed" ? acc + e.totalUsd : acc,
    0,
  );

  const passRate =
    auditVerdicts.length === 0
      ? 0
      : auditVerdicts.filter((e) => e.kind === "canonical-audit-verdict" && e.verdict === "pass").length /
        auditVerdicts.length;

  return [
    {
      key: "decisions-proposed-28d",
      label: "Decisions proposed (28d)",
      unit: "count",
      current: proposed.length,
      trend: proposed.length === 0 ? "flat" : "up",
      trendValue: `${proposed.length}`,
      narrative:
        proposed.length === 0
          ? "No new proposals landed in the last four weeks. Trigger an agent to seed the queue."
          : `${proposed.length} proposals in 28 days, ${approved.length} approved.`,
      series: buildSeries(proposed),
    },
    {
      key: "decision-approval-rate-28d",
      label: "Decision approval rate",
      unit: "percent",
      current: Math.round(approvalRate * 100),
      trend: approvalRate >= 0.6 ? "up" : approvalRate >= 0.4 ? "flat" : "down",
      trendValue: `${Math.round(approvalRate * 100)}%`,
      narrative:
        decided.length === 0
          ? "No decisions have been decided in this window."
          : `${approved.length}/${decided.length} decisions approved.`,
      series: buildSeries(approved),
    },
    {
      key: "decision-cycle-time-28d",
      label: "Decision cycle (days)",
      unit: "days",
      current: Number(avgCycleDays.toFixed(1)),
      trend: avgCycleDays > 0 && avgCycleDays < 5 ? "up" : avgCycleDays >= 5 ? "down" : "flat",
      trendValue: avgCycleDays === 0 ? "—" : `${avgCycleDays.toFixed(1)}d`,
      narrative:
        cycleSamples.length === 0
          ? "Cycle time is unknown until at least one decision is approved or rejected."
          : `Average ${avgCycleDays.toFixed(1)} days from propose → decided across ${cycleSamples.length} decisions.`,
      series: buildSeries(decided),
    },
    {
      key: "canonical-promotion-28d",
      label: "Canonical promotions (28d)",
      unit: "count",
      current: canonicalPromoted.length,
      trend: canonicalPromoted.length > 0 ? "up" : "flat",
      trendValue: `${canonicalPromoted.length}`,
      narrative:
        canonicalPromoted.length === 0
          ? "No artifacts have been promoted to canonical in the last four weeks."
          : `${canonicalPromoted.length} artifacts joined the Bookshelf.`,
      series: buildSeries(canonicalPromoted),
    },
    {
      key: "audit-pass-rate-28d",
      label: "Audit pass rate",
      unit: "percent",
      current: Math.round(passRate * 100),
      trend: passRate >= 0.7 ? "up" : "flat",
      trendValue: `${Math.round(passRate * 100)}%`,
      narrative:
        auditVerdicts.length === 0
          ? "No canonical audits have run yet."
          : `${auditVerdicts.filter((e) => e.kind === "canonical-audit-verdict" && e.verdict === "pass").length}/${auditVerdicts.length} canonical audits passed.`,
      series: buildSeries(auditVerdicts),
    },
    {
      key: "agent-spend-28d",
      label: "Agent spend (28d)",
      unit: "ratio",
      current: Number(totalSpend.toFixed(4)),
      trend: totalSpend > 1 ? "up" : "flat",
      trendValue: `$${totalSpend.toFixed(4)}`,
      narrative: `${agentRuns.length} runs · $${totalSpend.toFixed(4)} total. Phase 6.1 will alert on per-agent budgets.`,
      series: buildSeries(agentRuns),
    },
    {
      key: "agent-handoff-28d",
      label: "Agent handoffs (28d)",
      unit: "count",
      current: handoffs.length,
      trend: handoffs.length > 0 ? "up" : "flat",
      trendValue: `${handoffs.length}`,
      narrative: handoffs.length === 0
        ? "Operators haven't handed any work to Auditors yet — the fleet is dormant."
        : `${handoffs.length} archetype-to-archetype handoffs. Each is an auditable separation-of-powers event.`,
      series: buildSeries(handoffs),
    },
  ];
}
