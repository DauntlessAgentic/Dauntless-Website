"use client";
import React from "react";
import { Bot } from "lucide-react";

import { cn } from "@/lib/cn";

interface ActorBadgeProps {
  /** "human" | "agent". */
  kind: "human" | "agent";
  /** The display name to render alongside the badge. */
  name: string;
  /** Optional truncate length. Default 28. */
  maxChars?: number;
  /** Extra classes for the wrapper. */
  className?: string;
}

/**
 * Visually distinguishes agents from humans at-a-glance.
 * Advisory-board action #5 / #10: Lena and Jim were confused by the
 * "Engagement Analyst" label sounding like a teammate. Agents now
 * carry a bot glyph and an accent ring; humans get an initial bubble.
 */
export function ActorBadge({ kind, name, maxChars = 28, className }: ActorBadgeProps) {
  const truncated = name.length > maxChars ? `${name.slice(0, maxChars - 1)}…` : name;

  if (kind === "agent") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs",
          "px-1.5 py-0.5 rounded-[--radius-sm]",
          "bg-[--accent-dim] border border-[--accent-vivid]",
          className,
        )}
        title={`${name} — this is an automated agent, not a person.`}
      >
        <Bot className="h-3 w-3 text-[--accent-vivid]" aria-hidden />
        {/* Audit-3 §H4 / §L4: visually-hidden "Agent" prefix so SR users
            hear "Agent <name>" without overriding the name itself. */}
        <span className="sr-only">Agent </span>
        <span className="font-mono text-[--text-primary]">{truncated}</span>
        <span className="text-[--text-muted] uppercase tracking-widest" aria-hidden>agent</span>
      </span>
    );
  }

  const initials = initialsOf(name);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        "px-1.5 py-0.5 rounded-[--radius-sm]",
        "bg-[--elevated] border border-[--border-subtle]",
        className,
      )}
      title={`${name} — human team member.`}
    >
      <span
        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[--text-muted] text-[--panel-bg] text-[10px] font-semibold"
        aria-hidden
      >
        {initials}
      </span>
      <span className="sr-only">Person </span>
      <span className="text-[--text-primary]">{truncated}</span>
    </span>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
