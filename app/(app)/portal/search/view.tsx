"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search, Filter } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentTag } from "@/components/ui/content-tag";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { MembershipContext } from "@/lib/auth/session";
import type { PortalSnapshot } from "@/lib/portal/types";
import type {
  SearchableEntity,
  SearchResult,
} from "@/lib/portal/knowledge";

interface SearchViewProps {
  snapshot: PortalSnapshot;
  membership: MembershipContext;
  query: string;
  activeEntities: string[];
  activeShelf?: "desk" | "bookshelf" | "cabinet";
  activeFreshness?: "fresh" | "aging" | "stale";
  results: SearchResult[];
}

const ENTITY_FILTERS: Array<{ key: SearchableEntity; label: string }> = [
  { key: "artifact",     label: "Artifacts" },
  { key: "decision",     label: "Decisions" },
  { key: "knowledge",    label: "Knowledge" },
  { key: "signal",       label: "Signals" },
  { key: "conversation", label: "Conversations" },
];

const ENTITY_TONE: Record<SearchableEntity, React.ComponentProps<typeof ContentTag>["variant"]> = {
  artifact:     "accent",
  decision:     "info",
  knowledge:    "success",
  signal:       "warning",
  conversation: "default",
};

const FRESHNESS_TONE: Record<string, React.ComponentProps<typeof ContentTag>["variant"]> = {
  fresh: "success",
  aging: "info",
  stale: "warning",
};

function entityRoute(result: SearchResult): string {
  switch (result.entity) {
    case "artifact":
      return `/portal/deliverables?focus=${result.id}`;
    case "decision":
      return `/portal/decisions?focus=${result.id}`;
    case "knowledge":
      return `/portal/knowledge#k-${result.id}`;
    case "signal":
      return `/portal#signal-${result.id}`;
    case "conversation":
      return `/portal/agents?conversation=${result.id}`;
  }
}

export function SearchView({
  snapshot: _snapshot,
  membership: _membership,
  query,
  activeEntities,
  activeShelf,
  activeFreshness,
  results,
}: SearchViewProps) {
  const router = useRouter();
  const [queryDraft, setQueryDraft] = useState(query);
  const [isPending, startTransition] = useTransition();

  const updateUrl = (next: { q?: string; entities?: string[]; shelf?: string; freshness?: string }) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    url.searchParams.delete("entity");
    url.searchParams.delete("shelf");
    url.searchParams.delete("freshness");
    if (next.q) url.searchParams.set("q", next.q);
    for (const ent of next.entities ?? activeEntities) url.searchParams.append("entity", ent);
    if (next.shelf ?? activeShelf) url.searchParams.set("shelf", next.shelf ?? activeShelf!);
    if (next.freshness ?? activeFreshness) url.searchParams.set("freshness", next.freshness ?? activeFreshness!);
    startTransition(() => router.push(url.pathname + url.search));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: queryDraft.trim() });
  };

  const toggleEntity = (entity: SearchableEntity) => {
    const next = activeEntities.includes(entity)
      ? activeEntities.filter((e) => e !== entity)
      : [...activeEntities, entity];
    updateUrl({ entities: next });
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Workspace Search"
        title="Find anything that compounds"
        description="One query across artifacts, decisions, knowledge, signals, and conversations — with provenance and freshness on every result."
        badge={results.length ? `${results.length} results` : "No results"}
        badgeVariant={results.length ? "accent" : "default"}
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="search-input"
          eyebrow="QUERY"
          title="What are you looking for?"
          subtitle="Search ranks by relevance, then boosts canonical knowledge and fresh signals."
        >
          <form onSubmit={onSubmit} className="px-3 py-2.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[--text-muted]" />
                <Input
                  value={queryDraft}
                  onChange={(e) => setQueryDraft(e.target.value)}
                  placeholder="Try: governance pillars, procurement gating, canonical anchor candidates"
                  className="pl-7 h-8 text-xs"
                  autoFocus
                />
              </div>
              <Button type="submit" size="sm" variant="primary" disabled={isPending}>
                Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <Filter className="h-3 w-3 text-[--text-muted]" />
              <span className="text-xs text-[--text-muted]">Entities</span>
              {ENTITY_FILTERS.map((f) => {
                const active = activeEntities.includes(f.key);
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => toggleEntity(f.key)}
                    className={`rounded-[--radius-sm] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide leading-none transition-colors ${
                      active
                        ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                        : "bg-[--elevated] text-[--text-muted] border border-[--border-subtle] hover:border-[--border-default]"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[--text-muted]">Shelf</span>
              {(["desk", "bookshelf", "cabinet"] as const).map((shelf) => (
                <button
                  key={shelf}
                  type="button"
                  onClick={() => updateUrl({ shelf: activeShelf === shelf ? undefined : shelf })}
                  className={`rounded-[--radius-sm] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide leading-none transition-colors ${
                    activeShelf === shelf
                      ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                      : "bg-[--elevated] text-[--text-muted] border border-[--border-subtle] hover:border-[--border-default]"
                  }`}
                >
                  {shelf}
                </button>
              ))}
              <span className="text-xs text-[--text-muted] ml-2">Min freshness</span>
              {(["fresh", "aging", "stale"] as const).map((freshness) => (
                <button
                  key={freshness}
                  type="button"
                  onClick={() =>
                    updateUrl({ freshness: activeFreshness === freshness ? undefined : freshness })
                  }
                  className={`rounded-[--radius-sm] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide leading-none transition-colors ${
                    activeFreshness === freshness
                      ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                      : "bg-[--elevated] text-[--text-muted] border border-[--border-subtle] hover:border-[--border-default]"
                  }`}
                >
                  {freshness}
                </button>
              ))}
            </div>
          </form>
        </DashboardCard>

        <DashboardCard
          id="search-results"
          eyebrow="RESULTS"
          title={query ? `Ranked results for "${query}"` : "Run a query to begin"}
          subtitle={
            query
              ? `${results.length} ranked across artifacts, decisions, knowledge, signals, and conversations.`
              : "Or try the prompts in the Knowledge architecture and Agents pages."
          }
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[60vh]">
            {results.length === 0 && query ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                No results. Try removing filters, or broaden the query.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {results.map((result) => (
                  <li key={`${result.entity}-${result.id}`} className="flex flex-col gap-1 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <ContentTag variant={ENTITY_TONE[result.entity]} dot>
                        {result.entity}
                      </ContentTag>
                      <Link
                        href={entityRoute(result)}
                        className="flex-1 text-xs font-semibold text-[--text-primary] truncate hover:underline"
                      >
                        {result.title}
                      </Link>
                      <span className="text-xs font-mono tabular-nums text-[--text-muted]">
                        score {result.score.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{result.snippet}</p>
                    <div className="flex flex-wrap gap-1.5 text-xs text-[--text-muted]">
                      <span>{result.source}</span>
                      {result.provenance.shelf && (
                        <ContentTag variant="default">{result.provenance.shelf}</ContentTag>
                      )}
                      {result.provenance.memoryTier && (
                        <ContentTag variant="info">{result.provenance.memoryTier}</ContentTag>
                      )}
                      {result.provenance.freshness && (
                        <ContentTag variant={FRESHNESS_TONE[result.provenance.freshness]} dot>
                          {result.provenance.freshness}
                        </ContentTag>
                      )}
                      {result.provenance.canonical && (
                        <ContentTag variant="accent">canonical</ContentTag>
                      )}
                    </div>
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
