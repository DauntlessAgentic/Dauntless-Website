"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Layers, Network } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { Progress } from "@/components/ui/progress";

import type { MembershipContext } from "@/lib/auth/session";
import type { OrgRollup, WorkspaceSummary } from "@/lib/portal/org-rollup";

interface OrgRollupViewProps {
  rollup: OrgRollup;
  membership: MembershipContext;
}

const HEALTH_TONE: Record<WorkspaceSummary["health"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  healthy: "success",
  watch: "info",
  "at-risk": "warning",
};

export function OrgRollupView({ rollup, membership }: OrgRollupViewProps) {
  const { organization, workspaces, totals, dependencies } = rollup;

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Organization Rollup"
        title={`${organization.name}`}
        description={`${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"} · ${organization.sector}.`}
        badge={`org health ${totals.healthScore}`}
        badgeVariant={totals.healthScore >= 70 ? "success" : totals.healthScore >= 45 ? "info" : "warning"}
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Active workspace <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile icon={Building2} label="Workspaces" value={`${workspaces.length}`} sub={`${workspaces.filter((w) => w.active).length} active session`} />
          <Tile icon={Layers} label="Engagements" value={`${totals.engagements}`} sub="across all workspaces" />
          <Tile icon={Network} label="Pending decisions" value={`${totals.pendingDecisions}`} sub="org-wide" />
          <Tile icon={Building2} label="Canonical artifacts" value={`${totals.canonicalArtifacts}`} sub="reusable across workspaces" />
        </div>

        <DashboardCard
          id="org-workspaces"
          eyebrow="WORKSPACES"
          title="Per-workspace health"
          subtitle="Active workspace is highlighted. Phase 8.1 will wire the switcher to swap the live repository workspace."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[480px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {workspaces.map((w) => (
                <li
                  key={w.id}
                  className={`flex flex-col gap-2 px-3 py-3 ${w.active ? "bg-[--accent-dim]" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                    <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{w.name}</p>
                    {w.active && (
                      <ContentTag variant="accent" dot>
                        active
                      </ContentTag>
                    )}
                    <ContentTag variant={HEALTH_TONE[w.health]} dot>
                      {w.health}
                    </ContentTag>
                    <ContentTag variant="default">{w.visibility}</ContentTag>
                  </div>
                  <p className="text-xs text-[--text-muted] leading-snug">{w.trustBadge}</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <Stat label="Engagements" value={`${w.engagements.total}`} sub={`${w.engagements.active} active · ${w.engagements.blocked} blocked`} />
                    <Stat label="Pending decisions" value={`${w.decisions.pending}`} />
                    <Stat label="Approved (30d)" value={`${w.decisions.approvedLast30d}`} />
                    <Stat label="Canonical" value={`${w.artifacts.canonical}`} sub={`${w.artifacts.inReview} in review`} />
                    <Stat label="Agent runs" value={`${w.recentAgentRuns}`} sub="last 50 audit entries" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-[--text-muted]">Health score</span>
                    <Progress value={w.healthScore} color={w.health === "at-risk" ? "warning" : w.health === "watch" ? "accent" : "success"} />
                    <span className="text-xs font-mono tabular-nums text-[--text-primary]">{w.healthScore}</span>
                  </div>
                  {w.primaryEngagementName && (
                    <p className="text-xs text-[--text-secondary] leading-snug">
                      Primary engagement · <span className="font-mono">{w.primaryEngagementName}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="org-dependencies"
          eyebrow="CROSS-WORKSPACE DEPENDENCIES"
          title="Where workspaces lean on each other"
          subtitle="Phase 8.0 ships an editorial set; Phase 8.1 derives dependencies from artifact citation graphs."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[260px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {dependencies.map((d, idx) => (
                <li key={`${d.fromWorkspaceId}-${d.toWorkspaceId}-${idx}`} className="flex flex-col gap-1 px-3 py-2">
                  <div className="flex items-center gap-2 text-xs">
                    <code className="font-mono text-[--accent-vivid]">{d.fromWorkspaceId}</code>
                    <ArrowRight className="h-3 w-3 text-[--text-muted]" />
                    <code className="font-mono text-[--accent-vivid]">{d.toWorkspaceId}</code>
                  </div>
                  <p className="text-xs text-[--text-secondary] leading-snug">{d.summary}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>

        <p className="text-xs text-[--text-muted] leading-snug">
          {membership.role === "owner"
            ? "Owner view — you see every workspace under this org. Phase 8.1 will gate visibility by Membership.scopes."
            : `Read-only org rollup for ${membership.role}. Drill-in to the active workspace via the top action.`}
        </p>
      </div>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <DashboardCard id={`tile-${label}`} eyebrow="ORG" title={label}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[--radius-md] bg-[--accent-dim] border border-[--border-active] shrink-0">
          <Icon className="h-4 w-4 text-[--accent-vivid]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold tabular-nums text-[--text-primary] leading-none">{value}</p>
          <p className="text-xs text-[--text-muted] mt-1 leading-snug">{sub}</p>
        </div>
      </div>
    </DashboardCard>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
      <p className="text-xs uppercase tracking-widest text-[--text-muted]">{label}</p>
      <p className="text-xs text-[--text-primary] font-mono tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[--text-muted] leading-snug">{sub}</p>}
    </div>
  );
}
