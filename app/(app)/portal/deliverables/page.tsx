"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, FileText, GitBranch, ExternalLink } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentTag } from "@/components/ui/content-tag";
import { ArtifactList } from "@/components/patterns/artifact-list";
import { EvidenceLink } from "@/components/patterns/evidence-link";
import { mockArtifacts, mockEngagements, mockDecisions, mockEvidence } from "@/lib/portal/mock-data";
import type { Artifact } from "@/lib/portal/types";

type FilterKey = "all" | "in-review" | "approved" | "draft" | "needs-revision";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all",             label: "All" },
  { key: "in-review",       label: "In review" },
  { key: "approved",        label: "Approved" },
  { key: "draft",           label: "Drafts" },
  { key: "needs-revision",  label: "Needs revision" },
];

export default function DeliverablesPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string>(mockArtifacts[0].id);

  const filtered = useMemo(() => {
    if (filter === "all") return mockArtifacts.filter((a) => a.reviewState !== "superseded");
    return mockArtifacts.filter((a) => a.reviewState === filter);
  }, [filter]);

  const selected = mockArtifacts.find((a) => a.id === selectedId) ?? filtered[0];
  const linkedDecisions = selected
    ? mockDecisions.filter((d) => selected.linkedDecisionIds.includes(d.id))
    : [];
  const linkedEvidence = selected
    ? selected.linkedEvidenceIds
        .map((id) => mockEvidence.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
    : [];
  const engagement = selected ? mockEngagements.find((e) => e.id === selected.engagementId) : undefined;

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Living Deliverables"
        title="Artifact library"
        description={`${mockArtifacts.length} artifacts · ${mockArtifacts.filter((a) => a.canonical).length} canonical · every version is preserved.`}
        badge="Living"
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>{f.label}</TabsTrigger>
            ))}
          </TabsList>
          {FILTERS.map((f) => (
            <TabsContent key={f.key} value={f.key} />
          ))}
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 min-h-[500px]">
            <DashboardCard
              id="artifact-library"
              eyebrow="ARTIFACTS"
              title="Library"
              subtitle={`${filtered.length} matches`}
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col">
                  {filtered.map((artifact) => (
                    <li key={artifact.id} className="flex items-stretch">
                      <button
                        type="button"
                        onClick={() => setSelectedId(artifact.id)}
                        className={`flex-1 text-left ${artifact.id === selected?.id ? "bg-[--accent-dim] border-l-2 border-[--border-active]" : "hover:bg-[--elevated]"}`}
                      >
                        <ArtifactList artifacts={[artifact]} />
                      </button>
                      <Link
                        href={`/portal/deliverables/${artifact.id}`}
                        title="Open detail view"
                        className="flex items-center px-2 text-[--text-muted] hover:text-[--accent-vivid] hover:bg-[--elevated] transition-colors border-l border-[--border-subtle]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>

          <div className="min-h-[500px] flex flex-col gap-3">
            <DashboardCard
              id="artifact-preview"
              eyebrow="ARTIFACT PREVIEW"
              title={selected?.name ?? "No artifact selected"}
              subtitle={engagement?.name}
              badge={selected?.canonical ? "Canonical" : selected?.reviewState.replace("-", " ")}
              badgeVariant={selected?.canonical ? "accent" : "default"}
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="px-3 py-3 space-y-3">
                  {selected && (
                    <>
                      <p className="text-xs text-[--text-secondary] leading-relaxed">{selected.description}</p>
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Owner</p>
                        <p className="text-xs text-[--text-secondary]">{selected.ownerName}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Version history</p>
                        <ul className="flex flex-col gap-1.5">
                          {selected.versions.map((version) => (
                            <li key={version.id} className="flex items-start gap-2 text-xs">
                              <GitBranch className="h-3 w-3 text-[--text-muted] shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[--text-primary]">
                                  <span className="font-mono tabular-nums">{version.version}</span>
                                  <span className="text-[--text-muted]"> · {version.changedBy}</span>
                                </p>
                                <p className="text-[--text-muted] leading-snug">{version.summary}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {linkedEvidence.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Evidence vault</p>
                          <div className="flex flex-col gap-1">
                            {linkedEvidence.map((ev) => (
                              <EvidenceLink key={ev.id} kind={ev.kind} title={ev.title} source={ev.source} />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <Button asChild variant="primary" size="xs" className="gap-1">
                          <Link href={`/portal/deliverables/${selected.id}`}>
                            <ExternalLink className="h-3 w-3" /> Open detail view
                          </Link>
                        </Button>
                        <Button variant="ghost" size="xs" className="gap-1">
                          <FileText className="h-3 w-3" /> Open canonical view
                        </Button>
                        {!selected.canonical && (
                          <Button variant="ghost" size="xs" className="gap-1">
                            <Star className="h-3 w-3" /> Propose for canonical
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </DashboardCard>

            <DashboardCard
              id="artifact-decisions"
              eyebrow="LINKED DECISIONS"
              title="Where this artifact is cited"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {linkedDecisions.length === 0 && (
                    <li className="px-3 py-4 text-center text-xs text-[--text-muted]">No decisions cite this artifact yet.</li>
                  )}
                  {linkedDecisions.map((decision) => (
                    <li key={decision.id} className="flex flex-col gap-0.5 px-3 py-2">
                      <p className="text-xs font-semibold text-[--text-primary] leading-snug">{decision.title}</p>
                      <p className="text-xs text-[--text-muted]">
                        {decision.status.replace("-", " ")} · {decision.riskTier} risk
                      </p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>

        {/* Canonical bookshelf footer */}
        <DashboardCard
          id="canonical-shelf"
          eyebrow="THE BOOKSHELF"
          title="Promoted to canonical · reusable across future engagements"
          subtitle="Compounding intelligence — every promotion lowers the cost of the next engagement."
        >
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-3 py-3">
            {mockArtifacts.filter((a) => a.canonical).map((artifact) => (
              <li key={artifact.id} className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] p-3 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <Star className="h-3.5 w-3.5 text-[--accent-vivid] fill-[--accent-vivid] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[--text-primary] leading-snug">{artifact.name}</p>
                    <p className="text-xs text-[--text-muted]">v{artifact.versions[0].version} · {artifact.ownerName}</p>
                  </div>
                </div>
                <p className="text-xs text-[--text-muted] leading-snug">{artifact.description}</p>
                <ContentTag variant="accent">{artifact.type}</ContentTag>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}
