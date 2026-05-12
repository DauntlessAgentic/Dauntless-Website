"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, ShieldAlert, ShieldCheck, Users, FileLock2, Download } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ContentTag } from "@/components/ui/content-tag";
import {
  mockAuditLog, mockMemberships, mockDecisions,
} from "@/lib/portal/mock-data";
import type { RiskTier } from "@/lib/portal/types";

const RISK_TONE: Record<RiskTier, React.ComponentProps<typeof ContentTag>["variant"]> = {
  low:    "default",
  medium: "info",
  high:   "warning",
};

export default function GovernancePage() {
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
                <Button variant="ghost" size="xs" className="gap-1">
                  <Download className="h-3 w-3" /> Export
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
                          <div className="flex items-center gap-1.5">
                            <Badge variant={entry.actorKind === "agent" ? "accent" : "outline"} className="shrink-0">
                              {entry.actorKind}
                            </Badge>
                            <span className="truncate">{entry.actor}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2"><ContentTag variant={RISK_TONE[entry.riskTier]} dot>{entry.riskTier}</ContentTag></td>
                        <td className="px-3 py-2 text-[--text-muted] leading-snug">{entry.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </DashboardCard>
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
