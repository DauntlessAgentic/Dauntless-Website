"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ContentTag } from "@/components/ui/content-tag";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GLOSSARY, searchGlossary, type GlossaryEntry } from "@/lib/portal/glossary";

const CATEGORY_LABEL: Record<string, string> = {
  agents: "Agents & runtime",
  decisions: "Decisions",
  knowledge: "Knowledge & artifacts",
  governance: "Governance & audit",
  actions: "Outbound actions",
  innovation: "Innovation Studio",
  other: "Other",
};

const CATEGORY_TONE: Record<string, React.ComponentProps<typeof ContentTag>["variant"]> = {
  agents: "accent",
  decisions: "info",
  knowledge: "success",
  governance: "warning",
  actions: "default",
  innovation: "accent",
  other: "default",
};

export function GlossaryView() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows: GlossaryEntry[] = query.trim() ? searchGlossary(query) : GLOSSARY.slice();
    if (activeCategory) {
      rows = rows.filter((e) => (e.category ?? "other") === activeCategory);
    }
    return rows.sort((a, b) => a.term.localeCompare(b.term));
  }, [query, activeCategory]);

  const categories = Array.from(
    new Set(GLOSSARY.map((e) => e.category ?? "other")),
  ).sort();

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Portal help"
        title="Glossary — plain-language portal vocabulary"
        description="Hover any underlined term inside the portal to see the same definition inline. Search or filter below."
        badge={`${GLOSSARY.length} terms`}
        badgeVariant="accent"
        actions={
          <Link
            href="/portal/help"
            className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" /> Help
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="glossary-search"
          eyebrow="SEARCH"
          title="Find a term"
          subtitle="Free-text matches term, definition, and extended notes."
        >
          <div className="px-3 py-3 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[--text-muted]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="canonical, dry-run, signed bundle…"
                className="pl-7"
                aria-label="Search glossary"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`text-xs px-2 py-1 rounded-[--radius-sm] border transition-colors ${activeCategory === null ? "bg-[--accent-dim] border-[--accent-vivid] text-[--text-primary]" : "border-[--border-subtle] text-[--text-muted] hover:text-[--text-primary]"}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`text-xs px-2 py-1 rounded-[--radius-sm] border transition-colors ${activeCategory === cat ? "bg-[--accent-dim] border-[--accent-vivid] text-[--text-primary]" : "border-[--border-subtle] text-[--text-muted] hover:text-[--text-primary]"}`}
                >
                  {CATEGORY_LABEL[cat] ?? cat}
                </button>
              ))}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          id="glossary-list"
          eyebrow="ENTRIES"
          title={`${filtered.length} term${filtered.length === 1 ? "" : "s"}`}
          subtitle="Sorted alphabetically. Hover any underlined term anywhere in the portal to see the same definition inline."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[60vh]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  No matches. Try a shorter query or clear the category filter.
                </li>
              ) : (
                filtered.map((entry) => (
                  <li key={entry.term} className="flex flex-col gap-1 px-3 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[--text-primary]">{entry.term}</p>
                      {entry.category && (
                        <ContentTag variant={CATEGORY_TONE[entry.category] ?? "default"}>
                          {CATEGORY_LABEL[entry.category]}
                        </ContentTag>
                      )}
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{entry.plain}</p>
                    {entry.extended && (
                      <p className="text-xs text-[--text-muted] leading-snug italic">{entry.extended}</p>
                    )}
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
        </DashboardCard>
      </div>
    </div>
  );
}
