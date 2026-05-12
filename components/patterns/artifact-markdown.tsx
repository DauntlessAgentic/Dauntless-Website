"use client";

// ============================================================
// Artifact Markdown renderer (Phase 4.1)
//
// Lightweight Markdown renderer tuned for portal artifact bodies.
// Supports:
//   - Headings (#, ##, ###)
//   - Bold (**text**) and italic (*text*)
//   - Inline code (`code`)
//   - Bulleted lists (- item)
//   - Numbered lists (1. item)
//   - Blockquotes (> text)
//   - Inline evidence references: [[ev-id]] → rendered as a chip
//     linking back to the evidence row in the workspace vault
//
// Heavy syntax (tables, images, fenced code blocks) is intentionally
// out of scope — artifact bodies are short and structured.
// ============================================================

import React from "react";

import { EvidenceLink } from "@/components/patterns/evidence-link";
import { cn } from "@/lib/cn";
import type { Evidence } from "@/lib/portal/types";

export interface ArtifactMarkdownProps {
  body: string;
  evidenceById: Map<string, Evidence>;
  className?: string;
}

export function ArtifactMarkdown({ body, evidenceById, className }: ArtifactMarkdownProps) {
  const blocks = parseBlocks(body);
  return (
    <div className={cn("flex flex-col gap-2 text-xs leading-relaxed text-[--text-secondary]", className)}>
      {blocks.map((block, idx) => renderBlock(block, idx, evidenceById))}
    </div>
  );
}

// ── Inline rendering ──────────────────────────────────────────

function renderInline(text: string, evidenceById: Map<string, Evidence>, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const tokenRe = /(\[\[ev-[a-z0-9-]+\]\]|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = tokenRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`${keyPrefix}-t-${idx++}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith("[[") && token.endsWith("]]")) {
      const id = token.slice(2, -2);
      const evidence = evidenceById.get(id);
      parts.push(
        <span key={`${keyPrefix}-cite-${idx++}`} className="inline-block align-middle mx-0.5">
          {evidence ? (
            <EvidenceLink kind={evidence.kind} title={evidence.title} source={evidence.source} />
          ) : (
            <span className="font-mono text-xs text-[--danger]">[missing {id}]</span>
          )}
        </span>,
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-b-${idx++}`} className="font-semibold text-[--text-primary]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={`${keyPrefix}-c-${idx++}`} className="font-mono text-xs px-1 rounded bg-[--elevated-2] text-[--text-primary]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={`${keyPrefix}-i-${idx++}`} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={`${keyPrefix}-tail`}>{text.slice(lastIndex)}</span>);
  }
  return parts;
}

// ── Block parsing ─────────────────────────────────────────────

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bulleted-list"; items: string[] }
  | { kind: "numbered-list"; items: string[] }
  | { kind: "blockquote"; text: string };

function parseBlocks(body: string): Block[] {
  const lines = body.split(/\r?\n/);
  const blocks: Block[] = [];
  let pendingPara: string[] = [];
  let pendingBullets: string[] | null = null;
  let pendingNumbered: string[] | null = null;
  let pendingQuote: string[] | null = null;

  const flush = () => {
    if (pendingPara.length > 0) {
      blocks.push({ kind: "paragraph", text: pendingPara.join(" ") });
      pendingPara = [];
    }
    if (pendingBullets) {
      blocks.push({ kind: "bulleted-list", items: pendingBullets });
      pendingBullets = null;
    }
    if (pendingNumbered) {
      blocks.push({ kind: "numbered-list", items: pendingNumbered });
      pendingNumbered = null;
    }
    if (pendingQuote) {
      blocks.push({ kind: "blockquote", text: pendingQuote.join(" ") });
      pendingQuote = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flush();
      continue;
    }
    const headingMatch = /^(#{1,3})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flush();
      blocks.push({ kind: "heading", level: headingMatch[1].length, text: headingMatch[2] });
      continue;
    }
    const bulletMatch = /^[-*]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      flush();
      (pendingBullets ??= []).push(bulletMatch[1]);
      continue;
    }
    const numberedMatch = /^\d+\.\s+(.*)$/.exec(line);
    if (numberedMatch) {
      flush();
      (pendingNumbered ??= []).push(numberedMatch[1]);
      continue;
    }
    const quoteMatch = /^>\s+(.*)$/.exec(line);
    if (quoteMatch) {
      flush();
      (pendingQuote ??= []).push(quoteMatch[1]);
      continue;
    }
    pendingPara.push(line);
  }
  flush();
  return blocks;
}

function renderBlock(block: Block, idx: number, evidenceById: Map<string, Evidence>): React.ReactNode {
  switch (block.kind) {
    case "heading": {
      const size =
        block.level === 1 ? "text-base font-semibold text-[--text-primary]"
        : block.level === 2 ? "text-sm font-semibold text-[--text-primary]"
        : "text-xs font-semibold uppercase tracking-wide text-[--text-muted]";
      return (
        <h2 key={idx} className={size}>
          {renderInline(block.text, evidenceById, `h-${idx}`)}
        </h2>
      );
    }
    case "paragraph":
      return (
        <p key={idx} className="leading-relaxed">
          {renderInline(block.text, evidenceById, `p-${idx}`)}
        </p>
      );
    case "bulleted-list":
      return (
        <ul key={idx} className="flex flex-col gap-1 pl-5 list-disc marker:text-[--text-muted]">
          {block.items.map((item, i) => (
            <li key={i} className="leading-snug">
              {renderInline(item, evidenceById, `bu-${idx}-${i}`)}
            </li>
          ))}
        </ul>
      );
    case "numbered-list":
      return (
        <ol key={idx} className="flex flex-col gap-1 pl-5 list-decimal marker:text-[--text-muted] marker:font-mono">
          {block.items.map((item, i) => (
            <li key={i} className="leading-snug">
              {renderInline(item, evidenceById, `no-${idx}-${i}`)}
            </li>
          ))}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote
          key={idx}
          className="border-l-2 border-[--border-active] pl-3 text-xs text-[--text-secondary] italic"
        >
          {renderInline(block.text, evidenceById, `bq-${idx}`)}
        </blockquote>
      );
  }
}
