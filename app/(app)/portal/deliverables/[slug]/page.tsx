"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Clock, FileText, GitBranch,
  Star, History,
} from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ContentTag } from "@/components/ui/content-tag";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EvidenceLink } from "@/components/patterns/evidence-link";
import {
  mockArtifacts, mockDecisions, mockEngagements, mockEvidence, mockSignals,
} from "@/lib/portal/mock-data";
import type { Artifact, ArtifactVersion, ReviewState } from "@/lib/portal/types";

type BadgeTone = "default" | "accent" | "info" | "success" | "warning" | "danger";

const REVIEW_TONE: Record<ReviewState, { tag: BadgeTone; label: string }> = {
  draft:             { tag: "default", label: "Draft" },
  "in-review":       { tag: "warning", label: "In review" },
  approved:          { tag: "success", label: "Approved" },
  "needs-revision":  { tag: "danger",  label: "Needs revision" },
  superseded:        { tag: "default", label: "Superseded" },
};

const TYPE_LABEL: Record<Artifact["type"], string> = {
  roadmap:                 "Roadmap",
  framework:               "Framework",
  blueprint:               "Blueprint",
  curriculum:              "Curriculum",
  briefing:                "Briefing",
  "decision-architecture": "Decision architecture",
  "knowledge-map":         "Knowledge map",
  "activation-plan":       "Activation plan",
  "risk-register":         "Risk register",
  "impact-report":         "Impact report",
};

