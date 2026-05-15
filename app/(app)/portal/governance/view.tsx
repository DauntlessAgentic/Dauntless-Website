"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Shield, ShieldAlert, ShieldCheck, Users, FileLock2, Download } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import type { PortalSnapshot, RiskTier } from "@/lib/portal/types";
import type { MembershipContext } from "@/lib/auth/session";
import type { RepositoryActivationStatus } from "@/lib/portal/repositories";
import { describeRole, roleBadgeTone, roleDisplayLabel } from "@/lib/auth/membership-gate";
import { exportSignedAuditLog } from "@/lib/portal/exports/actions";
import { ActorBadge } from "@/components/patterns/actor-badge";

const RISK_TONE: Record<RiskTier, React.ComponentProps<typeof ContentTag>["variant"]> = {
  low:    "default",
  medium: "info",
  high:   "warning",
};

interface AgentRunSummaryProps {
  id: string;
  agentId: string;
  finishedAt: Date;
  model: string;
  status: "completed" | "errored" | "stub";
  proposedDecisionId?: string;
  inputTokens: number;
  outputTokens: number;
  cacheHitRate: number;
  totalUsd: number;
  notes?: string;
  error?: string;
}

interface AgentTelemetrySummary {
  totalRuns: number;
  completedRuns: number;
  erroredRuns: number;
  totalCostUsd: number;
  averageCacheHitRate: number;
  averageInputTokens: number;
  decisionsProposed: number;
}

interface PerAgentTelemetryProps {
  agentId: string;
  runs: number;
  decisionsProposed: number;
  totalCostUsd: number;
  averageCacheHitRate: number;
  lastRunAt?: Date;
  hasError: boolean;
}

interface ConnectorRow {
  id: string;
  label: string;
  enabled: boolean;
}

interface ControlRow {
  id: string;
  title: string;
  status: "pass" | "partial" | "gap";
  detail: string;
}

interface ControlsInForceProps {
  generatedAt: string;
  rows: ControlRow[];
  summary: { passCount: number; partialCount: number; gapCount: number };
}

type FreezeStatus =
  | { frozen: true; frozenBy: string; frozenAt: string; reason: string }
  | { frozen: false };

interface GovernanceViewProps {
  snapshot: PortalSnapshot;
  membership: MembershipContext;
  activationStatus: RepositoryActivationStatus;
  agentTelemetry: AgentTelemetrySummary;
  agentRuns: AgentRunSummaryProps[];
  perAgentTelemetry: PerAgentTelemetryProps[];
  controls: ControlsInForceProps;
  freezeStatus: FreezeStatus;
  connectors: ConnectorRow[];
  enabledConnectors: string[];
}

