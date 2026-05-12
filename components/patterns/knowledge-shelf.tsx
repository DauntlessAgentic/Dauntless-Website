import React from "react";
import { Archive, BookOpen, MonitorDot, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { ContentTag } from "@/components/ui/content-tag";
import type { KnowledgeItem, KnowledgeShelf as ShelfKind } from "@/lib/portal/types";

const SHELF_META: Record<ShelfKind, { Icon: React.ComponentType<{ className?: string }>; label: string; tagline: string }> = {
  desk:      { Icon: MonitorDot, label: "Desk",            tagline: "Operational · M0–M1" },
  bookshelf: { Icon: BookOpen,   label: "Bookshelf",       tagline: "Proven · M2–M3" },
  cabinet:   { Icon: Archive,    label: "Filing Cabinet",  tagline: "Archived · M4" },
};

const FRESHNESS_TONE: Record<KnowledgeItem["freshness"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  fresh:  "success",
  aging:  "warning",
  stale:  "danger",
};

interface KnowledgeShelfProps {
  shelf: ShelfKind;
  items: KnowledgeItem[];
  className?: string;
  compact?: boolean;
}

export function KnowledgeShelf({ shelf, items, className, compact = false }: KnowledgeShelfProps) {
  const meta = SHELF_META[shelf];
  const HeaderIcon = meta.Icon;
  const canonicalCount = items.filter((i) => i.canonical).length;
  return (
    <section className={cn("flex flex-col", className)}>
      <header className="flex items-center gap-2 px-3 py-2 border-b border-[--border-subtle]">
        <HeaderIcon className="h-3.5 w-3.5 text-[--accent-vivid]" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[--text-primary]">{meta.label}</p>
          <p className="text-xs text-[--text-muted]">{meta.tagline}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[--text-muted]">
          <span className="font-mono tabular-nums text-[--text-secondary]">{items.length}</span>
          <span>items</span>
          {canonicalCount > 0 && (
            <>
              <span>·</span>
              <Star className="h-3 w-3 text-[--accent-vivid] fill-[--accent-vivid]" />
              <span className="font-mono tabular-nums text-[--text-secondary]">{canonicalCount}</span>
              <span>canonical</span>
            </>
          )}
        </div>
      </header>
      <ul className="flex flex-col divide-y divide-[--border-subtle]">
        {items.map((item) => (
          <li key={item.id} className={cn("flex flex-col gap-1", compact ? "px-3 py-2" : "px-3 py-2.5")}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-[--text-primary] truncate">{item.title}</p>
                  {item.canonical && (
                    <span title="Canonical">
                      <Star className="h-3 w-3 text-[--accent-vivid] fill-[--accent-vivid]" />
                    </span>
                  )}
                </div>
                {!compact && (
                  <p className="text-xs text-[--text-muted] leading-snug">{item.summary}</p>
                )}
              </div>
              <ContentTag variant={FRESHNESS_TONE[item.freshness]} dot>{item.freshness}</ContentTag>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[--text-muted]">
              <span className="font-mono uppercase tracking-widest">{item.memoryTier}</span>
              <span>· {item.sourceKind}</span>
              <span className="flex items-center gap-1">
                <span>confidence</span>
                <span className="font-mono tabular-nums text-[--text-secondary]">{Math.round(item.confidence * 100)}%</span>
              </span>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-[--text-muted]">No items on this shelf.</li>
        )}
      </ul>
    </section>
  );
}
