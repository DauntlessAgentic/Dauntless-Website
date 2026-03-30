import React from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";

interface WorkspaceHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "accent" | "info" | "success" | "warning" | "danger";
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
}

export function WorkspaceHeader({
  eyebrow, title, description, badge, badgeVariant = "accent",
  actions, filters, className,
}: WorkspaceHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 px-4 py-3 border-b border-[--border-subtle] bg-[--chrome-bg] shrink-0", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5 min-w-0">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-[--text-muted]">{eyebrow}</p>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-[--text-primary]">{title}</h1>
            {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
          </div>
          {description && (
            <p className="text-xs text-[--text-muted] truncate">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {filters && <div className="flex items-center gap-2">{filters}</div>}
    </div>
  );
}
