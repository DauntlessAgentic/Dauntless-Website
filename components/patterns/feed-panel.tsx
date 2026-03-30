import React from "react";
import { cn } from "@/lib/cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import type { FeedItem } from "@/lib/types";

interface FeedPanelProps {
  items: FeedItem[];
  className?: string;
}

const typeStyles: Record<NonNullable<FeedItem["type"]>, {
  dot: string;
  tag: React.ComponentProps<typeof ContentTag>["variant"];
}> = {
  info:    { dot: "bg-[--info]",          tag: "info" },
  success: { dot: "bg-[--success]",       tag: "success" },
  warning: { dot: "bg-[--warning]",       tag: "warning" },
  danger:  { dot: "bg-[--danger]",        tag: "danger" },
  update:  { dot: "bg-[--accent-bright]", tag: "accent" },
};

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function FeedPanel({ items, className }: FeedPanelProps) {
  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="flex flex-col divide-y divide-[--border-subtle]">
        {items.map((item) => {
          const style = typeStyles[item.type || "info"];
          return (
            <div key={item.id} className="flex gap-2.5 px-3 py-2.5 hover:bg-[--elevated] transition-colors">
              {/* Timeline connector */}
              <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot)} />
                <div className="w-px flex-1 bg-[--border-subtle] min-h-[12px]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-[--text-primary] leading-snug">{item.title}</p>
                  <span className="text-xs text-[--text-muted] shrink-0 tabular-nums font-mono">
                    {relativeTime(item.timestamp)}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-[--text-muted] mt-0.5 leading-snug">
                    {item.description}
                  </p>
                )}

                {item.source && (
                  <div className="mt-1.5">
                    <ContentTag variant={style.tag} dot>{item.source}</ContentTag>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
