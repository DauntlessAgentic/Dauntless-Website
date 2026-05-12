"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, FileText, GitBranch, Star } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { EvidenceLink } from "@/components/patterns/evidence-link";

import type { MembershipContext } from "@/lib/auth/session";
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
  membership: _membership,
}: ArtifactDetailViewProps) {
  const versions = [...artifact.versions].sort(
    (a, b) => b.changedAt.getTime() - a.changedAt.getTime(),
  );
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
                : "When this artifact's evidence stabilizes, the Governance Auditor proposes it for canonical."
            }
          >
            <div className="px-3 py-2.5 space-y-2 text-xs">
              <p className="text-[--text-secondary] leading-snug">
                Phase 4.1 will wire a one-click &quot;Propose for canonical&quot; action that drops the artifact into
                the Governance Auditor&apos;s queue. Today the path runs through the Decision Register.
              </p>
              <Link
                href="/portal/decisions"
                className="inline-flex items-center gap-1 text-[--accent-vivid] hover:underline"
              >
                Decision Register <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </DashboardCard>
        </div>

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