export default function ArtifactDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const artifact = mockArtifacts.find((a) => a.id === params.slug);

  if (!artifact) {
    notFound();
  }

  const versions = [...artifact.versions].sort(
    (a, b) => b.changedAt.getTime() - a.changedAt.getTime(),
  );
  const currentVersion = versions.find((v) => v.id === artifact.currentVersionId) ?? versions[0];
  const previousVersion = versions[versions.indexOf(currentVersion) + 1];

  const [comparisonId, setComparisonId] = useState<string>(previousVersion?.id ?? currentVersion.id);
  const compareTo =
    versions.find((v) => v.id === comparisonId) ?? previousVersion ?? currentVersion;

  const engagement = mockEngagements.find((e) => e.id === artifact.engagementId);
  const linkedDecisions = mockDecisions.filter((d) => artifact.linkedDecisionIds.includes(d.id));
  const linkedEvidence = artifact.linkedEvidenceIds
    .map((id) => mockEvidence.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const relatedSignals = mockSignals
    .filter((s) => s.refId === artifact.id)
    .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());

  const tone = REVIEW_TONE[artifact.reviewState];

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Living Deliverable"
        title={artifact.name}
        description={engagement ? `${engagement.name} · ${TYPE_LABEL[artifact.type]} · owned by ${artifact.ownerName}` : `${TYPE_LABEL[artifact.type]} · owned by ${artifact.ownerName}`}
        badge={artifact.canonical ? "Canonical" : tone.label}
        badgeVariant={artifact.canonical ? "accent" : tone.tag}
        actions={
          <>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.back()}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <Link href="/portal/deliverables" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
              Library <ArrowRight className="h-3 w-3" />
            </Link>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">

        {/* Header strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Type">{TYPE_LABEL[artifact.type]}</Field>
          <Field label="Current version">
            <span className="font-mono tabular-nums text-[--text-primary]">v{currentVersion.version}</span>
          </Field>
          <Field label="Last reviewed">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-[--text-muted]" />
              {relativeDays(artifact.lastReviewedAt)} ago
            </span>
          </Field>
          <Field label={artifact.canonical ? "Bookshelf status" : "Review state"}>
            {artifact.canonical ? (
              <span className="inline-flex items-center gap-1 text-[--accent-vivid]">
                <Star className="h-3 w-3 fill-[--accent-vivid]" /> Canonical
              </span>
            ) : (
              <span className="text-[--text-secondary]">{tone.label}</span>
            )}
          </Field>
        </div>

        {/* Description + version timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 min-h-[300px]">
            <DashboardCard
              id="artifact-description"
              eyebrow="WHAT THIS IS"
              title="Purpose"
              subtitle={artifact.canonical ? "Canonical — promoted to the workspace Bookshelf" : undefined}
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="px-3 py-3 space-y-3">
                  <p className="text-xs text-[--text-secondary] leading-relaxed">{artifact.description}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="primary" size="xs" className="gap-1">
                      <FileText className="h-3 w-3" /> Open canonical view
                    </Button>
                    {!artifact.canonical && (
                      <Button variant="ghost" size="xs" className="gap-1">
                        <Star className="h-3 w-3" /> Propose for canonical
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </DashboardCard>
          </div>

          <div className="min-h-[300px]">
            <DashboardCard
              id="artifact-versions"
              eyebrow="VERSION TIMELINE"
              title={`${versions.length} versions`}
              subtitle="Append-only. Older versions are retrievable."
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col">
                  {versions.map((version) => {
                    const isCurrent = version.id === currentVersion.id;
                    const isCompared = version.id === compareTo.id;
                    return (
                      <li key={version.id}>
                        <button
                          type="button"
                          onClick={() => setComparisonId(version.id)}
                          disabled={isCurrent}
                          className={`w-full text-left flex items-start gap-2 px-3 py-2 border-b border-[--border-subtle] transition-colors ${
                            isCurrent
                              ? "bg-[--accent-dim] border-l-2 border-l-[--border-active] cursor-default"
                              : isCompared
                                ? "bg-[--elevated] border-l-2 border-l-[--info]"
                                : "hover:bg-[--elevated]"
                          }`}
                        >
                          <GitBranch className="h-3 w-3 text-[--text-muted] shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[--text-primary]">
                              <span className="font-mono tabular-nums">v{version.version}</span>
                              {isCurrent && <span className="ml-1.5 text-[--accent-vivid]">· current</span>}
                              {isCompared && !isCurrent && <span className="ml-1.5 text-[--info]">· comparing</span>}
                            </p>
                            <p className="text-xs text-[--text-muted] leading-snug">{version.summary}</p>
                            <p className="text-xs text-[--text-muted]">
                              {version.changedBy} · {relativeDays(version.changedAt)} ago
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>

        {/* Version diff */}
        {versions.length >= 2 && (
          <div className="min-h-[200px]">
            <DashboardCard
              id="artifact-diff"
              eyebrow="VERSION DIFF"
              title={`v${compareTo.version} → v${currentVersion.version}`}
              subtitle={
                compareTo.id === currentVersion.id
                  ? "Pick an earlier version on the timeline to compare against."
                  : `What changed between ${compareTo.changedBy}'s revision and the current one.`
              }
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DiffPanel
                    label={`v${compareTo.version}`}
                    version={compareTo}
                    tone="muted"
                  />
                  <DiffPanel
                    label={`v${currentVersion.version}`}
                    version={currentVersion}
                    tone="current"
                  />
                </div>
              </ScrollArea>
            </DashboardCard>
          </div>
        )}

        {/* Linked decisions + evidence + signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="min-h-[220px]">
            <DashboardCard
              id="artifact-linked-decisions"
              eyebrow="LINKED DECISIONS"
              title={`${linkedDecisions.length} decisions cite this`}
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {linkedDecisions.length === 0 ? (
                    <li className="px-3 py-4 text-center text-xs text-[--text-muted]">No decisions cite this artifact yet.</li>
                  ) : (
                    linkedDecisions.map((decision) => (
                      <li key={decision.id} className="px-3 py-2">
                        <Link
                          href={`/portal/decisions/${decision.id}`}
                          className="text-xs font-semibold text-[--text-primary] hover:text-[--accent-vivid] hover:underline leading-snug block"
                        >
                          {decision.title}
                        </Link>
                        <p className="text-xs text-[--text-muted]">
                          {decision.status.replace("-", " ")} · {decision.riskTier} risk
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>

          <div className="min-h-[220px]">
            <DashboardCard
              id="artifact-evidence"
              eyebrow="EVIDENCE VAULT"
              title={`${linkedEvidence.length} sources`}
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

          <div className="min-h-[220px]">
            <DashboardCard
              id="artifact-signals"
              eyebrow="ACTIVITY"
              title={`${relatedSignals.length} signals`}
              subtitle="What's happened to this artifact lately"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {relatedSignals.length === 0 ? (
                    <li className="px-3 py-4 text-center text-xs text-[--text-muted]">No signals yet.</li>
                  ) : (
                    relatedSignals.map((signal) => (
                      <li key={signal.id} className="flex items-start gap-2 px-3 py-2">
                        <History className="h-3 w-3 text-[--text-muted] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[--text-primary] leading-snug">{signal.title}</p>
                          <p className="text-xs text-[--text-muted]">{signal.detail}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiffPanel({ label, version, tone }: {
  label: string;
  version: ArtifactVersion;
  tone: "muted" | "current";
}) {
  return (
    <div className={`rounded-[--radius-md] border px-3 py-2.5 space-y-1.5 ${
      tone === "current"
        ? "bg-[--accent-dim] border-[--border-active]"
        : "bg-[--elevated] border-[--border-subtle]"
    }`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">{label}</p>
        <span className="text-xs font-mono text-[--text-muted] tabular-nums">{relativeDays(version.changedAt)} ago</span>
      </div>
      <p className="text-xs text-[--text-primary] leading-snug">{version.summary}</p>
      <p className="text-xs text-[--text-muted]">— {version.changedBy}</p>
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

function relativeDays(date: Date): string {
  const diff = Math.round((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "today";
  if (diff === 1) return "1d";
  return `${diff}d`;
}
