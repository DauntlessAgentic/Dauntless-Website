"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KpiTile } from "@/components/patterns/kpi-tile";
import { LineChartViz } from "@/components/viz/line-chart";
import { AreaChartViz } from "@/components/viz/area-chart";
import type { Metric, PortalSnapshot } from "@/lib/portal/types";
import type { MembershipContext } from "@/lib/auth/session";

const CHART_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)", "var(--chart-6)",
];

function unitSuffix(unit: Metric["unit"]): string {
  switch (unit) {
    case "percent": return "%";
    case "days":    return "d";
    case "score":   return "";
    case "count":   return "";
    case "ratio":   return "";
  }
}

function kpiStatus(metric: Metric): "success" | "info" | "warning" | "default" {
  if (metric.trend === "flat") return "info";
  const towardTarget =
    metric.unit === "days"
      ? metric.current <= metric.target
      : metric.current >= metric.target;
  if (towardTarget) return "success";
  return "info";
}

interface OutcomesViewProps {
  snapshot: PortalSnapshot;
  membership: MembershipContext;
}

export function OutcomesView({ snapshot, membership: _membership }: OutcomesViewProps) {
  const { metrics: mockMetrics, evidence: mockEvidence } = snapshot;
  const adoption = mockMetrics.find((m) => m.key === "adoption");
  const capability = mockMetrics.find((m) => m.key === "capability-score");
  const governance = mockMetrics.find((m) => m.key === "governance-readiness");
  const trendSeries = adoption?.series.map((point, idx) => ({
    period: point.period,
    adoption: point.value,
    capability: capability?.series[idx]?.value ?? 0,
    governance: governance?.series[idx]?.value ?? 0,
  })) ?? [];

  const cycleTime = mockMetrics.find((m) => m.key === "cycle-time");
  const reviewVelocity = mockMetrics.find((m) => m.key === "review-velocity");
  const decisionCycle = mockMetrics.find((m) => m.key === "decision-approval-cycle");
  const cycleSeries = cycleTime?.series.map((point, idx) => ({
    period: point.period,
    "Decision cycle": point.value,
    "Artifact review": reviewVelocity?.series[idx]?.value ?? 0,
    "Approval cycle": decisionCycle?.series[idx]?.value ?? 0,
  })) ?? [];

  const beforeAfterEvidence = mockEvidence.filter((e) => e.kind === "metric" || e.kind === "workflow-log").slice(0, 4);

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Outcome Evidence"
        title="What's actually changing"
        description="Before / after evidence on adoption, capability, cycle time, and governance readiness."
        badge="Q2 2026"
        badgeVariant="success"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mockMetrics.slice(0, 8).map((metric) => (
            <DashboardCard key={metric.id} id={`kpi-${metric.id}`} eyebrow="OUTCOME" title={metric.label}>
              <KpiTile
                label={`baseline ${metric.baseline}${unitSuffix(metric.unit)}`}
                value={`${metric.current}${unitSuffix(metric.unit)}`}
                trend={metric.trend}
                trendValue={metric.trendValue}
                trendLabel={`target ${metric.target}${unitSuffix(metric.unit)}`}
                status={kpiStatus(metric)}
              />
            </DashboardCard>
          ))}
        </div>

        {/* Trend chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 min-h-[300px]">
            <DashboardCard
              id="trend-compounding"
              eyebrow="COMPOUNDING SIGNALS"
              title="Adoption · Capability · Governance"
              subtitle="Three drivers of compounding intelligence over the 8-week program window."
              bodyClassName="overflow-hidden p-2"
            >
              <AreaChartViz
                data={trendSeries}
                xKey="period"
                areas={[
                  { key: "adoption",    color: CHART_COLORS[0], label: "Adoption" },
                  { key: "capability",  color: CHART_COLORS[3], label: "Capability" },
                  { key: "governance",  color: CHART_COLORS[1], label: "Governance" },
                ]}
              />
            </DashboardCard>
          </div>
          <div className="min-h-[300px]">
            <DashboardCard
              id="narrative"
              eyebrow="EXECUTIVE NARRATIVE"
              title="What this means for the SteerCo"
              agentId="agent-report-builder"
              agentState="idle"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="px-3 py-3 space-y-2 text-xs text-[--text-secondary] leading-relaxed">
                  <p>
                    Eight weeks in, every leading indicator is moving in the right direction. Adoption is up 37 points on a 34-point baseline. Capability has crossed 70 for the first time across cohorts 1 and 2. Governance readiness is on track to clear 90 by quarter close.
                  </p>
                  <p>
                    The compounding metric — canonical knowledge density — has more than quadrupled. Three artifacts have been promoted to canonical (Governance Framework, Risk Register, Curriculum). The next promotion candidates are the Operating Model Blueprint and the Decision Architecture.
                  </p>
                  <p>
                    Cycle metrics tell a sharper story than the headline KPIs. Decision cycle time is down 55%, artifact review velocity is down 62%. The portal is paying for itself in calendar weeks per quarter.
                  </p>
                </div>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>

        {/* Cycle time chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 min-h-[260px]">
            <DashboardCard
              id="cycle-chart"
              eyebrow="CYCLE TIME"
              title="Decision · review · approval — falling, on plan"
              subtitle="Lower is better. Target lines are the SteerCo commitments."
              bodyClassName="overflow-hidden p-2"
            >
              <LineChartViz
                data={cycleSeries}
                xKey="period"
                lines={[
                  { key: "Decision cycle",   color: CHART_COLORS[0], label: "Decision cycle" },
                  { key: "Artifact review",  color: CHART_COLORS[1], label: "Artifact review" },
                  { key: "Approval cycle",   color: CHART_COLORS[3], label: "Approval cycle" },
                ]}
              />
            </DashboardCard>
          </div>
          <div className="min-h-[260px]">
            <DashboardCard
              id="before-after"
              eyebrow="BEFORE / AFTER EVIDENCE"
              title="Sources behind the numbers"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {beforeAfterEvidence.map((ev) => (
                    <li key={ev.id} className="flex flex-col gap-0.5 px-3 py-2">
                      <p className="text-xs font-semibold text-[--text-primary] leading-snug">{ev.title}</p>
                      <p className="text-xs text-[--text-muted] leading-snug">{ev.snippet}</p>
                      <p className="text-xs text-[--text-muted]">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        {ev.source}
                      </p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>
      </div>
    </div>
  );
}
