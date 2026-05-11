"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, FileText, GitBranch, Star, Sparkles, Check, X } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { Button } from "@/components/ui/button";
import { EvidenceLink } from "@/components/patterns/evidence-link";
import { ArtifactMarkdown } from "@/components/patterns/artifact-markdown";

import type { MembershipContext } from "@/lib/auth/session";
import { canPerform } from "@/lib/auth/membership-gate";
import {
  approveCanonical,
  proposeForCanonical,
  rejectCanonical,
  type CanonicalProposalOutcome,
} from "@/lib/portal/artifact-actions";
import type {
  Artifact,
  Decision,
  Engagement,
  Evidence,
  KnowledgeItem,
} from "@/lib/portal/types";

interface DecayedKnowledge {
  item: KnowledgeItem;
  decayed: {
    confidence: number;
    freshness: "fresh" | "aging" | "stale";
  };
}

interface ArtifactDetailViewProps {
  artifact: Artifact;
  engagement: Engagement | undefined;
  decisions: Decision[];
  evidence: Evidence[];
  knowledge: DecayedKnowledge[];
  membership: MembershipContext;
}

function ProposalBadgeTone(status: NonNullable<Artifact["canonicalProposal"]>["status"]):
  React.ComponentProps<typeof ContentTag>["variant"] {
  switch (status) {
    case "pending":          return "info";
    case "approved":         return "success";
    case "rejected":         return "danger";
    case "needs-revision":   return "warning";
  }
}

const STATE_TONE: Record<Artifact["reviewState"], "default" | "success" | "warning" | "danger" | "info" | "accent"> = {
  draft:            "default",
  "in-review":      "info",
  approved:         "success",
  "needs-revision": "warning",
  superseded:       "default",
};

const FRESHNESS_TONE: Record<string, React.ComponentProps<typeof ContentTag>["variant"]> = {
  fresh: "success",
  aging: "info",
  stale: "warning",
};

