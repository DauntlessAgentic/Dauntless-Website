import React from "react";
import { Clock, Tag } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryCardProps {
  title: string;
  content: string;
  updated?: Date;
  tags?: string[];
  className?: string;
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function SummaryCard({ title, content, updated, tags, className }: SummaryCardProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-1">
        <div className="px-3 py-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[--accent-bright] animate-pulse-glow" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[--accent-vivid]">AI SUMMARY</span>
            </div>
            {updated && (
              <div className="flex items-center gap-1 text-[--text-muted]">
                <Clock className="h-2.5 w-2.5" />
                <span className="text-[10px]">{relativeTime(updated)}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[--text-primary]">{title}</p>
            <div className="text-xs text-[--text-secondary] leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="h-3 w-3 text-[--text-muted]" />
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[9px]">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
