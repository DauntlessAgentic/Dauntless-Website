"use client";
import React from "react";
import { cn } from "@/lib/cn";
import { Progress } from "@/components/ui/progress";
import { ContentTag } from "@/components/ui/content-tag";
import type { Engagement } from "@/lib/portal/types";

const STATUS_TONE: Record<Engagement["status"], { tag: React.ComponentProps<typeof ContentTag>["variant"]; label: string }> = {
  active:   { tag: "success", label: "Active" },
  review:   { tag: "accent",  label: "In review" },
  blocked:  { tag: "danger",  label: "Blocked" },
  complete: { tag: "info",    label: "Complete" },
  paused:   { tag: "warning", label: "Paused" },
};

const SERVICE_ACCENT: Record<Engagement["service"], string> = {
  consulting: "rgb(var(--svc-consulting-rgb))",
  training:   "rgb(var(--svc-training-rgb))",
  agentic:    "rgb(var(--svc-agentic-rgb))",
};

const PHASE_ORDER: Array<{ phase: Engagement["phase"]; label: string }> = [
  { phase: "discovery", label: "Discovery" },
  { phase: "design",    label: "Design" },
  { phase: "deliver",   label: "Deliver" },
  { phase: "activate",  label: "Activate" },
  { phase: "compound",  label: "Compound" },
];

function PhaseRail({ current }: { current: Engagement["phase"] }) {
  const currentIdx = PHASE_ORDER.findIndex((p) => p.phase === current);
  return (
    <div className="flex items-center gap-1">
      {PHASE_ORDER.map((p, idx) => {
        const reached = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={p.phase} className="flex items-center gap-1 flex-1 min-w-0">
            <span
              className={cn(
                "h-1.5 flex-1 rounded-full",
                reached ? "bg-[--accent-bright]" : "bg-[--elevated-2]",
                isCurrent && "shadow-[--shadow-accent]",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

interface PortalStatusCardProps {
  engagement: Engagement;
  className?: string;
}

export function PortalStatusCard({ engagement, className }: PortalStatusCardProps) {
  const tone = STATUS_TONE[engagement.status];
  const accent = SERVICE_ACCENT[engagement.service];
  const dueLabel = relativeDue(engagement.targetCloseAt);
  const currentPhaseLabel = PHASE_ORDER.find((p) => p.phase === engagement.phase)?.label ?? engagement.phase;
  return (
    <div className={cn("flex flex-col gap-3 p-3", className)}>
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className="mt-1 h-2 w-2 rounded-full shrink-0"
          style={{ background: accent }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[--text-primary] truncate">{engagement.name}</p>
          <p className="text-xs text-[--text-muted] truncate">
            {currentPhaseLabel} · {engagement.ownerName}
          </p>
        </div>
        <ContentTag variant={tone.tag} dot>{tone.label}</ContentTag>
      </div>

      <PhaseRail current={engagement.phase} />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[--text-muted]">
          <span>Progress</span>
          <span className="font-mono tabular-nums text-[--text-secondary]">{engagement.progress}%</span>
        </div>
        <Progress
          value={engagement.progress}
          color={engagement.status === "blocked" ? "warning" : engagement.status === "complete" ? "success" : "accent"}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-[--text-muted]">Target close</span>
        <span className="text-[--text-secondary]">{dueLabel}</span>
      </div>

      {engagement.risks.length > 0 && (
        <ul className="mt-1 space-y-1">
          {engagement.risks.slice(0, 2).map((risk) => (
            <li key={risk} className="flex gap-1.5 text-xs text-[--text-muted]">
              <span className="text-[--warning] shrink-0">·</span>
              <span className="leading-snug">{risk}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function relativeDue(target: Date): string {
  const diffMs = target.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays > 0) return `in ${diffDays}d`;
  return `${Math.abs(diffDays)}d overdue`;
}
