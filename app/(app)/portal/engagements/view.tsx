"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Target, AlertTriangle, ListChecks } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentTag } from "@/components/ui/content-tag";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { PortalStatusCard } from "@/components/patterns/portal-status-card";
import type { Engagement, PortalSnapshot } from "@/lib/portal/types";
import type { MembershipContext } from "@/lib/auth/session";

const TASK_TONE: Record<string, React.ComponentProps<typeof ContentTag>["variant"]> = {
  todo: "default", "in-progress": "accent", blocked: "danger", complete: "success",
};

interface EngagementsViewProps {
  snapshot: PortalSnapshot;
  membership: MembershipContext;
}

export function EngagementsView({ snapshot, membership: _membership }: EngagementsViewProps) {
  const {
    engagements: mockEngagements,
    artifacts: mockArtifacts,
    tasks: mockTasks,
    decisions: mockDecisions,
  } = snapshot;
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Engagements"
        title="What we're trying to accomplish"
        description={`${mockEngagements.length} concurrent engagements · success criteria, milestones, and risks for each.`}
        badge={`${mockEngagements.filter((e) => e.status === "active").length} active`}
        badgeVariant="success"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mockEngagements.map((engagement) => (
            <div key={engagement.id} className="min-h-[260px]">
              <DashboardCard
                id={`eng-status-${engagement.id}`}
                eyebrow="ENGAGEMENT"
                title={engagement.name}
                badge={engagement.status}
                badgeVariant={badgeVariant(engagement.status)}
                bodyClassName="overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <PortalStatusCard engagement={engagement} />
                </ScrollArea>
              </DashboardCard>
            </div>
          ))}
        </div>

        {mockEngagements.map((engagement) => (
          <EngagementDetail
            key={engagement.id}
            engagement={engagement}
            artifacts={mockArtifacts.filter((a) => a.engagementId === engagement.id)}
            tasks={mockTasks.filter((t) => t.engagementId === engagement.id)}
            decisions={mockDecisions.filter((d) => d.engagementId === engagement.id)}
          />
        ))}
      </div>
    </div>
  );
}

function badgeVariant(status: Engagement["status"]): React.ComponentProps<typeof Badge>["variant"] {
  switch (status) {
    case "active":   return "success";
    case "review":   return "accent";
    case "blocked":  return "danger";
    case "complete": return "info";
    case "paused":   return "warning";
  }
}

function EngagementDetail({
  engagement,
  artifacts,
  tasks,
  decisions,
}: {
  engagement: Engagement;
  artifacts: PortalSnapshot["artifacts"];
  tasks: PortalSnapshot["tasks"];
  decisions: PortalSnapshot["decisions"];
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">{engagement.name}</p>
          <ContentTag variant="accent">{engagement.service}</ContentTag>
        </div>
        <Button variant="ghost" size="xs" className="gap-1">
          Open <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="min-h-[240px]">
          <DashboardCard
            id={`eng-${engagement.id}-criteria`}
            eyebrow="SUCCESS CRITERIA"
            title="What 'done' looks like"
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full">
              <ul className="px-3 py-2 space-y-2">
                {engagement.successCriteria.map((sc) => (
                  <li key={sc} className="flex gap-2 text-xs text-[--text-secondary] leading-snug">
                    <Target className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0 mt-0.5" />
                    <span>{sc}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>

        <div className="min-h-[240px]">
          <DashboardCard
            id={`eng-${engagement.id}-risks`}
            eyebrow="RISKS"
            title={`${engagement.risks.length} live risks`}
            badge={engagement.risks.length > 0 ? "Active" : "None"}
            badgeVariant={engagement.risks.length > 0 ? "warning" : "success"}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full">
              <ul className="px-3 py-2 space-y-2">
                {engagement.risks.length === 0 ? (
                  <li className="text-xs text-[--text-muted]">No active risks recorded.</li>
                ) : (
                  engagement.risks.map((risk) => (
                    <li key={risk} className="flex gap-2 text-xs text-[--text-secondary] leading-snug">
                      <AlertTriangle className="h-3.5 w-3.5 text-[--warning] shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>

        <div className="min-h-[240px]">
          <DashboardCard
            id={`eng-${engagement.id}-tally`}
            eyebrow="ENGAGEMENT TALLY"
            title="Artifacts · decisions · tasks"
            bodyClassName="overflow-hidden"
          >
            <div className="px-3 py-3 grid grid-cols-3 gap-3 text-center">
              <div className="space-y-0.5">
                <p className="text-xl font-bold tabular-nums text-[--text-primary]">{artifacts.length}</p>
                <p className="text-xs uppercase tracking-widest text-[--text-muted]">Artifacts</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold tabular-nums text-[--text-primary]">{decisions.length}</p>
                <p className="text-xs uppercase tracking-widest text-[--text-muted]">Decisions</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold tabular-nums text-[--text-primary]">{tasks.length}</p>
                <p className="text-xs uppercase tracking-widest text-[--text-muted]">Tasks</p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="min-h-[300px]">
          <DashboardCard
            id={`eng-${engagement.id}-milestones`}
            eyebrow="MILESTONES & TASKS"
            title="Plan and progress"
            subtitle={`${tasks.filter((t) => t.status === "complete").length} complete · ${tasks.filter((t) => t.status === "blocked").length} blocked`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {tasks.map((task) => (
                  <li key={task.id} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {task.isMilestone && <ListChecks className="h-3 w-3 text-[--accent-vivid] shrink-0" />}
                          <p className="text-xs font-semibold text-[--text-primary] truncate">{task.title}</p>
                        </div>
                        <p className="text-xs text-[--text-muted]">
                          {task.ownerName} · {task.phase}
                          {task.blockedReason ? ` · ${task.blockedReason}` : ""}
                        </p>
                      </div>
                      <ContentTag variant={TASK_TONE[task.status] ?? "default"} dot>{task.status.replace("-", " ")}</ContentTag>
                    </div>
                    {task.progress > 0 && task.status !== "complete" && (
                      <Progress
                        value={task.progress}
                        color={task.status === "blocked" ? "warning" : "accent"}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>

        <div className="min-h-[300px]">
          <DashboardCard
            id={`eng-${engagement.id}-pending-decisions`}
            eyebrow="DECISIONS IN-FLIGHT"
            title="What this engagement asks of you"
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {decisions.length === 0 && (
                  <li className="px-3 py-6 text-center text-xs text-[--text-muted]">No decisions linked to this engagement.</li>
                )}
                {decisions.map((decision) => (
                  <li key={decision.id} className="flex flex-col gap-0.5 px-3 py-2">
                    <p className="text-xs font-semibold text-[--text-primary] leading-snug">{decision.title}</p>
                    <p className="text-xs text-[--text-muted]">
                      {decision.status.replace("-", " ")} · {decision.riskTier} risk · confidence {Math.round(decision.recommendation.confidence * 100)}%
                    </p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>
      </div>
    </section>
  );
}
