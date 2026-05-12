"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, GitMerge, Layers } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { Progress } from "@/components/ui/progress";

import type { MembershipContext } from "@/lib/auth/session";
import type { RoadmapPhase } from "@/lib/portal/roadmap-status";

interface AboutViewProps {
  phases: RoadmapPhase[];
  shippedCount: number;
  coverage: Record<RoadmapPhase["tier"], { shipped: number; total: number }>;
  membership: MembershipContext;
}

const STATUS_TONE: Record<RoadmapPhase["status"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  shipped: "success",
  "in-progress": "info",
  scoped: "warning",
  future: "default",
};

const TIER_LABEL: Record<RoadmapPhase["tier"], string> = {
  "core-portal": "Core Portal",
  "advanced-portal": "Advanced Portal",
  "innovation-studio": "Innovation Studio",
  "enterprise-network": "Enterprise & Network",
};

const TIER_ORDER: RoadmapPhase["tier"][] = [
  "core-portal",
  "advanced-portal",
  "innovation-studio",
  "enterprise-network",
];

export function AboutView({ phases, shippedCount, coverage, membership: _membership }: AboutViewProps) {
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="About this portal"
        title="The portal is its own changelog"
        description="Single source of truth for what's shipped. Every phase, every PR, every feature surface — pulled live from the roadmap module."
        badge={`${shippedCount} / ${phases.length} phases shipped`}
        badgeVariant="success"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="about-tier-coverage"
          eyebrow="TIER COVERAGE"
          title="Phase coverage by marketing tier"
          subtitle="The four product tiers Dauntless sells; the portal covers each end-to-end."
        >
          <div className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {TIER_ORDER.map((tier) => {
              const c = coverage[tier];
              const pct = c.total === 0 ? 0 : Math.round((c.shipped / c.total) * 100);
              return (
                <div
                  key={tier}
                  className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                    <p className="flex-1 text-xs font-semibold text-[--text-primary]">{TIER_LABEL[tier]}</p>
                    <span className="text-xs font-mono tabular-nums text-[--text-primary]">{c.shipped} / {c.total}</span>
                  </div>
                  <Progress value={pct} color={pct === 100 ? "success" : "accent"} />
                </div>
              );
            })}
          </div>
        </DashboardCard>

        <DashboardCard
          id="about-roadmap"
          eyebrow="ROADMAP"
          title="Every phase, every PR"
          subtitle="Updating lib/portal/roadmap-status.ts is the canonical way to record a new ship. README, marketing site, and this page all read from it."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[640px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {phases.map((phase) => (
                <li key={phase.id} className="flex flex-col gap-1.5 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 shrink-0 ${
                        phase.status === "shipped" ? "text-[--success]" : "text-[--text-muted]"
                      }`}
                    />
                    <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{phase.title}</p>
                    <ContentTag variant={STATUS_TONE[phase.status]} dot>
                      {phase.status}
                    </ContentTag>
                    <code className="text-xs font-mono text-[--text-muted]">{phase.marker}</code>
                    <ContentTag variant="default">{TIER_LABEL[phase.tier]}</ContentTag>
                    {phase.prNumber && (
                      <a
                        href={`https://github.com/DauntlessAgentic/Dauntless-Website/pull/${phase.prNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[--accent-vivid] hover:underline"
                      >
                        <GitMerge className="h-3 w-3" /> PR #{phase.prNumber}
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[--text-secondary] leading-snug">{phase.summary}</p>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-[--text-muted]">Features</summary>
                    <ul className="mt-1 ml-3 list-disc text-[--text-secondary] space-y-0.5">
                      {phase.features.map((f, idx) => (
                        <li key={idx} className="font-mono">{f}</li>
                      ))}
                    </ul>
                  </details>
                  {phase.remaining && phase.remaining.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-[--text-muted]">Remaining (next sub-phase)</summary>
                      <ul className="mt-1 ml-3 list-disc text-[--text-secondary] space-y-0.5">
                        {phase.remaining.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>

        <p className="text-xs text-[--text-muted] leading-snug">
          The portal is self-documenting from this point forward. Every new phase should append to
          <code className="font-mono mx-1">lib/portal/roadmap-status.ts</code>; this page (and the marketing site
          when wired) reflects the change without code edits.
        </p>
      </div>
    </div>
  );
}
