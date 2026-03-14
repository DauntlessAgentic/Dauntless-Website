"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GripHorizontal, Maximize2, MoreHorizontal, X, Minimize2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentState } from "@/lib/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";

export type CardStatus = "default" | "active" | "loading" | "error" | "updated";

interface DashboardCardProps {
  id: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  badge?: string;
  status?: CardStatus;
  agentState?: AgentState;
  agentId?: string;
  loading?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
  dragHandle?: boolean;
}

const AGENT_STATE_STYLES: Record<AgentState, { border: string; dot: string; label: string }> = {
  idle:     { border: "border-l-[--agent-idle]",     dot: "bg-[--agent-idle]",     label: "Idle" },
  active:   { border: "border-l-[--agent-active]",   dot: "bg-[--agent-active]",   label: "Active" },
  thinking: { border: "border-l-[--agent-thinking]", dot: "bg-[--agent-thinking]", label: "Thinking" },
  blocked:  { border: "border-l-[--agent-blocked]",  dot: "bg-[--agent-blocked]",  label: "Blocked" },
  complete: { border: "border-l-[--agent-complete]", dot: "bg-[--agent-complete]", label: "Complete" },
  updated:  { border: "border-l-[--agent-updated]",  dot: "bg-[--agent-updated]",  label: "Updated" },
};

export function DashboardCard({
  id, title, eyebrow, subtitle, badge, status = "default",
  agentState, agentId, loading, children, footer, actions,
  className, bodyClassName, onRemove, isDragging, dragHandle = true,
}: DashboardCardProps) {
  const agentStyle = agentState ? AGENT_STATE_STYLES[agentState] : null;

  return (
    <motion.div
      className={cn(
        "group flex flex-col h-full w-full overflow-hidden select-none",
        "rounded-[10px] border border-[--border-default]",
        "bg-[--panel-bg]",
        "transition-shadow duration-200",
        agentStyle && "border-l-2",
        agentStyle?.border,
        isDragging && "shadow-[var(--shadow-drag)] border-[--border-active]",
        !isDragging && "hover:border-[--border-strong] hover:shadow-[var(--shadow-md)]",
        className
      )}
      layout
      animate={isDragging ? { scale: 1.01 } : { scale: 1 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2 border-b border-[--border-subtle] shrink-0">
        {/* Drag handle */}
        {dragHandle && (
          <div className="drag-handle flex items-center cursor-grab active:cursor-grabbing text-[--text-muted] hover:text-[--text-secondary] transition-colors -ml-1">
            <GripHorizontal className="h-3.5 w-3.5" />
          </div>
        )}

        {/* Title area */}
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-[--text-muted] mb-0.5">{eyebrow}</p>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[--text-primary] truncate">{title}</span>
            {badge && <Badge variant="default" className="text-[9px] px-1 py-0">{badge}</Badge>}
          </div>
          {subtitle && <p className="text-[10px] text-[--text-muted] truncate">{subtitle}</p>}
        </div>

        {/* Agent state indicator */}
        {agentState && agentStyle && (
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                agentStyle.dot,
                agentState === "thinking" && "animate-thinking",
                agentState === "active" && "animate-pulse-glow",
              )}
            />
            <span className="text-[9px] uppercase tracking-wide text-[--text-muted]">{agentStyle.label}</span>
          </div>
        )}

        {/* Actions */}
        {actions && <div className="flex items-center gap-0.5 shrink-0">{actions}</div>}

        {/* Card menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-5 w-5 items-center justify-center rounded text-[--text-muted] hover:text-[--text-primary] hover:bg-[--elevated] opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>Expand</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            {onRemove && (
              <DropdownMenuItem danger onClick={() => onRemove(id)}>Remove</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card Body */}
      <div className={cn("flex-1 overflow-hidden min-h-0", bodyClassName)}>
        {loading ? (
          <div className="h-full flex flex-col gap-2 p-3">
            <div className="skeleton-shimmer h-4 w-3/4 rounded" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded" />
            <div className="skeleton-shimmer flex-1 rounded" />
          </div>
        ) : children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="px-3 py-2 border-t border-[--border-subtle] shrink-0">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
