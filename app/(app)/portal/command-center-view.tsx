"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, CalendarPlus, Download, Shield, FileText,
  Activity, BookOpen, Briefcase, Compass,
} from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentTag } from "@/components/ui/content-tag";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KpiTile } from "@/components/patterns/kpi-tile";
import { AreaChartViz } from "@/components/viz/area-chart";
import { DecisionList } from "@/components/patterns/decision-list";
import { ArtifactList } from "@/components/patterns/artifact-list";
import { PortalStatusCard } from "@/components/patterns/portal-status-card";
import { AgentFleetPanel } from "@/components/patterns/agent-fleet-panel";
import { KnowledgeShelf } from "@/components/patterns/knowledge-shelf";
import { EvidenceLink } from "@/components/patterns/evidence-link";

import type { KnowledgeShelf as KnowledgeShelfKind, PortalSnapshot } from "@/lib/portal/types";
import type { MembershipContext } from "@/lib/auth/session";

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

const SIGNAL_TONE: Record<string, React.ComponentProps<typeof ContentTag>["variant"]> = {
  info:      "info",
  notable:   "accent",
  important: "warning",
  urgent:    "danger",
};

interface CommandCenterViewProps {
  snapshot: PortalSnapshot;
  membership: MembershipContext;
}

export function CommandCenterView({ snapshot, membership: _membership }: CommandCenterViewProps) {
  const {
    organization: mockOrganization,
    workspace: mockWorkspace,
    engagements: mockEngagements,
    artifacts: mockArtifacts,
    decisions: mockDecisions,
    signals: mockSignals,
    agents: mockAgents,
    knowledge: mockKnowledge,
    metrics: mockMetrics,
    evidence: mockEvidence,
    nextBestActions: mockNextBestActions,
    conversations: mockConversations,
  } = snapshot;
  const getKnowledgeByShelf = (shelf: KnowledgeShelfKind) =>
    mockKnowledge.filter((k) => k.shelf === shelf);

  const pending = mockDecisions.filter((d) => d.status === "pending-approval");
  const topDecision = pending[0];
  const desk = getKnowledgeByShelf("desk");
  const bookshelf = getKnowledgeByShelf("bookshelf");
  const cabinet = getKnowledgeByShelf("cabinet");

  const adoption = mockMetrics.find((m) => m.key === "adoption");
  const cycleTime = mockMetrics.find((m) => m.key === "cycle-time");
  const capability = mockMetrics.find((m) => m.key === "capability-score");
  const governance = mockMetrics.find((m) => m.key === "governance-readiness");
  const canonical = mockMetrics.find((m) => m.key === "canonical-density");
  const trendSeries = adoption?.series.map((point, idx) => ({
    period: point.period,
    adoption: point.value,
    capability: capability?.series[idx]?.value ?? 0,
    governance: governance?.series[idx]?.value ?? 0,
  })) ?? [];

  const recentSignals = [...mockSignals]
    .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime())
    .slice(0, 7);

  const livingDeliverables = mockArtifacts
    .filter((a) => a.reviewState !== "superseded")
    .sort((a, b) => b.lastReviewedAt.getTime() - a.lastReviewedAt.getTime())
    .slice(0, 6);

  const topEvidence = topDecision
    ? topDecision.evidenceIds
        .map((id) => mockEvidence.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
    : [];

  const conciergeConversation = mockConversations.find((c) => c.agentId === "agent-concierge");

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Client Intelligence Portal"
        title={mockWorkspace.name}
        badge={mockWorkspace.trustBadge}
        badgeVariant="accent"
        description={`${mockOrganization.name} · ${mockOrganization.sector} · Updated ${relativeTime(mockWorkspace.lastUpdated)}`}
        actions={
          <>
            <Link
              href="/portal/innovation"
              className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
            >
              Innovation Studio <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/portal/schedule"
              className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
            >
              Schedule <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/portal/api"
              className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
            >
              API <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/portal/actions"
              className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
            >
              Outbound actions <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/portal/federation"
              className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
            >
              Federation <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/portal/about"
              className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
            >
              About <ArrowRight className="h-3 w-3" />
            </Link>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <CalendarPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Book walkthrough</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export briefing</span>
            </Button>
            <Button variant="primary" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Ask the Concierge
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">

        {/* ── Promise band ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PromiseTile
            icon={Briefcase}
            label="Engagements live"
            value={String(mockEngagements.filter((e) => e.status !== "complete").length)}
            sub="3 active · 0 paused"
          />
          <PromiseTile
            icon={Sparkles}
            label="Decisions waiting on you"
            value={String(pending.length)}
            sub={`${pending.filter((d) => d.riskTier === "high").length} high-risk · default-accept available`}
          />
          <PromiseTile
            icon={BookOpen}
            label="Canonical knowledge"
            value={String(mockKnowledge.filter((k) => k.canonical).length)}
            sub={`${canonical ? Math.round(canonical.current * 100) : 0}% of all items · compounding`}
          />
        </div>

        {/* ── Decision Surface: 5 sections ────────────────────── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Decision Surface</p>
              <p className="text-xs text-[--text-secondary]">The five questions Dauntless surfaces for you.</p>
            </div>
            <Link href="/portal/decisions" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
              Decision Register <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

            {/* What needs my judgment? */}
            <div className="lg:col-span-2 min-h-[360px]">
              <DashboardCard
                id="ds-judgment"
                eyebrow="DECISION SURFACE"
                title="What needs my judgment?"
                subtitle={`${pending.length} decisions pending`}
                badge="Top of queue"
                agentId="agent-engagement-analyst"
                agentState="thinking"
                bodyClassName="overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <DecisionList decisions={pending} showActions emptyHint="No decisions are waiting on you." />
                </ScrollArea>
              </DashboardCard>
            </div>

            {/* What changed? */}
            <div className="min-h-[360px]">
              <DashboardCard
                id="ds-changed"
                eyebrow="DECISION SURFACE"
                title="What changed since last review?"
                subtitle={`${recentSignals.length} signals`}
                agentId="agent-concierge"
                agentState="active"
                bodyClassName="overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <ul className="flex flex-col divide-y divide-[--border-subtle]">
                    {recentSignals.map((signal) => (
                      <li key={signal.id} className="flex flex-col gap-1 px-3 py-2.5">
                        <div className="flex items-start gap-2">
                          <ContentTag variant={SIGNAL_TONE[signal.severity]} dot className="shrink-0">
                            {signal.severity}
                          </ContentTag>
                          <p className="flex-1 text-xs font-semibold text-[--text-primary] leading-snug">{signal.title}</p>
                          <span className="text-xs font-mono text-[--text-muted] shrink-0 tabular-nums">{relativeTime(signal.capturedAt)}</span>
                        </div>
                        <p className="text-xs text-[--text-muted] leading-snug">{signal.detail}</p>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </DashboardCard>
            </div>

            {/* What's running safely? */}
            <div className="lg:col-span-2 min-h-[280px]">
              <DashboardCard
                id="ds-running"
                eyebrow="DECISION SURFACE"
                title="What's running safely?"
                subtitle={`${mockEngagements.length} engagements · ${mockAgents.length} agents`}
                agentId="agent-governance-auditor"
                agentState="complete"
                bodyClassName="overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    {mockEngagements.map((engagement) => (
                      <PortalStatusCard
                        key={engagement.id}
                        engagement={engagement}
                        className="border-r border-[--border-subtle] last:border-r-0"
                      />
                    ))}
                  </div>
                </ScrollArea>
              </DashboardCard>
            </div>

            {/* What evidence supports this? */}
            <div className="min-h-[280px]">
              <DashboardCard
                id="ds-evidence"
                eyebrow="DECISION SURFACE"
                title="What evidence supports the top decision?"
                subtitle={topDecision ? `${topEvidence.length} sources` : "No pending decision"}
                agentId="agent-governance-auditor"
                agentState="complete"
                bodyClassName="overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-2 px-3 py-2.5">
                    {topDecision && (
                      <>
                        <p className="text-xs font-semibold text-[--text-primary] leading-snug">{topDecision.title}</p>
                        <p className="text-xs text-[--text-secondary] leading-snug">
                          <span className="text-[--text-muted]">Rationale · </span>
                          {topDecision.recommendation.rationale}
                        </p>
                        <div className="flex flex-col gap-1.5 pt-1">
                          {topEvidence.map((ev) => (
                            <EvidenceLink key={ev.id} kind={ev.kind} title={ev.title} source={ev.source} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </DashboardCard>
            </div>

            {/* What should happen next? */}
            <div className="lg:col-span-3 min-h-[200px]">
              <DashboardCard
                id="ds-next"
                eyebrow="DECISION SURFACE"
                title="What should happen next?"
                subtitle="Next-best actions, ranked by leverage"
                agentId="agent-concierge"
                agentState="active"
                bodyClassName="overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <ol className="flex flex-col divide-y divide-[--border-subtle]">
                    {mockNextBestActions.map((action, idx) => (
                      <li key={action.id} className="flex items-start gap-3 px-3 py-2.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold shrink-0 ${
                            action.priority === "primary"
                              ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                              : "bg-[--elevated-2] text-[--text-muted] border border-[--border-default]"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[--text-primary] leading-snug">{action.label}</p>
                          <p className="text-xs text-[--text-muted] leading-snug">{action.rationale}</p>
                        </div>
                        <Badge variant={action.priority === "primary" ? "accent" : "outline"} className="shrink-0">
                          {action.estimatedEffort}
                        </Badge>
                      </li>
                    ))}
                  </ol>
                </ScrollArea>
              </DashboardCard>
            </div>
          </div>
        </section>

        {/* ── Living deliverables + Agents row ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 min-h-[340px]">
            <DashboardCard
              id="living-deliverables"
              eyebrow="LIVING DELIVERABLES"
              title="Artifacts that compound, not files that decay"
              subtitle={`${mockArtifacts.length} artifacts · ${mockArtifacts.filter((a) => a.canonical).length} canonical`}
              actions={
                <Link href="/portal/deliverables" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
                  Library <ArrowRight className="h-3 w-3" />
                </Link>
              }
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ArtifactList artifacts={livingDeliverables} />
              </ScrollArea>
            </DashboardCard>
          </div>
          <div className="min-h-[340px]">
            <DashboardCard
              id="agent-fleet"
              eyebrow="CONTEXTUAL AGENTS"
              title="Agent fleet"
              subtitle={`${mockAgents.length} agents · 4 archetypes`}
              agentId="agent-concierge"
              agentState="active"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <AgentFleetPanel agents={mockAgents} />
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>

        {/* ── Concierge convo + outcomes preview ───────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 min-h-[320px]">
            <DashboardCard
              id="outcomes-trend"
              eyebrow="OUTCOMES"
              title="Compounding intelligence"
              subtitle="Adoption · Capability · Governance — 8-week series"
              actions={
                <Link href="/portal/outcomes" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
                  Outcomes <ArrowRight className="h-3 w-3" />
                </Link>
              }
              bodyClassName="overflow-hidden p-2"
            >
              <AreaChartViz
                data={trendSeries}
                xKey="period"
                areas={[
                  { key: "adoption",    color: "var(--chart-1)", label: "Adoption" },
                  { key: "capability",  color: "var(--chart-4)", label: "Capability" },
                  { key: "governance",  color: "var(--chart-2)", label: "Governance" },
                ]}
              />
            </DashboardCard>
          </div>
          <div className="min-h-[320px]">
            <DashboardCard
              id="concierge-thread"
              eyebrow="CONTEXTUAL AGENTS"
              title="Concierge thread"
              subtitle={conciergeConversation?.title}
              agentId="agent-concierge"
              agentState="active"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full px-3 py-2">
                <div className="flex flex-col gap-3">
                  {conciergeConversation?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--elevated-2] border border-[--border-default] mt-0.5">
                          <Sparkles className="h-3 w-3 text-[--accent-vivid]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[88%] rounded-[8px] px-2.5 py-2 text-xs leading-relaxed whitespace-pre-line ${
                          msg.role === "user"
                            ? "bg-[--accent-dim] border border-[--border-active] text-[--text-primary] rounded-tr-[3px]"
                            : "bg-[--elevated] border border-[--border-subtle] text-[--text-secondary] rounded-tl-[3px]"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>

        {/* ── Outcomes KPIs ────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {adoption && (
            <DashboardCard id="kpi-adoption" eyebrow="OUTCOME" title={adoption.label}>
              <KpiTile
                label="vs. baseline"
                value={`${adoption.current}%`}
                trend={adoption.trend}
                trendValue={adoption.trendValue}
                trendLabel={`target ${adoption.target}%`}
                status="success"
              />
            </DashboardCard>
          )}
          {capability && (
            <DashboardCard id="kpi-capability" eyebrow="OUTCOME" title={capability.label}>
              <KpiTile
                label="post-program"
                value={String(capability.current)}
                trend={capability.trend}
                trendValue={capability.trendValue}
                trendLabel={`target ${capability.target}`}
                status="success"
              />
            </DashboardCard>
          )}
          {cycleTime && (
            <DashboardCard id="kpi-cycle" eyebrow="OUTCOME" title={cycleTime.label}>
              <KpiTile
                label="propose → decided"
                value={`${cycleTime.current}d`}
                trend={cycleTime.trend}
                trendValue={cycleTime.trendValue}
                trendLabel={`target ${cycleTime.target}d`}
                status="success"
              />
            </DashboardCard>
          )}
          {governance && (
            <DashboardCard id="kpi-governance" eyebrow="OUTCOME" title={governance.label}>
              <KpiTile
                label="pillar coverage"
                value={`${governance.current}%`}
                trend={governance.trend}
                trendValue={governance.trendValue}
                trendLabel={`target ${governance.target}%`}
                status="info"
              />
            </DashboardCard>
          )}
        </div>

        {/* ── Knowledge architecture preview ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="min-h-[280px]">
            <DashboardCard id="k-desk" eyebrow="KNOWLEDGE" title="Desk" subtitle="Operational surface"
              actions={
                <Link href="/portal/knowledge" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
                  Architecture <ArrowRight className="h-3 w-3" />
                </Link>
              }
              bodyClassName="overflow-hidden">
              <ScrollArea className="h-full">
                <KnowledgeShelf shelf="desk" items={desk} compact />
              </ScrollArea>
            </DashboardCard>
          </div>
          <div className="min-h-[280px]">
            <DashboardCard id="k-bookshelf" eyebrow="KNOWLEDGE" title="Bookshelf" subtitle="Promoted, canonical"
              bodyClassName="overflow-hidden">
              <ScrollArea className="h-full">
                <KnowledgeShelf shelf="bookshelf" items={bookshelf} compact />
              </ScrollArea>
            </DashboardCard>
          </div>
          <div className="min-h-[280px]">
            <DashboardCard id="k-cabinet" eyebrow="KNOWLEDGE" title="Filing Cabinet" subtitle="Archived but retrievable"
              bodyClassName="overflow-hidden">
              <ScrollArea className="h-full">
                <KnowledgeShelf shelf="cabinet" items={cabinet} compact />
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>

        {/* ── Trust footer ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <TrustPillar
            icon={Activity}
            title="Full transparency"
            blurb="Every artifact, decision, and agent action is on this portal — nothing in inboxes."
          />
          <TrustPillar
            icon={Compass}
            title="Reversibility"
            blurb="Decisions support defer & reject. Approved decisions are versioned, not destroyed."
          />
          <TrustPillar
            icon={FileText}
            title="Artifact proof"
            blurb="Every artifact carries owner, version, last review, and the decisions that cite it."
          />
          <TrustPillar
            icon={Shield}
            title="Accountability"
            blurb="Success criteria are defined upfront and tracked in Outcomes. Nothing is unmoored."
          />
        </div>
      </div>
    </div>
  );
}

function PromiseTile({ icon: Icon, label, value, sub }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <DashboardCard id={`promise-${label}`} eyebrow="WORKSPACE" title={label}>
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

function TrustPillar({ icon: Icon, title, blurb }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  blurb: string;
}) {
  return (
    <div className="rounded-[--radius-lg] bg-[--panel-bg] border border-[--border-subtle] p-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[--accent-vivid]" />
        <p className="text-xs font-semibold text-[--text-primary]">{title}</p>
      </div>
      <p className="text-xs text-[--text-muted] leading-snug">{blurb}</p>
    </div>
  );
}
