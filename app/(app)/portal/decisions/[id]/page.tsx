"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, Clock, Sparkles, X,
  Shield, ShieldAlert, ShieldCheck, FileText, History,
} from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ContentTag } from "@/components/ui/content-tag";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EvidenceLink } from "@/components/patterns/evidence-link";
import { useDecisionOverrides } from "@/lib/portal/use-decision-overrides";
import {
  mockArtifacts, mockAuditLog, mockDecisions, mockEngagements, mockEvidence,
} from "@/lib/portal/mock-data";
import type { Decision, RiskTier } from "@/lib/portal/types";

type BadgeTone = "default" | "accent" | "info" | "success" | "warning" | "danger";

const RISK_META: Record<RiskTier, { Icon: React.ComponentType<{ className?: string }>; label: string; tone: BadgeTone }> = {
  low:    { Icon: Shield,       label: "Low risk",    tone: "default" },
  medium: { Icon: ShieldCheck,  label: "Medium risk", tone: "info" },
  high:   { Icon: ShieldAlert,  label: "High risk",   tone: "warning" },
};

const STATUS_TONE: Record<Decision["status"], BadgeTone> = {
  "pending-approval": "warning",
  approved:           "success",
  deferred:           "info",
  rejected:           "danger",
  superseded:         "default",
};

