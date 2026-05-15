"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronLeft, Clock, FileText, MessageSquare, X } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { Textarea } from "@/components/ui/textarea";
import { EvidenceLink } from "@/components/patterns/evidence-link";
import { ActorBadge } from "@/components/patterns/actor-badge";
import { announce } from "@/components/patterns/polite-announcer";

import type { MembershipContext } from "@/lib/auth/session";
import { canPerform } from "@/lib/auth/membership-gate";
import { approveDecision, deferDecision, rejectDecision } from "@/lib/portal/actions";
import {
  getDecisionComments,
  postDecisionComment,
} from "@/lib/portal/decision-comments-actions";
import type { DecisionComment } from "@/lib/portal/decision-comments";
import type {
  Artifact,
  AuditEntry,
  Decision,
  Engagement,
  Evidence,
} from "@/lib/portal/types";

interface DecisionDetailViewProps {
  decision: Decision;
  engagement?: Engagement;
  evidence: Evidence[];
  artifacts: Artifact[];
  auditEntries: AuditEntry[];
  membership: MembershipContext;
}

const STATUS_TONE: Record<Decision["status"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  "pending-approval": "info",
  approved: "success",
  deferred: "warning",
  rejected: "danger",
  superseded: "default",
};

export function DecisionDetailView({
  decision,
  engagement,
  evidence,
  artifacts,
  auditEntries,
  membership,
}: DecisionDetailViewProps) {
  const canApprove = canPerform(membership.role, "approve-decision");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<DecisionComment[]>([]);
  const [draft, setDraft] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentPending, startComment] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getDecisionComments(decision.id).then((rows) => {
      if (!cancelled) setComments(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [decision.id]);

  const submitComment = () => {
    setCommentError(null);
    startComment(async () => {
      try {
        await postDecisionComment({ decisionId: decision.id, body: draft });
        setDraft("");
        const rows = await getDecisionComments(decision.id);
        setComments(rows);
        announce("Comment posted.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Comment failed.";
        setCommentError(msg);
        announce(msg, "assertive");
      }
    });
  };

  const handle = (action: (input: { decisionId: string }) => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try {
        await action({ decisionId: decision.id });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Decision Register"
        title={decision.title}
        description={engagement ? `Engagement · ${engagement.name}` : "Workspace-wide decision"}
        badge={decision.status.replace("-", " ")}
        badgeVariant={STATUS_TONE[decision.status] ?? undefined}
        actions={
          <Link href="/portal/decisions" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" /> Register
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <DashboardCard id="dec-meta" eyebrow="META" title="At a glance">
            <div className="px-3 py-2.5 grid grid-cols-2 gap-2 text-xs">
              <MetaField label="Risk tier">
                <ContentTag variant={decision.riskTier === "high" ? "warning" : decision.riskTier === "medium" ? "info" : "default"} dot>
                  {decision.riskTier}
                </ContentTag>
              </MetaField>
              <MetaField label="Confidence">{Math.round(decision.recommendation.confidence * 100)}%</MetaField>
              <MetaField label="Proposed by">{decision.proposedBy}</MetaField>
              <MetaField label="Due">{decision.dueAt ? decision.dueAt.toLocaleDateString() : "—"}</MetaField>
              {decision.decidedBy && <MetaField label="Decided by">{decision.decidedBy}</MetaField>}
              {decision.decidedAt && <MetaField label="Decided at">{decision.decidedAt.toLocaleDateString()}</MetaField>}
            </div>
          </DashboardCard>

          <div className="md:col-span-2">
            <DashboardCard
              id="dec-recommendation"
              eyebrow="RECOMMENDATION"
              title={decision.recommendation.summary.slice(0, 80)}
            >
              <div className="px-3 py-2.5 space-y-2 text-xs text-[--text-secondary] leading-snug">
                <p>{decision.recommendation.summary}</p>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Rationale</p>
                  <p>{decision.recommendation.rationale}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Options</p>
                  <ul className="flex flex-col gap-1.5 mt-1">
                    {decision.recommendation.options.map((option) => (
                      <li
                        key={option.label}
                        className={`rounded-[--radius-md] px-2 py-1.5 leading-snug ${
                          option.isDefault
                            ? "bg-[--accent-dim] border border-[--border-active] text-[--text-primary]"
                            : "bg-[--elevated] border border-[--border-subtle]"
                        }`}
                      >
                        <p className="font-semibold">
                          {option.label}
                          {option.isDefault ? " · default" : ""}
                        </p>
                        <p className="text-[--text-muted]">{option.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                {decision.status === "pending-approval" && (
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[--border-subtle]">
                    <Button size="sm" variant="primary" className="gap-1.5" disabled={!canApprove || isPending} onClick={() => handle(approveDecision)}>
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-1.5" disabled={!canApprove || isPending} onClick={() => handle(deferDecision)}>
                      <Clock className="h-3 w-3" /> Defer
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1.5" disabled={!canApprove || isPending} onClick={() => handle(rejectDecision)}>
                      <X className="h-3 w-3" /> Reject
                    </Button>
                    {/* Advisory action #24: "comment to a human" affordance gets the same visual weight. */}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5"
                      onClick={() => {
                        const el = document.getElementById("decision-comment-input") as HTMLTextAreaElement | null;
                        if (el) {
                          el.focus();
                          // Audit-3 §L3: honor reduced-motion preference.
                          const reduceMotion =
                            typeof window !== "undefined" &&
                            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                          el.scrollIntoView({
                            behavior: reduceMotion ? "auto" : "smooth",
                            block: "center",
                          });
                        }
                      }}
                    >
                      <MessageSquare className="h-3 w-3" /> Comment to a human
                    </Button>
                  </div>
                )}
                {error && <p className="text-xs text-[--danger]">{error}</p>}
                {!canApprove && (
                  <p className="text-xs text-[--text-muted]">
                    Your role ({membership.role}) can read this decision but not change its outcome.
                  </p>
                )}
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Advisory action #24: comment thread, parity weight with run-agent. */}
        <DashboardCard
          id="dec-comments"
          eyebrow="COMMENTS"
          title={`${comments.length} comment${comments.length === 1 ? "" : "s"}`}
          subtitle="Decision-level discussion. Visible to every workspace member. Same visual weight as approve/defer."
        >
          <div className="px-3 py-3 space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-[--text-muted]">
                No comments yet. Use the box below to send a note to other workspace members.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-[--radius-md] border border-[--border-subtle] bg-[--elevated] px-3 py-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ActorBadge kind={c.authorKind} name={c.author} />
                      <span className="text-xs text-[--text-muted] font-mono tabular-nums">
                        {c.postedAt.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug whitespace-pre-wrap">
                      {c.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="decision-comment-input"
                className="text-xs text-[--text-muted] uppercase tracking-widest"
              >
                Add a comment
              </label>
              <Textarea
                id="decision-comment-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Tell other workspace members what you think. Plain English."
                rows={3}
                aria-describedby="decision-comment-error"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="gap-1.5"
                  disabled={commentPending || draft.trim().length === 0}
                  onClick={submitComment}
                >
                  <MessageSquare className="h-3 w-3" />
                  {commentPending ? "Posting…" : "Post comment"}
                </Button>
                {commentError ? (
                  <span id="decision-comment-error" role="alert" className="text-xs text-[--danger]">
                    {commentError}
                  </span>
                ) : (
                  <span id="decision-comment-error" className="sr-only" />
                )}
              </div>
            </div>
          </div>
        </DashboardCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard
            id="dec-evidence"
            eyebrow="EVIDENCE VAULT"
            title={`${evidence.length} evidence row${evidence.length === 1 ? "" : "s"} cited`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[300px]">
              {evidence.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  No evidence cited. The Governance Auditor will flag this on the next audit.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5 px-3 py-2.5">
                  {evidence.map((e) => (
                    <EvidenceLink key={e.id} kind={e.kind} title={e.title} source={e.source} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </DashboardCard>

          <DashboardCard
            id="dec-artifacts"
            eyebrow="LINKED ARTIFACTS"
            title={`${artifacts.length} living deliverable${artifacts.length === 1 ? "" : "s"}`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[300px]">
              {artifacts.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  This decision doesn't reference any artifacts.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {artifacts.map((a) => (
                    <li key={a.id} className="flex items-center gap-2 px-3 py-2">
                      <FileText className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                      <Link
                        href={`/portal/deliverables/${a.id}`}
                        className="flex-1 text-xs font-semibold text-[--text-primary] truncate hover:underline"
                      >
                        {a.name}
                      </Link>
                      <ContentTag variant={a.canonical ? "accent" : "default"}>
                        {a.canonical ? "canonical" : a.reviewState}
                      </ContentTag>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </DashboardCard>
        </div>

        <DashboardCard
          id="dec-audit"
          eyebrow="AUDIT TRAIL"
          title={`${auditEntries.length} audit entr${auditEntries.length === 1 ? "y" : "ies"}`}
          subtitle="Every state transition for this decision, newest first."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[320px]">
            {auditEntries.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                No audit entries reference this decision yet.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {auditEntries.map((entry) => (
                  <li key={entry.id} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ContentTag variant={entry.actorKind === "agent" ? "accent" : "info"}>
                        {entry.actorKind}
                      </ContentTag>
                      <p className="text-xs font-semibold text-[--text-primary]">{entry.action.replace("-", " ")}</p>
                      <span className="ml-auto text-xs font-mono tabular-nums text-[--text-muted]">{entry.at.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{entry.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DashboardCard>

        <div className="flex items-center justify-end">
          <Link href="/portal/decisions" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Back to register <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
      <p className="text-xs uppercase tracking-widest text-[--text-muted]">{label}</p>
      <div className="text-xs text-[--text-primary]">{children}</div>
    </div>
  );
}