export function GovernanceView({
  snapshot,
  membership,
  activationStatus,
  agentTelemetry,
  agentRuns,
  perAgentTelemetry,
  controls,
  freezeStatus,
  connectors,
  enabledConnectors,
}: GovernanceViewProps) {
  const {
    auditLog: mockAuditLog,
    memberships: mockMemberships,
    decisions: mockDecisions,
  } = snapshot;
  const [isExporting, startExport] = useTransition();
  const [exportError, setExportError] = useState<string | null>(null);

  const handleSignedExport = () => {
    setExportError(null);
    startExport(async () => {
      try {
        const signed = await exportSignedAuditLog();
        const blob = new Blob([signed.markdown], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = signed.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        setExportError(err instanceof Error ? err.message : "Signed export failed.");
      }
    });
  };
  const decisionsByTier = (["high", "medium", "low"] as const).map((tier) => ({
    tier,
    count: mockDecisions.filter((d) => d.riskTier === tier).length,
    pending: mockDecisions.filter((d) => d.riskTier === tier && d.status === "pending-approval").length,
  }));

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Governance Layer"
        title="Trust architecture · audit · controls"
        description="Every action — agent or human — is traced, tiered, and replayable."
        badge="Protected B"
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">

        {/* Controls in force — advisory-board action #15 */}
        <DashboardCard
          id="controls-in-force"
          eyebrow="CONTROLS IN FORCE"
          title="Posture right now — plain English"
          subtitle={`${controls.summary.passCount} pass · ${controls.summary.partialCount} partial · ${controls.summary.gapCount} gap · refreshed ${new Date(controls.generatedAt).toLocaleString()}`}
          badge={controls.summary.gapCount > 0 ? "Gap" : controls.summary.partialCount > 0 ? "Partial" : "Pass"}
          badgeVariant={controls.summary.gapCount > 0 ? "warning" : controls.summary.partialCount > 0 ? "info" : "success"}
        >
          <ul className="flex flex-col divide-y divide-[--border-subtle]">
            {controls.rows.map((row) => (
              <li key={row.id} className="flex items-start gap-3 px-3 py-2">
                <ContentTag
                  variant={row.status === "pass" ? "success" : row.status === "partial" ? "info" : "warning"}
                  dot
                >
                  {row.status}
                </ContentTag>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[--text-primary]">{row.title}</p>
                  <p className="text-xs text-[--text-muted] leading-snug">{row.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </DashboardCard>

        {/* Outbound action gates — connectors + freeze switch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard
            id="connectors-enabled"
            eyebrow="CONNECTORS"
            title={`${enabledConnectors.length} of ${connectors.length} enabled`}
            subtitle="Workspace must explicitly enable each connector. Add a connector → Outbound Actions sandbox unlocks it."
            badge={connectors.length === enabledConnectors.length ? "All" : `${enabledConnectors.length}/${connectors.length}`}
            badgeVariant="default"
          >
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {connectors.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-3 py-2 text-xs">
                  <ContentTag variant={c.enabled ? "success" : "default"} dot>
                    {c.enabled ? "enabled" : "off"}
                  </ContentTag>
                  <span className="flex-1 text-[--text-primary] font-medium">{c.label}</span>
                  <span className="text-[--text-muted] font-mono">{c.id}</span>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard
            id="freeze-status"
            eyebrow="SAFETY SWITCH"
            title={freezeStatus.frozen ? "Outbound actions frozen" : "Outbound actions live"}
            subtitle="One-click freeze available on the Help → Something went wrong page."
            badge={freezeStatus.frozen ? "Frozen" : "Live"}
            badgeVariant={freezeStatus.frozen ? "warning" : "success"}
          >
            <div className="px-3 py-3 text-xs space-y-1.5 text-[--text-secondary] leading-snug">
              {freezeStatus.frozen ? (
                <>
                  <p>
                    <span className="font-semibold text-[--warning]">Frozen by:</span> {freezeStatus.frozenBy}
                  </p>
                  <p>
                    <span className="font-semibold">When:</span> {new Date(freezeStatus.frozenAt).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Reason:</span> <span className="italic">{freezeStatus.reason}</span>
                  </p>
                  <Link
                    href="/portal/help/something-went-wrong"
                    className="inline-flex items-center gap-1 text-[--accent-vivid] hover:underline"
                  >
                    Manage the freeze <ArrowRight className="h-3 w-3" />
                  </Link>
                </>
              ) : (
                <>
                  <p>All approved outbound actions can execute. Agents and humans can both commit.</p>
                  <Link
                    href="/portal/help/something-went-wrong"
                    className="inline-flex items-center gap-1 text-[--accent-vivid] hover:underline"
                  >
                    Freeze workspace <ArrowRight className="h-3 w-3" />
                  </Link>
                </>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Repository activation + identity status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard
            id="repository-activation"
            eyebrow="DATA LAYER"
            title={activationStatus.isHosted ? "Persisted (hosted)" : "In-memory seed"}
            subtitle={activationStatus.repositoryId}
            badge={activationStatus.isHosted ? "Hosted" : "Ephemeral"}
            badgeVariant={activationStatus.isHosted ? "success" : "warning"}
          >
            <div className="px-3 py-2.5 space-y-2">
              <p className="text-xs text-[--text-secondary] leading-snug">{activationStatus.notes}</p>
              {activationStatus.configGaps.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {activationStatus.configGaps.map((gap) => (
                    <li key={gap} className="rounded-[--radius-md] bg-[--warning-dim] border border-[color:rgba(245,158,11,0.3)] px-2 py-1.5 text-xs text-[--warning] leading-snug">
                      {gap}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DashboardCard>

          <DashboardCard
            id="identity-status"
            eyebrow="IDENTITY"
            title="Active membership"
            subtitle={membership.source === "dev-bypass" ? "Dev-bypass active" : "OAuth"}
            badge={roleDisplayLabel(membership.role)}
            badgeVariant={roleBadgeTone(membership.role)}
          >
            <div className="px-3 py-2.5 space-y-1.5">
              <p className="text-xs text-[--text-primary] font-semibold leading-snug">{membership.displayName}</p>
              <p className="text-xs text-[--text-muted] leading-snug">{describeRole(membership.role)}</p>
              <p className="text-xs text-[--text-muted] leading-snug">
                Status: <span className="font-mono">{membership.status}</span>
                {membership.status === "dev-bypass" && " · use the TopBar switcher to impersonate other roles."}
              </p>
            </div>
          </DashboardCard>
        </div>

        {/* Agent runtime telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <DashboardCard
            id="agent-cost"
            eyebrow="AGENT RUNTIME"
            title="Cost & cache health"
            subtitle="Last 50 Engagement Analyst runs · Phase 3 telemetry"
            badge={agentTelemetry.totalRuns === 0 ? "No runs yet" : `${agentTelemetry.totalRuns} runs`}
            badgeVariant={agentTelemetry.erroredRuns > 0 ? "warning" : "accent"}
          >
            <div className="px-3 py-2.5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-2xl font-bold tabular-nums text-[--text-primary] leading-none">
                  ${agentTelemetry.totalCostUsd.toFixed(4)}
                </p>
                <p className="text-xs uppercase tracking-widest text-[--text-muted] mt-1">Spend</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-[--text-primary] leading-none">
                  {Math.round(agentTelemetry.averageCacheHitRate * 100)}%
                </p>
                <p className="text-xs uppercase tracking-widest text-[--text-muted] mt-1">Cache hit rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-[--text-primary] leading-none">
                  {agentTelemetry.decisionsProposed}
                </p>
                <p className="text-xs uppercase tracking-widest text-[--text-muted] mt-1">Decisions proposed</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-[--text-primary] leading-none">
                  {Math.round(agentTelemetry.averageInputTokens)}
                </p>
                <p className="text-xs uppercase tracking-widest text-[--text-muted] mt-1">Avg input tokens</p>
              </div>
            </div>
          </DashboardCard>

          <div className="lg:col-span-2">
            <DashboardCard
              id="agent-runs-recent"
              eyebrow="RECENT AGENT RUNS"
              title="Trace · model · cost · proposal"
              subtitle="Every run is auditable. Click a proposed decision to review it in the Register."
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full max-h-[260px]">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {agentRuns.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-[--text-muted]">
                      No agent runs recorded in this server process yet. Trigger one from the Agents page.
                    </li>
                  ) : (
                    agentRuns.map((run) => (
                      <li key={run.id} className="flex flex-col gap-1 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <ContentTag
                            variant={run.status === "errored" ? "danger" : run.status === "completed" ? "success" : "accent"}
                            dot
                          >
                            {run.status}
                          </ContentTag>
                          <p className="text-xs font-semibold text-[--text-primary] flex-1 truncate">
                            {run.agentId} · {run.model}
                          </p>
                          <span className="text-xs font-mono tabular-nums text-[--text-muted]">
                            {relativeAgo(run.finishedAt)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[--text-muted]">
                          <span>${run.totalUsd.toFixed(4)}</span>
                          <span>{run.inputTokens} in / {run.outputTokens} out</span>
                          <span>cache {Math.round(run.cacheHitRate * 100)}%</span>
                          {run.proposedDecisionId && (
                            <Link
                              href="/portal/decisions"
                              className="text-[--accent-vivid] hover:underline font-mono"
                            >
                              {run.proposedDecisionId}
                            </Link>
                          )}
                        </div>
                        {run.notes && (
                          <p className="text-xs text-[--text-secondary] leading-snug">{run.notes}</p>
                        )}
                        {run.error && (
                          <p className="text-xs text-[--danger] leading-snug">{run.error}</p>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>

        {/* Per-agent fleet telemetry */}
        <DashboardCard
          id="agent-fleet-telemetry"
          eyebrow="FLEET TELEMETRY"
          title="Cost + run health by agent"
          subtitle="Phase 5 separation-of-powers means every archetype has a separate ledger. Use this to spot agents that haven't run, agents that error, and where cost concentrates."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[320px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[--panel-bg] z-10">
                <tr className="border-b border-[--border-subtle]">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Agent</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Runs</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Decisions</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Cost</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Cache</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Last run</th>
                </tr>
              </thead>
              <tbody>
                {perAgentTelemetry.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-xs text-[--text-muted]">
                      No agent runs recorded in this server process yet.
                    </td>
                  </tr>
                ) : (
                  perAgentTelemetry.map((row) => (
                    <tr key={row.agentId} className="border-b border-[--border-subtle] hover:bg-[--elevated] transition-colors">
                      <td className="px-3 py-2 text-[--text-primary] font-mono">{row.agentId}</td>
                      <td className="px-3 py-2 text-[--text-primary]">{row.runs}</td>
                      <td className="px-3 py-2 text-[--text-primary]">{row.decisionsProposed}</td>
                      <td className="px-3 py-2 text-[--text-primary] font-mono tabular-nums">${row.totalCostUsd.toFixed(4)}</td>
                      <td className="px-3 py-2 text-[--text-primary] tabular-nums">{Math.round(row.averageCacheHitRate * 100)}%</td>
                      <td className="px-3 py-2 text-[--text-muted] font-mono tabular-nums">
                        {row.lastRunAt ? relativeAgo(row.lastRunAt) : "—"}
                        {row.hasError && (
                          <ContentTag variant="danger" className="ml-1.5">
                            errors
                          </ContentTag>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ScrollArea>
        </DashboardCard>

        {/* Tier breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {decisionsByTier.map(({ tier, count, pending }) => (
            <DashboardCard
              key={tier}
              id={`tier-${tier}`}
              eyebrow="RISK TIER"
              title={`${tier.charAt(0).toUpperCase()}${tier.slice(1)} tier`}
              badge={pending > 0 ? `${pending} pending` : "Quiet"}
              badgeVariant={pending > 0 ? "warning" : "default"}
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[--radius-md] bg-[--accent-dim] border border-[--border-active] shrink-0">
                  {tier === "high" ? <ShieldAlert className="h-4 w-4 text-[--warning]" />
                    : tier === "medium" ? <ShieldCheck className="h-4 w-4 text-[--info]" />
                    : <Shield className="h-4 w-4 text-[--text-muted]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold tabular-nums text-[--text-primary] leading-none">{count}</p>
                  <p className="text-xs text-[--text-muted] mt-1 leading-snug">
                    decisions at this tier · gating policy applies
                  </p>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Audit log */}
          <div className="lg:col-span-2 min-h-[460px]">
            <DashboardCard
              id="audit-log"
              eyebrow="AUDIT LOG"
              title="Every action — agent or human"
              subtitle={`${mockAuditLog.length} entries · ordered most-recent first`}
              actions={
                <Button
                  variant="ghost"
                  size="xs"
                  className="gap-1"
                  disabled={isExporting}
                  onClick={handleSignedExport}
                  title="Tamper-evident bundle, watermarked with your identity. Audit-grade — share with procurement or compliance."
                >
                  <Download className="h-3 w-3" /> {isExporting ? "Signing…" : "Official record (signed)"}
                </Button>
              }
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[--panel-bg] z-10">
                    <tr className="border-b border-[--border-subtle]">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">When</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Action</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Actor</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Tier</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...mockAuditLog].sort((a, b) => b.at.getTime() - a.at.getTime()).map((entry) => (
                      <tr key={entry.id} className="border-b border-[--border-subtle] hover:bg-[--elevated] transition-colors">
                        <td className="px-3 py-2 text-[--text-muted] font-mono tabular-nums">{relativeAgo(entry.at)}</td>
                        <td className="px-3 py-2 text-[--text-primary]">{entry.action.replace("-", " ")}</td>
                        <td className="px-3 py-2 text-[--text-secondary]">
                          <ActorBadge kind={entry.actorKind} name={entry.actor} />
                        </td>
                        <td className="px-3 py-2"><ContentTag variant={RISK_TONE[entry.riskTier]} dot>{entry.riskTier}</ContentTag></td>
                        <td className="px-3 py-2 text-[--text-muted] leading-snug">{entry.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </DashboardCard>
            {exportError && (
              <p className="text-xs text-[--danger] mt-2">{exportError}</p>
            )}
          </div>

          {/* Access roster */}
          <div className="min-h-[460px] flex flex-col gap-3">
            <DashboardCard
              id="access-roster"
              eyebrow="ACCESS REVIEW"
              title="Who can see what"
              subtitle={`${mockMemberships.length} memberships`}
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {mockMemberships.map((m) => (
                    <li key={m.userId} className="flex items-center gap-2 px-3 py-2">
                      <Users className="h-3.5 w-3.5 text-[--text-muted] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[--text-primary] truncate">{m.userName}</p>
                        <p className="text-xs text-[--text-muted]">Joined {daysAgo(m.joinedAt)}d ago</p>
                      </div>
                      <ContentTag variant={m.role === "auditor" ? "warning" : m.role === "owner" ? "accent" : "default"}>{m.role}</ContentTag>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </DashboardCard>

            <DashboardCard
              id="retention"
              eyebrow="RETENTION & EVIDENCE"
              title="Retention controls"
              subtitle="Default policy · per-engagement overrides"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="px-3 py-2 space-y-2 text-xs">
                  <li className="flex items-start gap-2 text-[--text-secondary]">
                    <FileLock2 className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0 mt-0.5" />
                    <span><strong className="text-[--text-primary]">7-year</strong> retention on all approved decisions and the evidence cited by them.</span>
                  </li>
                  <li className="flex items-start gap-2 text-[--text-secondary]">
                    <FileLock2 className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0 mt-0.5" />
                    <span><strong className="text-[--text-primary]">3-year</strong> retention on artifact versions superseded by a newer canonical.</span>
                  </li>
                  <li className="flex items-start gap-2 text-[--text-secondary]">
                    <FileLock2 className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0 mt-0.5" />
                    <span>Audit log is <strong className="text-[--text-primary]">append-only</strong>; exports are watermarked and tied to the requesting member.</span>
                  </li>
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function relativeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function daysAgo(date: Date): number {
  return Math.round((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}
