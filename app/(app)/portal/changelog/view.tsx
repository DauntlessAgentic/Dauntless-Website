"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Activity } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";

import type { MembershipContext } from "@/lib/auth/session";
import type { ChangelogEntry, ChangelogSource } from "@/lib/portal/changelog";

interface ChangelogViewProps {
  entries: ChangelogEntry[];
  activeSource?: string;
  membership: MembershipContext;
}

const SOURCE_TONE: Record<ChangelogSource, React.ComponentProps<typeof ContentTag>["variant"]> = {
  audit: "info",
  signal: "accent",
  telemetry: "default",
  outbound: "warning",
  marketplace: "success",
  federation: "info",
  "agent-run": "accent",
};

const SOURCES: ChangelogSource[] = ["audit", "signal", "telemetry", "outbound", "marketplace", "federation", "agent-run"];

export function ChangelogView({ entries, activeSource, membership: _membership }: ChangelogViewProps) {
  const router = useRouter();
  const filtered = useMemo(() => {
    if (!activeSource) return entries;
    return entries.filter((e) => e.source === activeSource);
  }, [entries, activeSource]);
  const [counts] = useState(() => {
    const map: Partial<Record<ChangelogSource, number>> = {};
    for (const e of entries) map[e.source] = (map[e.source] ?? 0) + 1;
    return map;
  });

  const setSource = (next: string | null) => {
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("source", next);
    else url.searchParams.delete("source");
    router.push(url.pathname + url.search);
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Workspace changelog"
        title="Every signal source · one stream"
        description="Compiled from audit log, signal feed, portal telemetry events, outbound actions, marketplace installs, federation memberships, and agent runs. Filter by source to focus."
        badge={`${entries.length} entries`}
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="changelog-filters"
          eyebrow="FILTER"
          title="Source filters"
          subtitle="Click a source to focus the stream. Clearing returns to the unified view."
        >
          <div className="px-3 py-2.5 flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSource(null)}
              className={`rounded-[--radius-sm] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide leading-none transition-colors ${
                !activeSource
                  ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                  : "bg-[--elevated] text-[--text-muted] border border-[--border-subtle] hover:border-[--border-default]"
              }`}
            >
              All · {entries.length}
            </button>
            {SOURCES.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSource(activeSource === src ? null : src)}
                className={`rounded-[--radius-sm] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide leading-none transition-colors ${
                  activeSource === src
                    ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                    : "bg-[--elevated] text-[--text-muted] border border-[--border-subtle] hover:border-[--border-default]"
                }`}
              >
                {src} · {counts[src] ?? 0}
              </button>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          id="changelog-stream"
          eyebrow="STREAM"
          title={`${filtered.length} entr${filtered.length === 1 ? "y" : "ies"}`}
          subtitle="Newest first. Every signal source is a first-class row; deep-links point to the originating surface."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[720px]">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                Nothing in this slice. Clear the filter or trigger an action.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {filtered.map((entry) => (
                  <li key={entry.id} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                      <ContentTag variant={SOURCE_TONE[entry.source]} dot>
                        {entry.source}
                      </ContentTag>
                      {entry.riskTier && (
                        <ContentTag variant={entry.riskTier === "high" ? "warning" : "default"}>
                          {entry.riskTier} risk
                        </ContentTag>
                      )}
                      {entry.actorKind === "agent" && <ContentTag variant="accent">agent</ContentTag>}
                      <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{entry.title}</p>
                      <span className="text-xs font-mono tabular-nums text-[--text-muted]">
                        {entry.at.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{entry.detail}</p>
                    {(entry.actor || entry.link) && (
                      <div className="flex items-center gap-2 text-xs text-[--text-muted]">
                        {entry.actor && <span>by {entry.actor}</span>}
                        {entry.link && (
                          <Link href={entry.link} className="text-[--accent-vivid] hover:underline">
                            open ↗
                          </Link>
                        )}
                      </div>
                    )}
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