export function ArtifactDetailView({
  artifact,
  engagement,
  decisions,
  evidence,
  knowledge,
  membership,
}: ArtifactDetailViewProps) {
  const versions = [...artifact.versions].sort(
    (a, b) => b.changedAt.getTime() - a.changedAt.getTime(),
  );
  const evidenceById = React.useMemo(() => {
    return new Map(evidence.map((e) => [e.id, e]));
  }, [evidence]);
  const canEdit = canPerform(membership.role, "edit-artifact");
  const canApproveCanonical = membership.role === "owner" || membership.role === "executive";
  const [isProposing, startProposing] = useTransition();
  const [isDeciding, startDeciding] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [auditOutcome, setAuditOutcome] = useState<CanonicalProposalOutcome | null>(null);

  const proposal = artifact.canonicalProposal;
  const handleProposeCanonical = () => {
    setActionError(null);
    startProposing(async () => {
      try {
        const outcome = await proposeForCanonical({ artifactId: artifact.id });
        setAuditOutcome(outcome);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Propose failed.");
      }
    });
  };
  const handleApproveCanonical = () => {
    setActionError(null);
    startDeciding(async () => {
      try {
        await approveCanonical({ artifactId: artifact.id });
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Approve failed.");
      }
    });
  };
  const handleRejectCanonical = () => {
    setActionError(null);
    startDeciding(async () => {
      try {
        await rejectCanonical({ artifactId: artifact.id });
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Reject failed.");
      }
    });
  };

  const diff = useArtifactDiff(versions);
  const currentVersion = versions.find((v) => v.id === artifact.currentVersionId) ?? versions[0];

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Living Deliverable"
        title={artifact.name}
        description={artifact.description}
        badge={artifact.reviewState.replace("-", " ")}
        badgeVariant={STATE_TONE[artifact.reviewState]}
        actions={
          <Link
            href="/portal/deliverables"
            className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" /> Library
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <DashboardCard
            id="artifact-meta"
            eyebrow="ARTIFACT"
            title="At a glance"
          >
            <div className="px-3 py-2.5 grid grid-cols-2 gap-2 text-xs">
              <MetaField label="Type">{artifact.type.replace("-", " ")}</MetaField>
              <MetaField label="Owner">{artifact.ownerName}</MetaField>
              <MetaField label="Current version">
                <span className="font-mono">{currentVersion?.version ?? "—"}</span>
              </MetaField>
              <MetaField label="Last reviewed">{artifact.lastReviewedAt.toLocaleDateString()}</MetaField>
              <MetaField label="Engagement">
                {engagement ? (
                  <Link href="/portal/engagements" className="text-[--accent-vivid] hover:underline">
                    {engagement.name}
                  </Link>
                ) : (
                  <span className="text-[--text-muted]">—</span>
                )}
              </MetaField>
              <MetaField label="Canonical">
                {artifact.canonical ? (
                  <ContentTag variant="accent" dot>
                    canonical
                  </ContentTag>
                ) : (
                  <span className="text-[--text-muted]">No</span>
                )}
              </MetaField>
            </div>
          </DashboardCard>

          <DashboardCard
            id="artifact-versions"
            eyebrow="VERSIONS"
            title="Immutable timeline"
            subtitle={`${versions.length} version${versions.length === 1 ? "" : "s"} on file`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[260px]">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {versions.map((v, idx) => {
                  const previous = versions[idx + 1];
                  return (
                    <li key={v.id} className="flex flex-col gap-1 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <GitBranch
                          className={`h-3.5 w-3.5 shrink-0 ${
                            v.id === artifact.currentVersionId ? "text-[--accent-vivid]" : "text-[--text-muted]"
                          }`}
                        />
                        <span className="text-xs font-mono font-semibold text-[--text-primary]">{v.version}</span>
                        {v.id === artifact.currentVersionId && (
                          <ContentTag variant="accent" dot>
                            current
                          </ContentTag>
                        )}
                        <span className="ml-auto text-xs font-mono tabular-nums text-[--text-muted]">
                          {v.changedAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-[--text-secondary] leading-snug">{v.summary}</p>
                      <p className="text-xs text-[--text-muted]">
                        by {v.changedBy}
                        {previous && (
                          <span className="ml-2 font-mono">
                            ↑ from {previous.version}
                          </span>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </DashboardCard>

          <DashboardCard
            id="artifact-promotion"
            eyebrow="CANONICAL PATH"
            title={artifact.canonical ? "Already on the Bookshelf" : "Promotion to canonical"}
            subtitle={
              artifact.canonical
                ? "Reusable across engagements with the original provenance intact."
                : "Propose for canonical to route this artifact through the Governance Auditor's audit."
            }
            badge={proposal ? proposal.status : artifact.canonical ? "canonical" : "not proposed"}
            badgeVariant={
              artifact.canonical ? "accent" :
              proposal?.status === "approved" ? "success" :
              proposal?.status === "rejected" ? "danger" :
              proposal?.status === "needs-revision" ? "warning" :
              proposal?.status === "pending" ? "info" : "default"
            }
            agentId={proposal ? "agent-governance-auditor" : undefined}
            agentState={proposal && !proposal.auditedAt ? "thinking" : undefined}
          >
            <div className="px-3 py-2.5 space-y-2 text-xs">
              {!artifact.canonical && !proposal && (
                <>
                  <p className="text-[--text-secondary] leading-snug">
                    Proposing routes this artifact to the Governance Auditor for an evidence + freshness audit. The
                    audit runs immediately; final approval is still a human gate.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    className="gap-1.5"
                    disabled={!canEdit || isProposing}
                    onClick={handleProposeCanonical}
                  >
                    <Sparkles className="h-3 w-3" />
                    {isProposing ? "Auditing…" : "Propose for canonical"}
                  </Button>
                  {!canEdit && (
                    <p className="text-[--text-muted] leading-snug">
                      Your role ({membership.role}) cannot propose canonical promotions.
                    </p>
                  )}
                </>
              )}

              {proposal && !artifact.canonical && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <MetaField label="Status">
                      <ContentTag variant={ProposalBadgeTone(proposal.status)} dot>
                        {proposal.status}
                      </ContentTag>
                    </MetaField>
                    <MetaField label="Proposed by">{proposal.proposedBy}</MetaField>
                    {proposal.auditVerdict && (
                      <MetaField label="Audit verdict">
                        <ContentTag
                          variant={proposal.auditVerdict === "pass" ? "success" : proposal.auditVerdict === "fail" ? "danger" : "warning"}
                          dot
                        >
                          {proposal.auditVerdict}
                        </ContentTag>
                      </MetaField>
                    )}
                    {proposal.auditedAt && (
                      <MetaField label="Audited">{proposal.auditedAt.toLocaleDateString()}</MetaField>
                    )}
                  </div>
                  {proposal.auditNotes && (
                    <p className="text-[--text-secondary] leading-snug">
                      <strong className="text-[--text-primary] font-mono">Audit notes — </strong>
                      {proposal.auditNotes}
                    </p>
                  )}
                  {(proposal.status === "pending" || proposal.status === "needs-revision") && canApproveCanonical && (
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="primary"
                        className="gap-1.5"
                        disabled={isDeciding}
                        onClick={handleApproveCanonical}
                      >
                        <Check className="h-3 w-3" /> Approve canonical
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5"
                        disabled={isDeciding}
                        onClick={handleRejectCanonical}
                      >
                        <X className="h-3 w-3" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {auditOutcome && (
                <p className="text-[--text-muted] leading-snug">
                  Most recent audit: {auditOutcome.status === "audited" ? auditOutcome.verdict : "skipped"} via {auditOutcome.toolCalls.map((t) => t.tool).join(", ")}.
                </p>
              )}

              {actionError && (
                <p className="text-[--danger] leading-snug">{actionError}</p>
              )}
            </div>
          </DashboardCard>
        </div>

        <DashboardCard
          id="artifact-body"
          eyebrow="BODY"
          title={`v${versions[0]?.version ?? "0.0.0"} — current draft`}
          subtitle={canEdit ? "Edit in the Markdown editor." : `Read-only for ${membership.role}.`}
          actions={
            canEdit && (
              <Link
                href={`/portal/deliverables/${artifact.id}/edit`}
                className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
              >
                Open editor <ArrowRight className="h-3 w-3" />
              </Link>
            )
          }
        >
          <ScrollArea className="h-full max-h-[420px]">
            <div className="px-3 py-3">
              <ArtifactMarkdown body={artifact.body ?? artifact.description} evidenceById={evidenceById} />
            </div>
          </ScrollArea>
        </DashboardCard>

        {diff && (
          <DashboardCard
            id="artifact-diff"
            eyebrow="DIFF"
            title={`v${diff.previousVersion} → v${diff.currentVersion}`}
            subtitle="Line-level diff between the current version and the prior one. Heavy diff UI lands in Phase 4.2."
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[320px]">
              <pre className="px-3 py-2 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
                {diff.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.kind === "add" ? "text-[--success]" :
                      line.kind === "remove" ? "text-[--danger]" :
                      "text-[--text-muted]"
                    }
                  >
                    {line.kind === "add" ? "+ " : line.kind === "remove" ? "- " : "  "}
                    {line.text}
                  </div>
                ))}
              </pre>
            </ScrollArea>
          </DashboardCard>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard
            id="artifact-decisions"
            eyebrow="LINKED DECISIONS"
            title={`${decisions.length} decision${decisions.length === 1 ? "" : "s"} cite this artifact`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[320px]">
              {decisions.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  No decisions reference this artifact yet.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {decisions.map((d) => (
                    <li key={d.id} className="flex flex-col gap-1 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                        <Link
                          href={`/portal/decisions?focus=${d.id}`}
                          className="text-xs font-semibold text-[--text-primary] flex-1 truncate hover:underline"
                        >
                          {d.title}
                        </Link>
                        <ContentTag
                          variant={
                            d.riskTier === "high" ? "warning" : d.riskTier === "medium" ? "info" : "default"
                          }
                          dot
                        >
                          {d.riskTier} risk
                        </ContentTag>
                      </div>
                      <p className="text-xs text-[--text-muted]">
                        {d.status.replace("-", " ")} · confidence {Math.round(d.recommendation.confidence * 100)}% · proposed by {d.proposedBy}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </DashboardCard>

          <DashboardCard
            id="artifact-evidence"
            eyebrow="EVIDENCE VAULT"
            title={`${evidence.length} evidence row${evidence.length === 1 ? "" : "s"} attached`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[320px]">
              {evidence.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  No evidence attached. Cite at least one row before promoting to canonical.
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
        </div>

        <DashboardCard
          id="artifact-knowledge"
          eyebrow="KNOWLEDGE ARCHITECTURE"
          title="Related knowledge with decayed confidence"
          subtitle="Confidence figures here are recomputed at request time via decayConfidence(). Compare against the original to spot drift."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[320px]">
            {knowledge.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                No knowledge items match this artifact&apos;s vocabulary yet.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {knowledge.map(({ item, decayed }) => (
                  <li key={item.id} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Star
                        className={`h-3.5 w-3.5 shrink-0 ${
                          item.canonical ? "text-[--accent-vivid] fill-[--accent-vivid]" : "text-[--text-muted]"
                        }`}
                      />
                      <p className="text-xs font-semibold text-[--text-primary] flex-1 truncate">{item.title}</p>
                      <ContentTag variant={FRESHNESS_TONE[decayed.freshness]} dot>
                        {decayed.freshness}
                      </ContentTag>
                    </div>
                    <p className="text-xs text-[--text-muted]">
                      {item.shelf} · {item.memoryTier} · live confidence {Math.round(decayed.confidence * 100)}% (was {Math.round(item.confidence * 100)}%)
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DashboardCard>
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

interface DiffLine {
  kind: "context" | "add" | "remove";
  text: string;
}

interface ArtifactDiff {
  currentVersion: string;
  previousVersion: string;
  lines: DiffLine[];
}

function useArtifactDiff(versions: ArtifactDetailViewProps["artifact"]["versions"]): ArtifactDiff | null {
  return React.useMemo(() => {
    if (versions.length < 2) return null;
    const current = versions[0];
    const previous = versions[1];
    if (!current.body || !previous.body) return null;
    const a = previous.body.split(/\r?\n/);
    const b = current.body.split(/\r?\n/);
    const lines: DiffLine[] = naiveLineDiff(a, b);
    return {
      currentVersion: current.version,
      previousVersion: previous.version,
      lines,
    };
  }, [versions]);
}

// Very small LCS-based line diff. Sufficient for the artifact bodies we
// expect (≤200 lines). For longer artifacts swap in `diff` package in
// Phase 4.2.
function naiveLineDiff(a: string[], b: string[]): DiffLine[] {
  const m = a.length;
  const n = b.length;
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      if (a[i] === b[j]) lcs[i][j] = lcs[i + 1][j + 1] + 1;
      else lcs[i][j] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ kind: "context", text: a[i] });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ kind: "remove", text: a[i] });
      i += 1;
    } else {
      out.push({ kind: "add", text: b[j] });
      j += 1;
    }
  }
  while (i < m) out.push({ kind: "remove", text: a[i++] });
  while (j < n) out.push({ kind: "add", text: b[j++] });
  return out;
}
