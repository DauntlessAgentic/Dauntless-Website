"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, GitBranch, Activity, BellOff } from "lucide-react";
import { snoozeProposalAction } from "@/lib/portal/innovation/proposal-actions";
import { announce } from "@/components/patterns/polite-announcer";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { Input } from "@/components/ui/input";

import type { MembershipContext } from "@/lib/auth/session";
import type {
  PatternLibraryEntry,
  PatternMatch,
} from "@/lib/portal/innovation/patterns";
import type {
  DecisionTreeNode,
  SimulationResult,
} from "@/lib/portal/innovation/simulator";
import type { InnovationProposal } from "@/lib/portal/innovation/engine";
import type { Decision, Engagement } from "@/lib/portal/types";

interface InnovationStudioViewProps {
  patterns: PatternLibraryEntry[];
  simulations: SimulationResult[];
  tree: DecisionTreeNode | null;
  decision: Decision | undefined;
  engagements: Engagement[];
  focusEngagement: Engagement | undefined;
  initialMatches: PatternMatch[];
  innovationRate: number;
  membership: MembershipContext;
  autonomousProposals: InnovationProposal[];
}

const CATEGORY_TONE: Record<string, React.ComponentProps<typeof ContentTag>["variant"]> = {
  consulting: "info",
  training: "success",
  agentic: "accent",
  governance: "warning",
  activation: "default",
};

const MATURITY_TONE: Record<string, React.ComponentProps<typeof ContentTag>["variant"]> = {
  emergent: "info",
  validated: "accent",
  canonical: "success",
};

