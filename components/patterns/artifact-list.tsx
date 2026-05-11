"use client";
import React from "react";
import { Star, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { ContentTag } from "@/components/ui/content-tag";
import type { Artifact, ReviewState } from "@/lib/portal/types";

const REVIEW_TONE: Record<ReviewState, { tag: React.ComponentProps<typeof ContentTag>["variant"]; label: string }> = {
  draft:             { tag: "default", label: "Draft" },
  "in-review":       { tag: "warning", label: "In review" },
  approved:          { tag: "success", label: "Approved" },
  "needs-revision":  { tag: "danger",  label: "Needs revision" },
  superseded:        { tag: "default", label: "Superseded" },
};

const TYPE_LABEL: Record<Artifact["type"], string> = {
  roadmap:                "Roadmap",
  framework:              "Framework",
  blueprint:              "Blueprint",
  curriculum:             "Curriculum",
  briefing:               "Briefing",
  "decision-architecture": "Decision arch.",
  "knowledge-map":        "Knowledge map",
  "activation-plan":      "Activation plan",
  "risk-register":        "Risk register",
  "impact-report":        "Impact report",
};

interface ArtifactListProps {
  artifacts: Artifact[];
  className?: string;
  emptyHint?: string;
}

export function ArtifactList({ artifacts, className, emptyHint }: ArtifactListProps) {
  if (artifacts.length === 0) {
    return (
      <div className={cn("flex h-full items-center justify-center px-3 py-6 text-center text-xs text-[--text-muted]", className)}>
        {emptyHint ?? "No artifacts in this view."}
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col divide-y divide-[--border-subtle]", className)}>
      {artifacts.map((art) => {
        const tone = REVIEW_TONE[art.reviewState];
        const current = art.versions.find((v) => v.id === art.currentVersionId) ?? art.versions[0];
        const reviewedAgo = relativeDays(art.lastReviewedAt);
        return (
          <article key={art.id} className="flex flex-col gap-1.5 px-3 py-3 hover:bg-[--elevated] transition-colors">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-[--text-primary] truncate">{art.name}</p>
                  {art.canonical && (
                    <span title="Canonical — promoted to the workspace Bookshelf" className="text-[--accent-vivid]">
                      <Star className="h-3 w-3 fill-[--accent-vivid]" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-[--text-muted] truncate leading-snug">{art.description}</p>
              </div>
              <ContentTag variant={tone.tag} dot>{tone.label}</ContentTag>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
              <span className="text-[--text-muted]">{TYPE_LABEL[art.type]}</span>
              <span className="flex items-center gap-1 text-[--text-muted]">
                <span className="text-[--text-muted]">v</span>
                <span className="font-mono tabular-nums text-[--text-secondary]">{current.version}</span>
              </span>
              <span className="text-[--text-muted] truncate">Owner · <span className="text-[--text-secondary]">{art.ownerName}</span></span>
              <span className="flex items-center gap-1 text-[--text-muted]">
                <Clock className="h-3 w-3" />
                {reviewedAgo}
              </span>
              {art.linkedDecisionIds.length > 0 && (
                <span className="text-[--text-muted]">
                  Linked decisions · <span className="text-[--text-secondary]">{art.linkedDecisionIds.length}</span>
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function relativeDays(date: Date): string {
  const diff = Math.round((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "Reviewed today";
  if (diff === 1) return "Reviewed yesterday";
  return `Reviewed ${diff}d ago`;
}
