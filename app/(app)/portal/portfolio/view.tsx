"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Coins, Flame, Sparkles } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { Progress } from "@/components/ui/progress";

import type { MembershipContext } from "@/lib/auth/session";
import type {
  InternalDecision,
  PortfolioAccount,
  PortfolioEmergentPattern,
} from "@/lib/portal/portfolio/types";
import type { PortfolioTotals } from "@/lib/portal/portfolio";

interface PortfolioViewProps {
  accounts: PortfolioAccount[];
  totals: PortfolioTotals;
  patterns: PortfolioEmergentPattern[];
  internalDecisions: InternalDecision[];
  membership: MembershipContext;
}

const CHURN_TONE: Record<PortfolioAccount["churnRisk"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  low: "success",
  watch: "info",
  elevated: "warning",
  critical: "danger",
};

const TIER_TONE: Record<PortfolioAccount["tier"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  starter: "default",
  core: "info",
  advanced: "accent",
  strategic: "success",
};

const DECISION_TONE: Record<InternalDecision["status"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  "pending-approval": "info",
  approved: "success",
  deferred: "warning",
  rejected: "danger",
};

function dollars(n: number): string {
  return `$${(n / 1000).toFixed(1)}k`;
}

export function PortfolioView({
  accounts,
  totals,
  patterns,
  internalDecisions,
}: PortfolioViewProps) {
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Dauntless Portfolio · Internal"
        title="Firm-level cockpit across every client workspace"
        description="Consent-gated rollup. Phase 14.0 ships the surface + the internal decision register; Phase 14.1 wires real per-workspace telemetry."
        badge={`${accounts.length} accounts · ${dollars(totals.monthlyRecurringUsd)} MRR`}
        badgeVariant="accent"
        actions={
          <Link href="/portal/org" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Org rollup <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile icon={Coins} label="MRR" value={dollars(totals.monthlyRecurringUsd)} sub={`Gross margin ${dollars(totals.grossMarginUsd)}`} />
          <Tile icon={Briefcase} label="Engagements (active)" value={`${totals.totalEngagementsActive}`} sub={`${accounts.length} accounts`} />
          <Tile icon={Flame} label="At-risk accounts" value={`${totals.accountsAtRisk}`} sub={`Avg health ${totals.averageHealthScore}`} />
          <Tile icon={Sparkles} label="Emergent patterns" value={`${patterns.length}`} sub={`${patterns.filter((p) => p.recommendedAction === "promote-to-federation").length} ready for federation`} />
        </div>

        <DashboardCard
          id="portfolio-accounts"
          eyebrow="ACCOUNTS"
          title="Per-account health + margin"
          subtitle="Sortable by churn risk in Phase 14.1. Today: arrival order, by health descending."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[460px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[--panel-bg] z-10">
                <tr className="border-b border-[--border-subtle]">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Account</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Tier</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Engagements</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">MRR</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Margin</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Health</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Churn</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Expand</th>
                </tr>
              </thead>
              <tbody>
                {accounts
                  .slice()
                  .sort((a, b) => b.healthScore - a.healthScore)
                  .map((account) => (
                    <tr key={account.workspaceId} className="border-b border-[--border-subtle] hover:bg-[--elevated] transition-colors">
                      <td className="px-3 py-2 text-[--text-primary]">
                        <p className="font-semibold truncate">{account.organizationName}</p>
                        <p className="text-xs text-[--text-muted] truncate">{account.flagshipEngagement}</p>
                      </td>
                      <td className="px-3 py-2">
                        <ContentTag variant={TIER_TONE[account.tier]}>{account.tier}</ContentTag>
                      </td>
                      <td className="px-3 py-2 text-[--text-primary] font-mono tabular-nums">{account.engagementsActive}</td>
                      <td className="px-3 py-2 text-[--text-primary] font-mono tabular-nums">{dollars(account.monthlyRecurringUsd)}</td>
                      <td className="px-3 py-2 text-[--text-primary] font-mono tabular-nums">{dollars(account.grossMarginUsd)}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Progress value={account.healthScore} color={account.healthScore >= 70 ? "success" : account.healthScore >= 45 ? "accent" : "warning"} />
                          <span className="font-mono tabular-nums text-[--text-primary]">{account.healthScore}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <ContentTag variant={CHURN_TONE[account.churnRisk]} dot>
                          {account.churnRisk}
                        </ContentTag>
                      </td>
                      <td className="px-3 py-2 text-[--text-primary] font-mono tabular-nums">{Math.round(account.expansionScore * 100)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="portfolio-patterns"
          eyebrow="PATTERN EMERGENCE"
          title="Canonical artifacts emerging in multiple workspaces"
          subtitle="Pattern emergence detection. Phase 12.1 federation auto-promotion will consume this feed."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[260px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {patterns.map((p) => (
                <li key={p.id} className="flex flex-col gap-1 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                    <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{p.title}</p>
                    <ContentTag variant={p.recommendedAction === "promote-to-federation" ? "success" : "info"}>
                      {p.recommendedAction}
                    </ContentTag>
                    <span className="text-xs font-mono tabular-nums text-[--text-primary]">{Math.round(p.confidence * 100)}%</span>
                  </div>
                  <p className="text-xs text-[--text-muted] leading-snug">
                    {p.workspaces.length} workspaces · category {p.category}
                  </p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="portfolio-internal-register"
          eyebrow="INTERNAL DECISION REGISTER"
          title="Dauntless-level decisions"
          subtitle="Internal decisions follow the same propose → approve → commit rigor clients use. Pricing, sector focus, hiring."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[360px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {internalDecisions.map((d) => (
                <li key={d.id} className="flex flex-col gap-1 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ContentTag variant={DECISION_TONE[d.status]} dot>
                      {d.status.replace("-", " ")}
                    </ContentTag>
                    <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{d.title}</p>
                    <ContentTag variant="info">{d.category}</ContentTag>
                    <ContentTag variant={d.riskTier === "high" ? "warning" : "default"}>
                      {d.riskTier} risk
                    </ContentTag>
                  </div>
                  <p className="text-xs text-[--text-secondary] leading-snug">{d.rationale}</p>
                  <p className="text-xs text-[--text-muted] leading-snug">
                    proposed by {d.proposedBy} · confidence {Math.round(d.confidence * 100)}%
                    {d.decidedBy ? ` · decided by ${d.decidedBy} on ${d.decidedAt?.toLocaleDateString()}` : d.dueAt ? ` · due ${d.dueAt.toLocaleDateString()}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>
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
    <DashboardCard id={`tile-${label}`} eyebrow="PORTFOLIO" title={label}>
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
