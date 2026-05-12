"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, ChevronLeft, ListChecks, Target } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { Progress } from "@/components/ui/progress";

import type { MembershipContext } from "@/lib/auth/session";
import type {
  Artifact,
  Decision,
  Engagement,
  ScheduleItem,
  Signal,
  Task,
} from "@/lib/portal/types";
import type { PatternMatch } from "@/lib/portal/innovation/patterns";

interface CrossEngagementSuggestion {
  artifactId: string;
  artifactName: string;
  sourceEngagementId: string;
  score: number;
  reason: string;
}

interface EngagementDetailViewProps {
  engagement: Engagement;
  artifacts: Artifact[];
  decisions: Decision[];
  tasks: Task[];
  signals: Signal[];
  scheduleItems: ScheduleItem[];
  suggestions: CrossEngagementSuggestion[];
  patternMatches: PatternMatch[];
  membership: MembershipContext;
}

const STATUS_TONE: Record<Engagement["status"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  active: "success",
  review: "accent",
  blocked: "warning",
  complete: "info",
  paused: "default",
};

const TASK_TONE: Record<Task["status"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  todo: "default",
  "in-progress": "accent",
  blocked: "warning",
  complete: "success",
};

export function EngagementDetailView({
  engagement,
  artifacts,
  decisions,
  tasks,
  signals,
  scheduleItems,
  suggestions,
  patternMatches,
  membership: _membership,
}: EngagementDetailViewProps) {
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow={`Engagement · ${engagement.service}`}
        title={engagement.name}
        description={`${engagement.kind} · ${engagement.phase} · owner ${engagement.ownerName}`}
        badge={engagement.status}
        badgeVariant={STATUS_TONE[engagement.status] ?? undefined}
        actions={
          <Link href="/portal/engagements" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" /> Engagements
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <DashboardCard id="eng-progress" eyebrow="PROGRESS" title="Phase progress">
            <div className="px-3 py-2.5 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Progress value={engagement.progress} color="success" />
                <span className="font-mono tabular-nums text-[--text-primary]">{engagement.progress}%</span>
              </div>
              <p className="text-[--text-muted]">
                Phase {engagement.phase} · started {engagement.startedAt.toLocaleDateString()} · target close {engagement.targetCloseAt.toLocaleDateString()}.
              </p>
            </div>
          </DashboardCard>

          <DashboardCard id="eng-criteria" eyebrow="SUCCESS CRITERIA" title="What 'done' looks like" bodyClassName="overflow-hidden">
            <ScrollArea className="h-full max-h-[180px]">
              <ul className="px-3 py-2.5 space-y-1.5">
                {engagement.successCriteria.map((sc) => (
                  <li key={sc} className="flex items-start gap-2 text-xs text-[--text-secondary] leading-snug">
                    <Target className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0 mt-0.5" />
                    <span>{sc}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>

          <DashboardCard id="eng-risks" eyebrow="RISKS" title={`${engagement.risks.length} active`} bodyClassName="overflow-hidden">
            <ScrollArea className="h-full max-h-[180px]">
              <ul className="px-3 py-2.5 space-y-1.5">
                {engagement.risks.length === 0 ? (
                  <li className="text-xs text-[--text-muted]">No active risks recorded.</li>
                ) : (
                  engagement.risks.map((risk) => (
                    <li key={risk} className="flex items-start gap-2 text-xs text-[--text-secondary] leading-snug">
                      <AlertTriangle className="h-3.5 w-3.5 text-[--warning] shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard id="eng-artifacts" eyebrow="ARTIFACTS" title={`${artifacts.length} living deliverable${artifacts.length === 1 ? "" : "s"}`} bodyClassName="overflow-hidden">
            <ScrollArea className="h-full max-h-[300px]">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {artifacts.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 px-3 py-2">
                    <Link href={`/portal/deliverables/${a.id}`} className="flex-1 text-xs font-semibold text-[--text-primary] truncate hover:underline">
                      {a.name}
                    </Link>
                    <ContentTag variant={a.canonical ? "accent" : "default"}>
                      {a.canonical ? "canonical" : a.reviewState}
                    </ContentTag>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>

          <DashboardCard id="eng-decisions" eyebrow="DECISIONS" title={`${decisions.length} on file`} bodyClassName="overflow-hidden">
            <ScrollArea className="h-full max-h-[300px]">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {decisions.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 px-3 py-2">
                    <Link href={`/portal/decisions/${d.id}`} className="flex-1 text-xs font-semibold text-[--text-primary] truncate hover:underline">
                      {d.title}
                    </Link>
                    <ContentTag variant={d.riskTier === "high" ? "warning" : d.riskTier === "medium" ? "info" : "default"} dot>
                      {d.riskTier}
                    </ContentTag>
                    <ContentTag variant={d.status === "approved" ? "success" : d.status === "pending-approval" ? "info" : "default"}>
                      {d.status.replace("-", " ")}
                    </ContentTag>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard id="eng-tasks" eyebrow="TASKS" title={`${tasks.length} task${tasks.length === 1 ? "" : "s"} planned`} bodyClassName="overflow-hidden">
            <ScrollArea className="h-full max-h-[300px]">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {tasks.map((task) => (
                  <li key={task.id} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      {task.isMilestone && <ListChecks className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />}
                      <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{task.title}</p>
                      <ContentTag variant={TASK_TONE[task.status]} dot>
                        {task.status.replace("-", " ")}
                      </ContentTag>
                    </div>
                    <p className="text-xs text-[--text-muted]">
                      {task.ownerName} · {task.phase}
                      {task.blockedReason ? ` · ${task.blockedReason}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>

          <DashboardCard id="eng-schedule" eyebrow="UPCOMING" title={`${scheduleItems.length} schedule item${scheduleItems.length === 1 ? "" : "s"}`} bodyClassName="overflow-hidden">
            <ScrollArea className="h-full max-h-[300px]">
              {scheduleItems.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  Nothing scheduled. Propose a touchpoint from /portal/schedule.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {scheduleItems.map((s) => (
                    <li key={s.id} className="flex items-center gap-2 px-3 py-2">
                      <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{s.title}</p>
                      <ContentTag variant="info">{s.kind}</ContentTag>
                      <span className="text-xs font-mono tabular-nums text-[--text-muted]">{s.startsAt.toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard id="eng-cross" eyebrow="CROSS-ENGAGEMENT" title="Canonical artifacts that match" bodyClassName="overflow-hidden">
            <ScrollArea className="h-full max-h-[260px]">
              {suggestions.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  No cross-engagement suggestions yet. Promote more artifacts to canonical to seed.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {suggestions.map((s) => (
                    <li key={s.artifactId} className="flex items-center gap-2 px-3 py-2">
                      <Link href={`/portal/deliverables/${s.artifactId}`} className="flex-1 text-xs font-semibold text-[--text-primary] truncate hover:underline">
                        {s.artifactName}
                      </Link>
                      <span className="text-xs text-[--text-muted]">{s.reason}</span>
                      <span className="text-xs font-mono tabular-nums text-[--text-primary]">{Math.round(s.score * 100)}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </DashboardCard>

          <DashboardCard id="eng-patterns" eyebrow="PATTERN LIBRARY" title="Patterns matched to this engagement" bodyClassName="overflow-hidden">
            <ScrollArea className="h-full max-h-[260px]">
              {patternMatches.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  No patterns match. Broaden the success criteria.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {patternMatches.map((m) => (
                    <li key={m.pattern.id} className="flex items-center gap-2 px-3 py-2">
                      <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{m.pattern.title}</p>
                      <ContentTag variant={m.pattern.maturity === "canonical" ? "success" : m.pattern.maturity === "validated" ? "accent" : "info"}>
                        {m.pattern.maturity}
                      </ContentTag>
                      <span className="text-xs font-mono tabular-nums text-[--text-primary]">{Math.round(m.score * 100)}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </DashboardCard>
        </div>

        <DashboardCard id="eng-signals" eyebrow="SIGNALS" title={`${signals.length} signal${signals.length === 1 ? "" : "s"} tied to this engagement`} bodyClassName="overflow-hidden">
          <ScrollArea className="h-full max-h-[260px]">
            {signals.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                No signals yet for this engagement.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {signals.map((s) => (
                  <li key={s.id} className="flex flex-col gap-0.5 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ContentTag variant={s.severity === "urgent" ? "danger" : s.severity === "important" ? "warning" : "info"} dot>
                        {s.severity}
                      </ContentTag>
                      <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{s.title}</p>
                      <span className="text-xs font-mono tabular-nums text-[--text-muted]">{s.capturedAt.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{s.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DashboardCard>

        <div className="flex items-center justify-end">
          <Link href="/portal/engagements" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Back to all engagements <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
