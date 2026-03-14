import React from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-8 px-4 text-center", className)}>
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-lg] bg-[--elevated] border border-[--border-subtle] text-[--text-muted]">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-[--text-secondary]">{title}</p>
        {description && <p className="text-xs text-[--text-muted]">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
