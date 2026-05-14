"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Download, ShieldCheck, Sparkles } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { ArtifactMarkdown } from "@/components/patterns/artifact-markdown";

import type { MembershipContext } from "@/lib/auth/session";
import type { ImpactReportOutput } from "@/lib/portal/telemetry/impact-report";
import { runReportBuilderAction } from "@/lib/portal/agents/actions-impact";
import type { AgentRunSummary } from "@/lib/portal/agents/actions";
import { exportSignedImpactReport } from "@/lib/portal/exports/actions";

interface ImpactReportViewProps {
  report: ImpactReportOutput;
  membership: MembershipContext;
}

export function ImpactReportView({ report, membership }: ImpactReportViewProps) {
  const canRunAgent =
    membership.role === "owner" || membership.role === "executive" || membership.role === "lead";
  const [isPending, startTransition] = useTransition();
  const [agentRun, setAgentRun] = useState<AgentRunSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, startExport] = useTransition();

  const handleSignedExport = () => {
    setError(null);
    startExport(async () => {
      try {
        const signed = await exportSignedImpactReport();
        downloadFile(signed.markdown, signed.filename);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signed export failed.");
      }
    });
  };

  const handleAgent = () => {
    setError(null);
    startTransition(async () => {
      try {
        const summary = await runReportBuilderAction({
          prompt: `Use the Quarterly Impact Report data on the page to draft a refreshed Impact Report artifact. Cite at least two evidence rows. Risk tier "medium".`,
        });
        setAgentRun(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Report Builder run failed.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Outcome evidence"
        title="Quarterly Impact Report"
        description={`Assembled from the portal telemetry bus. Window: last ${report.input.horizonDays} days. Generated ${report.input.generatedAt.toLocaleString()}.`}
        badge="Live"
        badgeVariant="accent"
        actions={
          <Link
            href="/portal/outcomes"
            className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" /> Outcomes
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Tile
            label="Decisions proposed"
            value={report.input.agentActivity.decisionsProposed}
            prior={report.input.priorAgentActivity?.decisionsProposed}
            windowDays={report.input.horizonDays}
          />
          <Tile
            label="Canonical promotions"
            value={report.input.agentActivity.canonicalPromotions}
            prior={report.input.priorAgentActivity?.canonicalPromotions}
            windowDays={report.input.horizonDays}
          />
          <Tile
            label="Agent runs"
            value={report.input.agentActivity.totalRuns}
            prior={report.input.priorAgentActivity?.totalRuns}
            windowDays={report.input.horizonDays}
          />
          <Tile
            label="Handoffs"
            value={report.input.agentActivity.handoffs}
            prior={report.input.priorAgentActivity?.handoffs}
            windowDays={report.input.horizonDays}
          />
        </div>

        <DashboardCard
          id="impact-report-narrative"
          eyebrow="REPORT"
          title="Board-ready narrative"
          subtitle="Generated deterministically from telemetry. The Report Builder agent can produce a richer prose draft on demand."
          actions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5"
                disabled={!canRunAgent || isPending}
                onClick={handleAgent}
              >
                <Sparkles className="h-3 w-3" />
                {isPending ? "Drafting…" : "Draft via Report Builder"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => downloadMarkdown(report.markdown)}
                title="Plain Markdown for sharing in Slack or email. Not an official record."
              >
                <Download className="h-3 w-3" />
                Quick copy
              </Button>
              <Link
                href="/portal/outcomes/impact-report/preview"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[--radius-md] text-xs text-[--text-primary] bg-[--elevated] border border-[--border-subtle] hover:border-[--border-default] transition-colors"
                title="Preview the signed bundle in the portal first. Auditor-ready watermark visible."
              >
                <ShieldCheck className="h-3 w-3" />
                Preview & download (signed)
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                disabled={isExporting}
                onClick={handleSignedExport}
                title="Skip the preview and download the tamper-evident bundle directly."
              >
                <Download className="h-3 w-3" />
                {isExporting ? "Signing…" : "Quick signed download"}
              </Button>
            </div>
          }
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[60vh]">
            <div className="px-3 py-3">
              <ArtifactMarkdown body={report.markdown} evidenceById={new Map()} />
            </div>
          </ScrollArea>
        </DashboardCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard
            id="impact-report-metrics"
            eyebrow="DERIVED METRICS"
            title="Computed from the event bus"
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[320px]">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {report.input.metrics.map((m) => (
                  <li key={m.key} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ContentTag variant={m.trend === "up" ? "success" : m.trend === "down" ? "warning" : "default"} dot>
                        {m.trend}
                      </ContentTag>
                      <p className="flex-1 text-xs font-semibold text-[--text-primary]">{m.label}</p>
                      <span className="text-xs font-mono tabular-nums text-[--text-primary]">{m.trendValue}</span>
                    </div>
                    <p className="text-xs text-[--text-muted] leading-snug">{m.narrative}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>

          <DashboardCard
            id="impact-report-events"
            eyebrow="RECENT EVENTS"
            title={`${report.input.recentEvents.length} events in window`}
            subtitle="Live trail. Phase 6.1 will persist this onto an events table."
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[320px]">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {report.input.recentEvents.length === 0 ? (
                  <li className="px-3 py-6 text-center text-xs text-[--text-muted]">
                    No events recorded yet in this server process. Trigger a few agents to seed.
                  </li>
                ) : (
                  report.input.recentEvents.slice(0, 30).map((e) => (
                    <li key={e.id} className="flex items-center gap-2 px-3 py-2">
                      <ContentTag variant={ENTITY_TONE[e.kind] ?? "default"}>{e.kind}</ContentTag>
                      <p className="text-xs text-[--text-secondary] flex-1 truncate">{e.actor}</p>
                      <span className="text-xs font-mono tabular-nums text-[--text-muted]">
                        {e.at.toLocaleTimeString()}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>

        {agentRun && (
          <DashboardCard
            id="impact-report-agent-run"
            eyebrow="REPORT BUILDER"
            title={`Last run: ${agentRun.status}`}
            subtitle={`${agentRun.model} · ${agentRun.costUsd} · cache ${Math.round(agentRun.cacheHitRate * 100)}%`}
            agentId={agentRun.agentId}
            agentState={agentRun.status === "errored" ? "blocked" : "complete"}
          >
            <div className="px-3 py-2.5 text-xs space-y-1.5 text-[--text-secondary] leading-snug">
              <p>{agentRun.summary}</p>
              {agentRun.toolCalls.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {agentRun.toolCalls.map((t, idx) => (
                    <ContentTag
                      key={`${t.tool}-${idx}`}
                      variant={t.isError ? "danger" : "info"}
                    >
                      {t.tool}
                    </ContentTag>
                  ))}
                </div>
              )}
            </div>
          </DashboardCard>
        )}

        {error && (
          <p className="text-xs text-[--danger]">{error}</p>
        )}
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  prior,
  windowDays = 28,
}: {
  label: string;
  value: number;
  prior?: number;
  windowDays?: number;
}) {
  const delta = prior !== undefined ? value - prior : undefined;
  const arrow = delta === undefined ? "—" : delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
  const tone =
    delta === undefined || delta === 0
      ? "text-[--text-muted]"
      : delta > 0
      ? "text-[--success]"
      : "text-[--warning]";
  return (
    <DashboardCard id={`tile-${label}`} eyebrow="ACTIVITY" title={label}>
      <div className="px-3 py-2.5">
        <p className="text-2xl font-bold tabular-nums text-[--text-primary] leading-none">
          {value}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          {prior !== undefined && (
            <span className={`text-xs font-mono tabular-nums ${tone}`} aria-label={`Change vs. prior ${windowDays} days`}>
              {arrow} {Math.abs(delta ?? 0)} vs. prior {windowDays}d
            </span>
          )}
          {prior === undefined && (
            <span className="text-xs text-[--text-muted]">Last {windowDays} days</span>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}

const ENTITY_TONE: Record<string, React.ComponentProps<typeof ContentTag>["variant"]> = {
  "decision-proposed":            "accent",
  "decision-outcome-recorded":    "success",
  "knowledge-promoted":           "success",
  "artifact-promoted-canonical":  "success",
  "artifact-saved":               "default",
  "artifact-version-minted":      "accent",
  "canonical-proposal-submitted": "info",
  "canonical-audit-verdict":      "warning",
  "agent-run-completed":          "info",
  "agent-handoff":                "default",
  "comment-posted":               "default",
};

function downloadMarkdown(markdown: string) {
  downloadFile(markdown, `impact-report-${new Date().toISOString().slice(0, 10)}.md`);
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
