"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, GitBranch, Sparkles } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { ArtifactMarkdown } from "@/components/patterns/artifact-markdown";

import type { MembershipContext } from "@/lib/auth/session";
import { canPerform } from "@/lib/auth/membership-gate";
import type { Artifact, Engagement, Evidence } from "@/lib/portal/types";
import {
  mintArtifactVersion,
  saveArtifactBody,
} from "@/lib/portal/artifact-actions";

interface ArtifactEditorViewProps {
  artifact: Artifact;
  engagement: Engagement | undefined;
  linkedEvidence: Evidence[];
  evidenceById: Map<string, Evidence>;
  membership: MembershipContext;
}

export function ArtifactEditorView({
  artifact,
  engagement,
  linkedEvidence,
  evidenceById,
  membership,
}: ArtifactEditorViewProps) {
  const router = useRouter();
  const canEdit = canPerform(membership.role, "edit-artifact");

  const [body, setBody] = useState(artifact.body ?? artifact.description ?? "");
  const [versionSummary, setVersionSummary] = useState("");
  const [versionBump, setVersionBump] = useState<"major" | "minor" | "patch">("patch");
  const [isSaving, startSave] = useTransition();
  const [isMinting, startMint] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const dirty = body !== (artifact.body ?? artifact.description ?? "");
  const evidenceSet = useMemo(() => evidenceById, [evidenceById]);

  const handleSave = (reopen: boolean) => {
    if (!canEdit) return;
    setError(null);
    startSave(async () => {
      try {
        await saveArtifactBody({
          artifactId: artifact.id,
          body,
          reopenForReview: reopen,
        });
        setLastSavedAt(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  };

  const handleMint = () => {
    if (!canEdit) return;
    const summary = versionSummary.trim();
    if (!summary) {
      setError("Version summary is required when minting a new version.");
      return;
    }
    setError(null);
    startMint(async () => {
      try {
        const result = await mintArtifactVersion({
          artifactId: artifact.id,
          versionBump,
          summary,
          body,
        });
        setLastSavedAt(new Date());
        router.replace(`/portal/deliverables/${artifact.id}`);
        // Optimistic toast-style message via the error slot.
        setError(`Minted v${result.version}. Returning to detail view.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Mint failed.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Artifact editor"
        title={artifact.name}
        description={
          canEdit
            ? "Markdown body. Use [[ev-id]] to inline-cite an Evidence row. Hit save to update the working draft; hit mint to bump the version."
            : `Your role (${membership.role}) can read this artifact but not edit it.`
        }
        badge={artifact.canonical ? "Canonical" : artifact.reviewState.replace("-", " ")}
        badgeVariant={artifact.canonical ? "accent" : "default"}
        actions={
          <Link
            href={`/portal/deliverables/${artifact.id}`}
            className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" /> Back to detail
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <DashboardCard
            id="editor-source"
            eyebrow="EDIT"
            title="Markdown body"
            subtitle={dirty ? "Unsaved changes" : lastSavedAt ? `Saved ${formatLocalTime(lastSavedAt)}` : "Up to date"}
            badge={engagement?.name}
            badgeVariant="default"
            bodyClassName="overflow-hidden"
          >
            <div className="flex flex-col h-full">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={!canEdit || isSaving || isMinting}
                className="flex-1 w-full px-3 py-2.5 text-xs font-mono leading-relaxed bg-[--elevated] text-[--text-primary] resize-none outline-none border-b border-[--border-subtle] min-h-[420px]"
                placeholder="# Heading…\n\nWrite the artifact body in Markdown. Cite evidence inline with [[ev-id]]."
              />
              <div className="px-3 py-2 flex flex-wrap items-center gap-2 border-t border-[--border-subtle]">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!canEdit || isSaving || isMinting || !dirty}
                  onClick={() => handleSave(false)}
                  className="gap-1.5"
                >
                  <Save className="h-3 w-3" />
                  {isSaving ? "Saving…" : "Save draft"}
                </Button>
                {artifact.reviewState === "approved" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!canEdit || isSaving || isMinting || !dirty}
                    onClick={() => handleSave(true)}
                  >
                    Save + re-open for review
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <select
                    value={versionBump}
                    onChange={(e) => setVersionBump(e.target.value as typeof versionBump)}
                    className="h-7 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5"
                    disabled={!canEdit || isMinting}
                  >
                    <option value="patch">patch</option>
                    <option value="minor">minor</option>
                    <option value="major">major</option>
                  </select>
                  <Input
                    value={versionSummary}
                    onChange={(e) => setVersionSummary(e.target.value)}
                    placeholder="Version summary…"
                    className="h-7 text-xs flex-1 min-w-[140px]"
                    disabled={!canEdit || isMinting}
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!canEdit || isMinting || !versionSummary.trim()}
                    onClick={handleMint}
                    className="gap-1.5"
                  >
                    <GitBranch className="h-3 w-3" />
                    {isMinting ? "Minting…" : "Mint version"}
                  </Button>
                </div>
              </div>
              {error && (
                <p className="px-3 py-1.5 text-xs text-[--danger] leading-snug border-t border-[--border-subtle]">{error}</p>
              )}
            </div>
          </DashboardCard>

          <DashboardCard
            id="editor-preview"
            eyebrow="PREVIEW"
            title="Live preview"
            subtitle="Evidence chips render inline; chips for unknown ev-ids surface as broken-link warnings."
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full min-h-[420px]">
              <div className="px-3 py-3">
                <ArtifactMarkdown body={body} evidenceById={evidenceSet} />
              </div>
            </ScrollArea>
          </DashboardCard>
        </div>

        <DashboardCard
          id="editor-citations"
          eyebrow="CITATION KIT"
          title={`${linkedEvidence.length} evidence row${linkedEvidence.length === 1 ? "" : "s"} linked to this artifact`}
          subtitle="Paste any of these into the body with the [[ev-id]] format. Unlinked evidence stays in the workspace vault."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[260px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {linkedEvidence.length === 0 ? (
                <li className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  No evidence linked yet. Link evidence by adding an inline citation in the body.
                </li>
              ) : (
                linkedEvidence.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 px-3 py-2">
                    <Sparkles className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[--text-primary] truncate">{e.title}</p>
                      <p className="text-xs text-[--text-muted]">
                        {e.kind} · {e.source}
                      </p>
                    </div>
                    <code className="text-xs font-mono text-[--accent-vivid] bg-[--elevated] px-1.5 py-0.5 rounded">
                      [[{e.id}]]
                    </code>
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
        </DashboardCard>

        {(artifact.comments && artifact.comments.length > 0) && (
          <DashboardCard
            id="editor-comments"
            eyebrow="THREAD"
            title="Comments on this artifact"
            subtitle="Phase 4.1 ships read-only inline comments. Posting via UI lands in Phase 4.2."
          >
            <ScrollArea className="h-full max-h-[200px]">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {artifact.comments.map((c) => (
                  <li key={c.id} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ContentTag variant={c.authorKind === "agent" ? "accent" : "info"} dot>
                        {c.author}
                      </ContentTag>
                      {c.resolved && <ContentTag variant="success">resolved</ContentTag>}
                      <span className="ml-auto text-xs font-mono tabular-nums text-[--text-muted]">
                        {c.postedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{c.body}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}

function formatLocalTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
