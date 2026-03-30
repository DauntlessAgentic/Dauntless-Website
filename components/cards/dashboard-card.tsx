"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Maximize2, Minimize2, Share2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentState } from "@/lib/types";
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
  expandable?: boolean;
}

const AGENT_STATE_STYLES: Record<AgentState, {
  border: string; dot: string; label: string;
}> = {
  idle:     { border: "border-l-[--agent-idle]",     dot: "bg-[--agent-idle]",     label: "Idle" },
  active:   { border: "border-l-[--agent-active]",   dot: "bg-[--agent-active]",   label: "Active" },
  thinking: { border: "border-l-[--agent-thinking]", dot: "bg-[--agent-thinking]", label: "Thinking" },
  blocked:  { border: "border-l-[--agent-blocked]",  dot: "bg-[--agent-blocked]",  label: "Blocked" },
  complete: { border: "border-l-[--agent-complete]", dot: "bg-[--agent-complete]", label: "Complete" },
  updated:  { border: "border-l-[--agent-updated]",  dot: "bg-[--agent-updated]",  label: "Updated" },
};

interface CardHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  badge?: string;
  agentState?: AgentState;
  agentStyle: (typeof AGENT_STATE_STYLES)[AgentState] | null;
  actions?: React.ReactNode;
  expanded: boolean;
  expandable: boolean;
  onExpand: () => void;
  onRemove?: () => void;
}

function CardHeader({
  title, eyebrow, subtitle, badge, agentState, agentStyle,
  actions, expanded, expandable, onExpand, onRemove,
}: CardHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-3 pt-2.5 pb-2 border-b border-[--border-subtle] shrink-0">
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted] mb-0.5">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[--text-primary] truncate">{title}</span>
          {badge && (
            <Badge variant="default" className="text-xs px-1 py-0">{badge}</Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-[--text-muted] truncate">{subtitle}</p>
        )}
      </div>

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
          <span className="text-xs uppercase tracking-wide text-[--text-muted]">
            {agentStyle.label}
          </span>
        </div>
      )}

      {actions && (
        <div className="flex items-center gap-0.5 shrink-0">{actions}</div>
      )}

      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[--duration-fast]">
        <CardIconButton label="Share" onClick={() => {}}>
          <Share2 className="h-3 w-3" />
        </CardIconButton>
        {expandable && (
          <CardIconButton label={expanded ? "Restore" : "Expand"} onClick={onExpand}>
            {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </CardIconButton>
        )}
        {onRemove && (
          <CardIconButton label="Close" onClick={onRemove} danger>
            <X className="h-3 w-3" />
          </CardIconButton>
        )}
      </div>
    </div>
  );
}

function CardIconButton({
  children, label, onClick, danger = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-[--radius-sm]",
        "transition-all duration-[--duration-fast]",
        danger
          ? "text-[--text-muted] hover:text-[--danger] hover:bg-[--danger-dim]"
          : "text-[--text-muted] hover:text-[--text-primary] hover:bg-[--elevated]",
      )}
    >
      {children}
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="h-full flex flex-col gap-2 p-3">
      <div className="skeleton-shimmer h-4 w-3/4 rounded-[--radius-sm]" />
      <div className="skeleton-shimmer h-4 w-1/2 rounded-[--radius-sm]" />
      <div className="skeleton-shimmer flex-1 rounded-[--radius-md]" />
    </div>
  );
}

export function DashboardCard({
  id, title, eyebrow, subtitle, badge,
  status = "default", agentState, agentId,
  loading, children, footer, actions,
  className, bodyClassName, onRemove,
  expandable = true,
}: DashboardCardProps) {
  const [expanded, setExpanded] = useState(false);
  const agentStyle = agentState ? AGENT_STATE_STYLES[agentState] : null;

  const headerProps: CardHeaderProps = {
    title, eyebrow, subtitle, badge, agentState, agentStyle,
    actions, expanded, expandable,
    onExpand: () => setExpanded(v => !v),
    onRemove: onRemove ? () => onRemove(id) : undefined,
  };

  return (
    <>
      <div
        className={cn(
          "group flex flex-col h-full w-full overflow-hidden",
          "rounded-[--radius-lg]",
          "bg-[--panel-bg]",
          "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
          "transition-shadow duration-200",
          agentStyle && "border-l-2",
          agentStyle?.border,
          className
        )}
      >
        <CardHeader {...headerProps} />
        <div className={cn("flex-1 overflow-hidden min-h-0", bodyClassName)}>
          {loading ? <CardSkeleton /> : children}
        </div>
        {footer && (
          <div className="px-3 py-2 border-t border-[--border-subtle] shrink-0">
            {footer}
          </div>
        )}
      </div>

      <DialogPrimitive.Root open={expanded} onOpenChange={setExpanded}>
        <DialogPrimitive.Portal>
          <AnimatePresence>
            {expanded && (
              <>
                <DialogPrimitive.Overlay asChild forceMount>
                  <motion.div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  />
                </DialogPrimitive.Overlay>
                <DialogPrimitive.Content asChild forceMount>
                  <motion.div
                    className={cn(
                      "fixed z-50 flex flex-col group",
                      "inset-[2vh_2vw]",
                      "rounded-[--radius-xl]",
                      "bg-[--panel-bg]",
                      "shadow-[var(--shadow-lg)]",
                      "border border-[--border-strong]",
                      agentStyle && "border-l-2",
                      agentStyle?.border,
                    )}
                    initial={{ opacity: 0, scale: 0.97, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                    <CardHeader {...headerProps} />
                    <div className={cn("flex-1 overflow-auto min-h-0", bodyClassName)}>
                      {loading ? <CardSkeleton /> : children}
                    </div>
                    {footer && (
                      <div className="px-3 py-2 border-t border-[--border-subtle] shrink-0">
                        {footer}
                      </div>
                    )}
                  </motion.div>
                </DialogPrimitive.Content>
              </>
            )}
          </AnimatePresence>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
