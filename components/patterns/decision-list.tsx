"use client";
import React from "react";
import { Check, Clock, ShieldAlert, ShieldCheck, Shield, Sparkles, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { ContentTag } from "@/components/ui/content-tag";
import type { Decision, RiskTier } from "@/lib/portal/types";

const STATUS_TONE: Record<Decision["status"], { tag: React.ComponentProps<typeof ContentTag>["variant"]; label: string }> = {
  "pending-approval": { tag: "warning", label: "Pending approval" },
  approved:           { tag: "success", label: "Approved" },
  deferred:           { tag: "info",    label: "Deferred" },
  rejected:           { tag: "danger",  label: "Rejected" },
  superseded:         { tag: "default", label: "Superseded" },
};

const RISK_TONE: Record<RiskTier, { Icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  low:    { Icon: Shield,       color: "text-[--text-muted]",  label: "Low risk" },
  medium: { Icon: ShieldCheck,  color: "text-[--info]",        label: "Medium risk" },
  high:   { Icon: ShieldAlert,  color: "text-[--warning]",     label: "High risk" },
};

interface DecisionListProps {
  decisions: Decision[];
  showActions?: boolean;
  emptyHint?: string;
  className?: string;
}

export function DecisionList({ decisions, showActions = false, emptyHint, className }: DecisionListProps) {
  if (decisions.length === 0) {
    return (
      <div className={cn("flex h-full items-center justify-center px-3 py-6 text-center text-xs text-[--text-muted]", className)}>
        {emptyHint ?? "No decisions in this view."}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col divide-y divide-[--border-subtle]", className)}>
      {decisions.map((decision) => {
        const tone = STATUS_TONE[decision.status];
        const risk = RISK_TONE[decision.riskTier];
        const RiskIcon = risk.Icon;
        const due = formatDue(decision);
        const confidence = Math.round(decision.recommendation.confidence * 100);
        return (
          <article key={decision.id} className="flex flex-col gap-2 px-3 py-3 hover:bg-[--elevated] transition-colors">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[--text-primary] leading-snug">{decision.title}</p>
                <p className="mt-1 text-xs text-[--text-secondary] leading-snug">
                  <span className="text-[--text-muted]">Recommendation · </span>
                  {decision.recommendation.summary}
                </p>
              </div>
              <ContentTag variant={tone.tag} dot>{tone.label}</ContentTag>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className={cn("flex items-center gap-1", risk.color)}>
                <RiskIcon className="h-3 w-3" />
                {risk.label}
              </span>
              {due && (
                <span className="flex items-center gap-1 text-[--text-muted]">
                  <Clock className="h-3 w-3" />
                  {due}
                </span>
              )}
              <span className="flex items-center gap-1 text-[--text-muted]">
                <Sparkles className="h-3 w-3 text-[--accent-vivid]" />
                <span className="font-mono tabular-nums text-[--text-secondary]">{confidence}%</span>
                <span>confidence</span>
              </span>
              <span className="flex items-center gap-1 text-[--text-muted] truncate">
                Proposed by <span className="text-[--text-secondary] truncate">{decision.proposedBy.startsWith("agent-") ? humanize(decision.proposedBy) : decision.proposedBy}</span>
              </span>
            </div>

            {showActions && decision.status === "pending-approval" && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Button variant="primary" size="xs" className="gap-1">
                  <Check className="h-3 w-3" /> Approve default
                </Button>
                <Button variant="ghost" size="xs" className="gap-1">
                  <ArrowRight className="h-3 w-3" /> Open
                </Button>
                <Button variant="ghost" size="xs" className="gap-1">
                  Defer
                </Button>
                <Button variant="ghost" size="xs" className="gap-1 text-[--text-muted] hover:text-[--danger]">
                  <X className="h-3 w-3" /> Reject
                </Button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function formatDue(decision: Decision): string | null {
  if (decision.status !== "pending-approval") {
    if (decision.decidedAt) {
      const diffDays = Math.round((Date.now() - decision.decidedAt.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays === 0) return "Decided today";
      return `Decided ${diffDays}d ago`;
    }
    return null;
  }
  if (!decision.dueAt) return null;
  const diffDays = Math.round((decision.dueAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Due today";
  if (diffDays > 0) return `Due in ${diffDays}d`;
  return `${Math.abs(diffDays)}d overdue`;
}

function humanize(agentId: string): string {
  return agentId
    .replace(/^agent-/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