export function InnovationStudioView({
  patterns,
  simulations,
  tree,
  decision,
  engagements,
  focusEngagement,
  initialMatches,
  innovationRate,
  membership,
  autonomousProposals,
}: InnovationStudioViewProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeMaturity, setActiveMaturity] = useState<string | null>(null);
  const [proposalState, setProposalState] = useState(autonomousProposals);
  const [snoozePending, startSnooze] = useTransition();

  const handleSnooze = (id: string, hours = 24) => {
    startSnooze(async () => {
      const target = proposalState.find((p) => p.id === id);
      await snoozeProposalAction(id, hours);
      setProposalState((prev) => prev.filter((p) => p.id !== id));
      // Audit-3 §H1: announce the action so SR users know the
      // proposal was dismissed, not lost.
      announce(`Proposal "${target?.title ?? id}" snoozed for ${hours} hours.`);
    });
  };

  // Advisory action #11: tokenizer fix. Split the query into tokens
  // and require every token to appear somewhere in the haystack, so a
  // longer query never returns fewer results than a shorter prefix
  // unless the longer query introduces an unmatchable word.
  const filteredPatterns = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return patterns.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeMaturity && p.maturity !== activeMaturity) return false;
      if (tokens.length > 0) {
        const hay = `${p.title} ${p.summary} ${p.whenItApplies}`.toLowerCase();
        if (!tokens.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
  }, [patterns, activeCategory, activeMaturity, query]);


  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Innovation Studio"
        title="Where the Bookshelf compounds into bets"
        description="The Strategic Partner tier surface — pattern library, roadmap simulation, decision-tree visualization, and the Autonomous Innovation Engine."
        badge={`${patterns.length} patterns · ${Math.round(innovationRate * 100)}% canonical`}
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Tile
            icon={BookOpen}
            label="Pattern library size"
            value={`${patterns.length}`}
            sub={`${patterns.filter((p) => p.maturity === "canonical").length} canonical · ${patterns.filter((p) => p.maturity === "validated").length} validated`}
          />
          <Tile
            icon={Activity}
            label="Innovation rate"
            value={`${Math.round(innovationRate * 100)}%`}
            sub="Canonical share of all artifacts in this workspace."
          />
          <Tile
            icon={Sparkles}
            label="Top scenario"
            value={simulations[0]?.scenario.title.split(" ").slice(0, 3).join(" ") ?? "—"}
            sub={`Overall score ${simulations[0]?.overallScore ?? 0}`}
          />
          <Tile
            icon={GitBranch}
            label="Decision under analysis"
            value={decision ? `${decision.riskTier} risk` : "None"}
            sub={decision?.title ?? "No high-tier pending decisions."}
          />
        </div>

        <DashboardCard
          id="autonomous-engine"
          eyebrow="AUTONOMOUS ENGINE"
          title={`${proposalState.length} live proposal${proposalState.length === 1 ? "" : "s"}`}
          subtitle="Continuous in-process watcher. Heuristics run on every portal event and surface fresh proposals here."
          badge={proposalState.some((p) => p.urgency === "urgent") ? "urgent" : proposalState.length === 0 ? "idle" : "live"}
          badgeVariant={
            proposalState.some((p) => p.urgency === "urgent")
              ? "warning"
              : proposalState.length === 0
              ? "default"
              : "accent"
          }
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[360px]">
            {proposalState.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                Nothing requires your attention right now. New proposals will appear here as the engine notices things.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {proposalState.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1.5 px-3 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ContentTag
                        variant={p.urgency === "urgent" ? "warning" : p.urgency === "notable" ? "info" : "default"}
                        dot
                      >
                        {p.urgency}
                      </ContentTag>
                      <ContentTag variant="default">{p.kind.replace(/-/g, " ")}</ContentTag>
                      <p className="flex-1 text-xs font-semibold text-[--text-primary]">{p.title}</p>
                      <button
                        type="button"
                        onClick={() => handleSnooze(p.id, 24)}
                        disabled={snoozePending}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[--radius-sm] text-xs text-[--text-muted] hover:text-[--text-primary] hover:bg-[--elevated] transition-colors"
                        title="Dismiss for 24 hours."
                        aria-label="Snooze 24 hours"
                      >
                        <BellOff className="h-3 w-3" /> {snoozePending ? "…" : "Snooze 24h"}
                      </button>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{p.rationale}</p>
                    {p.suggestedActions.length > 0 && (
                      <ul className="flex flex-col gap-0.5 list-disc pl-4">
                        {p.suggestedActions.map((a, i) => (
                          <li key={i} className="text-xs text-[--text-muted] leading-snug">{a}</li>
                        ))}
                      </ul>
                    )}
                    {p.quickActions && p.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {p.quickActions.map((qa, i) => (
                          <Link
                            key={i}
                            href={qa.href}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-[--radius-sm] border border-[--border-subtle] bg-[--elevated] text-[--text-primary] hover:border-[--accent-vivid] transition-colors"
                          >
                            {qa.label} <ArrowRight className="h-3 w-3" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="innovation-simulator"
          eyebrow="ROADMAP SIMULATION"
          title="Next-Best-Course-of-Action — scenario ranking"
          subtitle={`Forward projection ${simulations[0]?.horizonMonths ?? 6} months. Multipliers are interpolated linearly. Phase 7.1 will backtest against historical engagement series.`}
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[420px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {simulations.map((sim) => (
                <li key={sim.scenario.id} className="flex flex-col gap-2 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-xs font-semibold text-[--text-primary]">{sim.scenario.title}</p>
                    <ContentTag
                      variant={sim.overallScore > 0.05 ? "success" : sim.overallScore > -0.05 ? "default" : "warning"}
                      dot
                    >
                      score {sim.overallScore.toFixed(2)}
                    </ContentTag>
                    <ContentTag variant="info">
                      reversibility {sim.scenario.reversibilityCost}
                    </ContentTag>
                    <ContentTag variant="accent">option {sim.scenario.optionValue}</ContentTag>
                  </div>
                  <p className="text-xs text-[--text-secondary] leading-snug">{sim.scenario.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {sim.metrics.slice(0, 4).map((m) => (
                      <div
                        key={m.metricKey}
                        className="rounded-[--radius-md] border border-[--border-subtle] bg-[--elevated] px-2 py-1.5"
                      >
                        <p className="text-xs uppercase tracking-widest text-[--text-muted]">{m.label}</p>
                        <p className="text-xs text-[--text-primary] font-mono tabular-nums">
                          {m.baselineCurrent} → {m.projectedFinal}
                          <span className={`ml-2 ${m.delta > 0 ? "text-[--success]" : m.delta < 0 ? "text-[--danger]" : "text-[--text-muted]"}`}>
                            {m.delta > 0 ? "▲" : m.delta < 0 ? "▼" : "—"} {Math.abs(m.delta).toFixed(1)}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>

        {tree && decision && (
          <DashboardCard
            id="decision-tree"
            eyebrow="DECISION TREE"
            title={`Consequences of "${decision.title}"`}
            subtitle="Branching outcome graph. Probabilities + impact scores are stub values — Phase 7.1 will derive them from telemetry."
            agentId="agent-engagement-analyst"
            agentState="thinking"
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[420px]">
              <div className="px-3 py-3">
                <TreeRoot node={tree} />
              </div>
            </ScrollArea>
          </DashboardCard>
        )}

        <DashboardCard
          id="pattern-library"
          eyebrow="PATTERN LIBRARY"
          title={`${filteredPatterns.length} of ${patterns.length} patterns`}
          subtitle="Curated delivery patterns Dauntless has distilled across engagements. Marketing promise: 200+ patterns; Phase 7.0 ships the seed."
          bodyClassName="overflow-hidden"
        >
          <div className="px-3 py-2.5 space-y-2 border-b border-[--border-subtle]">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patterns by title, summary, or domain…"
              className="h-7 text-xs"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[--text-muted]">Category</span>
              {(["consulting", "training", "agentic", "governance", "activation"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === c ? null : c)}
                  className={`rounded-[--radius-sm] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide leading-none transition-colors ${
                    activeCategory === c
                      ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                      : "bg-[--elevated] text-[--text-muted] border border-[--border-subtle] hover:border-[--border-default]"
                  }`}
                >
                  {c}
                </button>
              ))}
              <span className="text-xs text-[--text-muted] ml-2">Maturity</span>
              {(["emergent", "validated", "canonical"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActiveMaturity(activeMaturity === m ? null : m)}
                  className={`rounded-[--radius-sm] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide leading-none transition-colors ${
                    activeMaturity === m
                      ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                      : "bg-[--elevated] text-[--text-muted] border border-[--border-subtle] hover:border-[--border-default]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <ScrollArea className="h-full max-h-[420px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {filteredPatterns.length === 0 ? (
                <li className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  No patterns match. Clear a filter or broaden the query.
                </li>
              ) : (
                filteredPatterns.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <ContentTag variant={CATEGORY_TONE[p.category]} dot>
                        {p.category}
                      </ContentTag>
                      <ContentTag variant={MATURITY_TONE[p.maturity]}>{p.maturity}</ContentTag>
                      <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{p.title}</p>
                      <span className="text-xs font-mono tabular-nums text-[--text-muted]">
                        ⚡{p.impactScore} · ↺{p.reversibilityScore} · {p.timeToImpactDays}d
                      </span>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{p.summary}</p>
                    <p className="text-xs text-[--text-muted] leading-snug italic">{p.whenItApplies}</p>
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
        </DashboardCard>

        {focusEngagement && initialMatches.length > 0 && (
          <DashboardCard
            id="pattern-matches"
            eyebrow="MATCHED PATTERNS"
            title={`Patterns matched to "${focusEngagement.name}"`}
            subtitle={`${initialMatches.length} patterns surface against this engagement's success criteria.`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[320px]">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {initialMatches.map((m) => (
                  <li key={m.pattern.id} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-[--text-primary] flex-1 truncate">{m.pattern.title}</p>
                      <span className="text-xs font-mono tabular-nums text-[--text-muted]">{Math.round(m.score * 100)}%</span>
                    </div>
                    {m.reasons.length > 0 && (
                      <p className="text-xs text-[--text-muted] leading-snug">{m.reasons.join(" · ")}</p>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>
        )}

        {/* Read-only audience hint */}
        {(membership.role === "viewer") && (
          <p className="text-xs text-[--text-muted] italic leading-snug">
            You are viewing the Innovation Studio in read-only mode ({membership.role}). Trigger pattern-driven proposals from /portal/agents.
          </p>
        )}

        {/* Engagement-switch hint */}
        {engagements.length > 1 && focusEngagement && (
          <p className="text-xs text-[--text-muted] leading-snug">
            Showing pattern matches for <span className="font-mono">{focusEngagement.name}</span>. Phase 7.1 will add an engagement switcher inline.
          </p>
        )}
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
    <DashboardCard id={`tile-${label}`} eyebrow="STUDIO" title={label}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[--radius-md] bg-[--accent-dim] border border-[--border-active] shrink-0">
          <Icon className="h-4 w-4 text-[--accent-vivid]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold tabular-nums text-[--text-primary] leading-tight">{value}</p>
          <p className="text-xs text-[--text-muted] mt-1 leading-snug">{sub}</p>
        </div>
      </div>
    </DashboardCard>
  );
}

function TreeRoot({ node }: { node: DecisionTreeNode }) {
  return (
    <div className="space-y-2">
      <div className="rounded-[--radius-md] bg-[--accent-dim] border border-[--border-active] px-2.5 py-2">
        <p className="text-xs font-semibold text-[--text-primary]">{node.label}</p>
        <p className="text-xs text-[--text-secondary] leading-snug">{node.description}</p>
      </div>
      <div className="ml-3 border-l-2 border-[--border-subtle] pl-3 space-y-3">
        {node.children.map((child) => (
          <TreeOption key={child.id} node={child} />
        ))}
      </div>
    </div>
  );
}

function TreeOption({ node }: { node: DecisionTreeNode }) {
  return (
    <div className="space-y-1.5">
      <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <ContentTag variant="accent" dot>
            {Math.round(node.probability * 100)}%
          </ContentTag>
          <p className="text-xs font-semibold text-[--text-primary] flex-1 truncate">{node.label}</p>
          <span className="text-xs font-mono tabular-nums text-[--text-muted]">impact {node.impactScore}</span>
        </div>
        <p className="text-xs text-[--text-secondary] leading-snug">{node.description}</p>
      </div>
      <div className="ml-3 border-l-2 border-dashed border-[--border-subtle] pl-3 space-y-1.5">
        {node.children.map((leaf) => (
          <div key={leaf.id} className="flex flex-col gap-0.5 rounded-[--radius-md] bg-[--elevated-2] border border-[--border-subtle] px-2 py-1.5">
            <div className="flex items-center gap-2">
              <ContentTag variant={leaf.impactScore > 0 ? "success" : leaf.impactScore < 0 ? "danger" : "info"}>
                {Math.round(leaf.probability * 100)}%
              </ContentTag>
              <p className="text-xs font-semibold text-[--text-primary] flex-1 truncate">{leaf.label}</p>
              <span className="text-xs font-mono tabular-nums text-[--text-muted]">impact {leaf.impactScore}</span>
            </div>
            <p className="text-xs text-[--text-muted] leading-snug">{leaf.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
