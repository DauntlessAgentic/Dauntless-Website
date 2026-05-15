"use client";
import React from "react";

import { Tooltip } from "@/components/ui/tooltip";
import { findGlossaryEntry } from "@/lib/portal/glossary";
import { cn } from "@/lib/cn";

interface GlossaryTermProps {
  /** The term to look up. Defaults to children string. */
  term?: string;
  /** The text rendered inline (the term as it appears in copy). */
  children: React.ReactNode;
  /** Optional underline style override. Default: subtle dotted underline. */
  className?: string;
}

/**
 * Inline tooltip for jargon terms. Looks up `term` (or the children
 * string) in `lib/portal/glossary.ts`. Renders the plain-language
 * definition on hover/focus. If no glossary entry exists, renders the
 * children unchanged so this is safe to wrap optimistically.
 */
export function GlossaryTerm({ term, children, className }: GlossaryTermProps) {
  const lookupKey =
    term ??
    (typeof children === "string" ? children : React.Children.toArray(children).join(" "));
  const entry = findGlossaryEntry(lookupKey);

  if (!entry) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      content={
        <span className="block max-w-[260px] whitespace-normal leading-snug">
          <span className="font-semibold">{entry.term}.</span> {entry.plain}
        </span>
      }
      side="top"
    >
      <span
        tabIndex={0}
        // Audit-3 §H4: keep the visible term as the accessible *name*
        // (so SR users hear "canonical" — the word that actually
        // appears in the sentence) and surface the definition via
        // aria-description, which assistive tech reads as supplementary
        // info rather than overriding the name.
        aria-description={`${entry.term}: ${entry.plain}`}
        className={cn(
          "underline decoration-dotted decoration-[--text-muted] underline-offset-2",
          "cursor-help hover:decoration-[--accent-vivid] focus-visible:decoration-[--accent-vivid]",
          "focus:outline-none rounded-sm",
          className,
        )}
      >
        {children}
      </span>
    </Tooltip>
  );
}
