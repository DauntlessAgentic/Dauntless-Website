"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ShieldAlert, FileLock2, Package } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { Progress } from "@/components/ui/progress";

import type { MembershipContext } from "@/lib/auth/session";
import type {
  ControlCheck,
  FrameworkPosture,
  PortalCompliancePosture,
  SectorPackEntry,
} from "@/lib/portal/compliance";

interface ComplianceViewProps {
  posture: PortalCompliancePosture;
  sectorPacks: SectorPackEntry[];
  membership: MembershipContext;
}

const STATUS_TONE: Record<ControlCheck["status"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  pass: "success",
  partial: "info",
  gap: "warning",
  "not-applicable": "default",
};

const FRAMEWORK_TONE: Record<FrameworkPosture["status"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  ready: "success",
  "in-progress": "info",
  "not-started": "warning",
};

export function ComplianceView({ posture, sectorPacks, membership }: ComplianceViewProps) {
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Compliance Posture"
        title="Cross-framework readiness · evidence on demand"
        description={`Generated ${posture.generatedAt.toLocaleString()}. Four frameworks evaluated against the live workspace state.`}
        badge={`overall ${posture.overallScore}/100`}
        badgeVariant={posture.overallScore >= 70 ? "success" : posture.overallScore >= 40 ? "info" : "warning"}
        actions={
          <Link href="/portal/governance" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Governance <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="compliance-summary"
          eyebrow="POSTURE"
          title="Highlights + blocking gaps"
          subtitle="A procurement officer should be able to complete a security questionnaire from this surface."
          bodyClassName="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-3 py-3 text-xs">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Highlights</p>
              <ul className="flex flex-col gap-1.5">
                {posture.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[--text-secondary] leading-snug">
                    <ShieldCheck className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Blocking gaps</p>
              {posture.blockingGaps.length === 0 ? (
                <p className="text-xs text-[--text-secondary] leading-snug">
                  No `gap` controls across any framework. You can sit a Type II audit kickoff.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {posture.blockingGaps.map((c) => (
                    <li key={c.id} className="flex items-start gap-2 text-[--text-secondary] leading-snug">
                      <ShieldAlert className="h-3.5 w-3.5 text-[--warning] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[--text-primary] font-semibold">{c.title}</strong> · {c.evidence}
                        {c.nextStep ? ` · Next: ${c.nextStep}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </DashboardCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {posture.frameworks.map((fw) => (
            <DashboardCard
              key={fw.framework.id}
              id={`framework-${fw.framework.id}`}
              eyebrow={fw.framework.sector.toUpperCase().replace("-", " ")}
              title={fw.framework.name}
              subtitle={fw.framework.description}
              badge={fw.status}
              badgeVariant={FRAMEWORK_TONE[fw.status]}
              bodyClassName="overflow-hidden"
            >
              <div className="px-3 py-2.5 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-widest text-[--text-muted]">Readiness</span>
                  <Progress value={fw.score} color={fw.score >= 75 ? "success" : fw.score >= 35 ? "accent" : "warning"} />
                  <span className="font-mono tabular-nums text-[--text-primary]">{fw.score}/100</span>
                </div>
                <ScrollArea className="h-full max-h-[280px]">
                  <ul className="flex flex-col divide-y divide-[--border-subtle]">
                    {fw.controls.map((c) => (
                      <li key={c.id} className="flex flex-col gap-1 py-2">
                        <div className="flex items-center gap-2">
                          <ContentTag variant={STATUS_TONE[c.status]} dot>
                            {c.status}
                          </ContentTag>
                          <p className="flex-1 text-xs font-semibold text-[--text-primary] leading-snug">{c.title}</p>
                          <span className="text-xs font-mono tabular-nums text-[--text-muted]">{c.family.slice(0, 14)}</span>
                        </div>
                        <p className="text-xs text-[--text-secondary] leading-snug">{c.evidence}</p>
                        {c.nextStep && (
                          <p className="text-xs text-[--accent-vivid] leading-snug">→ {c.nextStep}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </DashboardCard>
          ))}
        </div>

        <DashboardCard
          id="compliance-sector-packs"
          eyebrow="SECTOR PACKS"
          title="Preloaded canonical content by framework"
          subtitle="Each pack provides governance policies, playbooks, and control mappings tuned to a sector's policy landscape."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[360px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {sectorPacks.map((pack) => (
                <li key={pack.id} className="flex flex-col gap-1 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                    <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{pack.title}</p>
                    <ContentTag variant="accent">{pack.kind}</ContentTag>
                    <ContentTag variant="info">{pack.framework}</ContentTag>
                  </div>
                  <p className="text-xs text-[--text-secondary] leading-snug">{pack.summary}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="compliance-export-hint"
          eyebrow="EVIDENCE EXPORT"
          title="Signed audit-log export"
          subtitle="Phase 10.1 will wire signed + watermarked exports + per-workspace data residency configuration."
        >
          <div className="px-3 py-2.5 text-xs text-[--text-secondary] flex items-start gap-2">
            <FileLock2 className="h-3.5 w-3.5 text-[--accent-vivid] mt-0.5 shrink-0" />
            <span>
              {membership.role === "owner" || membership.role === "auditor" || membership.role === "executive"
                ? "You have export rights. Trigger from /portal/governance once Phase 10.1 wires the action."
                : `Your role (${membership.role}) does not have evidence-export rights. Audit + executive memberships only.`}
            </span>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