export default function DecisionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const overrides = useDecisionOverrides();

  const decisions = useMemo(() => overrides.apply(mockDecisions), [overrides]);
  const decision = decisions.find((d) => d.id === params.id);

  if (!decision) {
    notFound();
  }

  const engagement = mockEngagements.find((e) => e.id === decision.engagementId);
  const linkedArtifacts = decision.artifactIds
    .map((id) => mockArtifacts.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const linkedEvidence = decision.evidenceIds
    .map((id) => mockEvidence.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const auditTrail = mockAuditLog
    .filter((entry) => entry.refId === decision.id)
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  const risk = RISK_META[decision.riskTier];
  const RiskIcon = risk.Icon;
  const confidence = Math.round(decision.recommendation.confidence * 100);
  const isPending = decision.status === "pending-approval";

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Decision Detail"
        title={decision.title}
        description={engagement ? `${engagement.name} · proposed by ${decision.proposedBy}` : `Proposed by ${decision.proposedBy}`}
        badge={statusLabel(decision.status)}
        badgeVariant={STATUS_TONE[decision.status]}
        actions={
          <>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.back()}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <Link href="/portal/decisions" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
              All decisions <ArrowRight className="h-3 w-3" />
            </Link>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        {/* Header strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="Risk tier">
            <span className={`inline-flex items-center gap-1 ${
              decision.riskTier === "high" ? "text-[--warning]" :
              decision.riskTier === "medium" ? "text-[--info]" :
              "text-[--text-muted]"
            }`}>
              <RiskIcon className="h-3 w-3" />
              {risk.label}
            </span>
          </Field>
          <Field label="Confidence">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[--accent-vivid]" />
              <span className="font-mono tabular-nums text-[--text-primary]">{confidence}%</span>
            </span>
          </Field>
          <Field label={isPending ? "Due" : "Decided"}>
            <span className="inline-flex items-center gap-1 text-[--text-secondary]">
              <Clock className="h-3 w-3 text-[--text-muted]" />
              {timingLabel(decision)}
            </span>
          </Field>
          <Field label="Proposed by">
            <span className="text-[--text-secondary]">{humanize(decision.proposedBy)}</span>
          </Field>
        </div>

        {/* Recommendation + options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 min-h-[360px]">
            <DashboardCard
              id="decision-recommendation"
              eyebrow="RECOMMENDATION"
              title="What Dauntless recommends"
              subtitle={decision.recommendation.summary}
              agentId={isAgent(decision.proposedBy) ? decision.proposedBy : undefined}
              agentState="updated"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="px-3 py-3 space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Rationale</p>
                    <p className="text-xs text-[--text-secondary] leading-relaxed">{decision.recommendation.rationale}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Options</p>
                    <ul className="flex flex-col gap-1.5">
                      {decision.recommendation.options.map((option) => (
                        <li
                          key={option.label}
                          className={`rounded-[--radius-md] px-2.5 py-2 text-xs leading-snug ${
                            option.isDefault
                              ? "bg-[--accent-dim] border border-[--border-active] text-[--text-primary]"
                              : "bg-[--elevated] border border-[--border-subtle] text-[--text-secondary]"
                          }`}
                        >
                          <p className="font-semibold">
                            {option.label}
                            {option.isDefault && <span className="ml-1.5 text-[--accent-vivid]">· default</span>}
                          </p>
                          <p className="text-[--text-muted] mt-0.5">{option.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </DashboardCard>
          </div>

          {/* Action panel */}
          <div className="min-h-[360px]">
            <DashboardCard
              id="decision-action"
              eyebrow="YOUR JUDGMENT"
              title={isPending ? "Approve, defer, or reject" : `Already ${statusLabel(decision.status).toLowerCase()}`}
              subtitle={isPending ? "Default action: approve at the recommended option." : decision.decidedBy ? `Decided by ${decision.decidedBy}` : undefined}
              bodyClassName="overflow-hidden"
            >
              <div className="px-3 py-3 space-y-2">
                {isPending ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full gap-1.5 justify-center"
                      onClick={() => overrides.act(decision.id, "approve")}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve default
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-1.5 justify-center"
                      onClick={() => overrides.act(decision.id, "defer")}
                    >
                      Defer to next cycle
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-1.5 justify-center text-[--text-muted] hover:text-[--danger]"
                      onClick={() => overrides.act(decision.id, "reject")}
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                    <p className="pt-2 text-xs text-[--text-muted] leading-snug">
                      v1 surfaces these actions as session-local overrides. Real
                      state persistence lands with the Phase 2 wire-up PR (see
                      the roadmap).
                    </p>
                  </>
                ) : (
                  <>
                    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-3 py-2">
                      <p className="text-xs text-[--text-muted]">Status</p>
                      <p className="text-xs font-semibold text-[--text-primary]">{statusLabel(decision.status)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-1.5 justify-center"
                      onClick={() => overrides.setStatus(decision.id, "pending-approval")}
                    >
                      Reopen as pending
                    </Button>
                  </>
                )}
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Evidence + linked artifacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="min-h-[260px]">
            <DashboardCard
              id="decision-evidence"
              eyebrow="EVIDENCE VAULT"
              title="What backs this recommendation"
              subtitle={`${linkedEvidence.length} sources`}
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-1.5 px-3 py-2.5">
                  {linkedEvidence.length === 0 ? (
                    <p className="text-xs text-[--text-muted]">No evidence linked yet.</p>
                  ) : (
                    linkedEvidence.map((ev) => (
                      <EvidenceLink key={ev.id} kind={ev.kind} title={ev.title} source={ev.source} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </DashboardCard>
          </div>

          <div className="min-h-[260px]">
            <DashboardCard
              id="decision-artifacts"
              eyebrow="LINKED ARTIFACTS"
              title="Where this decision cites"
              subtitle={`${linkedArtifacts.length} artifacts`}
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {linkedArtifacts.length === 0 ? (
                    <li className="px-3 py-4 text-center text-xs text-[--text-muted]">No artifacts cited.</li>
                  ) : (
                    linkedArtifacts.map((artifact) => (
                      <li key={artifact.id} className="flex items-start gap-2 px-3 py-2">
                        <FileText className="h-3.5 w-3.5 text-[--text-muted] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/portal/deliverables/${artifact.id}`}
                            className="text-xs font-semibold text-[--text-primary] hover:text-[--accent-vivid] hover:underline truncate block"
                          >
                            {artifact.name}
                          </Link>
                          <p className="text-xs text-[--text-muted]">
                            {artifact.reviewState.replace("-", " ")} · v{artifact.versions[0].version}
                          </p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>

        {/* Audit trail */}
        <div className="min-h-[200px]">
          <DashboardCard
            id="decision-audit"
            eyebrow="AUDIT TRAIL"
            title="What's been recorded against this decision"
            subtitle={`${auditTrail.length} entries`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {auditTrail.length === 0 ? (
                  <li className="px-3 py-4 text-center text-xs text-[--text-muted]">No audit entries yet.</li>
                ) : (
                  auditTrail.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-2 px-3 py-2">
                      <History className="h-3.5 w-3.5 text-[--text-muted] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[--text-primary] leading-snug">{entry.detail}</p>
                        <p className="text-xs text-[--text-muted]">
                          {entry.action.replace("-", " ")} · {entry.actor} ({entry.actorKind}) · {entry.riskTier} risk
                        </p>
                      </div>
                      <span className="text-xs font-mono text-[--text-muted] shrink-0 tabular-nums">
                        {relativeAgo(entry.at)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-3 py-2">
      <p className="text-xs uppercase tracking-widest text-[--text-muted]">{label}</p>
      <div className="text-xs text-[--text-primary]">{children}</div>
    </div>
  );
}

function statusLabel(status: Decision["status"]): string {
  switch (status) {
    case "pending-approval": return "Pending approval";
    case "approved":         return "Approved";
    case "deferred":         return "Deferred";
    case "rejected":         return "Rejected";
    case "superseded":       return "Superseded";
  }
}

function timingLabel(decision: Decision): string {
  if (decision.status === "pending-approval") {
    if (!decision.dueAt) return "No due date set";
    const diffDays = Math.round((decision.dueAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return "Today";
    if (diffDays > 0) return `In ${diffDays}d`;
    return `${Math.abs(diffDays)}d overdue`;
  }
  if (!decision.decidedAt) return "—";
  const diffDays = Math.round((Date.now() - decision.decidedAt.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  return `${diffDays}d ago`;
}

function relativeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function isAgent(proposedBy: string): boolean {
  return proposedBy.startsWith("agent-");
}

function humanize(id: string): string {
  if (!id.startsWith("agent-")) return id;
  return id
    .replace(/^agent-/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
