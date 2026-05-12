"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Star, AlertTriangle, Sparkles } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { KnowledgeShelf } from "@/components/patterns/knowledge-shelf";
import type {
  KnowledgeShelf as KnowledgeShelfKind,
  MemoryTier,
  PortalSnapshot,
} from "@/lib/portal/types";
import type { MembershipContext } from "@/lib/auth/session";
import { canPerform } from "@/lib/auth/membership-gate";
import { promoteKnowledge } from "@/lib/portal/actions";

const TIER_DESCRIPTIONS: Record<MemoryTier, string> = {
  M0: "Ephemeral · this conversation, this hour.",
  M1: "Session · this week's working surface.",
  M2: "Engagement · cross-session, scoped to one engagement.",
  M3: "Workspace · proven, promoted, reusable across engagements.",
  M4: "Archive · audit-only. Retrievable, never noisy.",
};

interface KnowledgeViewProps {
  snapshot: PortalSnapshot;
  membership: MembershipContext;
}

export function KnowledgeView({ snapshot, membership }: KnowledgeViewProps) {
  const { knowledge: mockKnowledge } = snapshot;
  const getKnowledgeByShelf = (shelf: KnowledgeShelfKind) =>
    mockKnowledge.filter((k) => k.shelf === shelf);
  const desk = getKnowledgeByShelf("desk");
  const bookshelf = getKnowledgeByShelf("bookshelf");
  const cabinet = getKnowledgeByShelf("cabinet");
  const stale = mockKnowledge.filter((k) => k.freshness === "stale");
  const canonicalCount = mockKnowledge.filter((k) => k.canonical).length;
  const canPromote = canPerform(membership.role, "promote-knowledge");
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const promotionCandidates = mockKnowledge
    .filter((k) => !k.canonical && (k.shelf === "desk" || k.memoryTier === "M2"))
    .slice(0, 6);

  const handlePromote = (knowledgeId: string) => {
    setPromotionError(null);
    setPromotingId(knowledgeId);
    startTransition(async () => {
      try {
        await promoteKnowledge({ knowledgeId });
      } catch (err) {
        setPromotionError(err instanceof Error ? err.message : "Promotion failed.");
      } finally {
        setPromotingId(null);
      }
    });
  };
  const tierBreakdown = (["M0", "M1", "M2", "M3", "M4"] as MemoryTier[]).map((tier) => ({
    tier,
    count: mockKnowledge.filter((k) => k.memoryTier === tier).length,
    description: TIER_DESCRIPTIONS[tier],
  }));

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Knowledge Architecture"
        title="Desk · Bookshelf · Filing Cabinet"
        description="Where intelligence compounds. Every artifact, decision, and signal sits on a shelf with a memory tier and a freshness state."
        badge={`${canonicalCount} canonical`}
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Tile
            label="Canonical items"
            value={String(canonicalCount)}
            sub={`${Math.round((canonicalCount / mockKnowledge.length) * 100)}% of all knowledge — the compounding share.`}
            icon={<Star className="h-4 w-4 text-[--accent-vivid] fill-[--accent-vivid]" />}
            tone="accent"
          />
          <Tile
            label="Items needing re-validation"
            value={String(stale.length)}
            sub="Knowledge that has aged out of confidence. Re-validate to keep the Bookshelf honest."
            icon={<AlertTriangle className="h-4 w-4 text-[--warning]" />}
            tone="warning"
          />
          <Tile
            label="Total knowledge items"
            value={String(mockKnowledge.length)}
            sub="Across all three shelves. Grows with every engagement."
            icon={<Star className="h-4 w-4 text-[--text-muted]" />}
            tone="default"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[{ shelf: "desk" as const, items: desk }, { shelf: "bookshelf" as const, items: bookshelf }, { shelf: "cabinet" as const, items: cabinet }].map(({ shelf, items }) => (
            <div key={shelf} className="min-h-[420px]">
              <DashboardCard id={`shelf-${shelf}`} eyebrow="SHELF" title={shelfTitle(shelf)} bodyClassName="overflow-hidden">
                <ScrollArea className="h-full">
                  <KnowledgeShelf shelf={shelf} items={items} />
                </ScrollArea>
              </DashboardCard>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="min-h-[260px]">
            <DashboardCard
              id="memory-tiers"
              eyebrow="MEMORY TIERS"
              title="M0 → M4 · the compounding ladder"
              subtitle="Confidence rises with promotion; only M3/M4 are reusable across engagements."
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {tierBreakdown.map((row) => (
                    <li key={row.tier} className="flex items-start gap-3 px-3 py-2.5">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[--accent-vivid] w-8 shrink-0">
                        {row.tier}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[--text-secondary] leading-snug">{row.description}</p>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-[--text-secondary] shrink-0">{row.count}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>

          <div className="min-h-[260px]">
            <DashboardCard
              id="stale-warning"
              eyebrow="CONFIDENCE DECAY"
              title="What's drifting out of freshness?"
              subtitle="Confidence decay is built in — knowledge that isn't validated degrades."
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {stale.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-[--text-muted]">All knowledge is fresh. Nothing to revalidate.</li>
                  ) : (
                    stale.map((item) => (
                      <li key={item.id} className="flex items-start gap-2 px-3 py-2.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-[--warning] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[--text-primary] truncate">{item.title}</p>
                          <p className="text-xs text-[--text-muted] leading-snug">
                            {item.memoryTier} · last validated {relativeDays(item.lastValidatedAt)} ago · confidence {Math.round(item.confidence * 100)}%
                          </p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>

        <div className="min-h-[260px]">
          <DashboardCard
            id="canonical-promotion"
            eyebrow="CANONICAL PROMOTION"
            title="Items eligible for the Bookshelf"
            subtitle={canPromote
              ? "Promote a Desk item to canonical to mark it reusable across engagements. Every promotion is audited."
              : `Your role (${membership.role}) can read promotions but not approve them.`}
            agentId="agent-governance-auditor"
            agentState="thinking"
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {promotionCandidates.length === 0 ? (
                  <li className="px-3 py-6 text-center text-xs text-[--text-muted]">
                    No items in the queue. New Desk items appear here when their memory tier reaches M2.
                  </li>
                ) : (
                  promotionCandidates.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 px-3 py-2.5">
                      <Sparkles className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[--text-primary] leading-snug">{item.title}</p>
                        <p className="text-xs text-[--text-muted] leading-snug">
                          {item.shelf} · {item.memoryTier} · confidence {Math.round(item.confidence * 100)}% · {item.source}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!canPromote || isPending}
                        onClick={() => handlePromote(item.id)}
                        className="shrink-0"
                      >
                        {promotingId === item.id ? "Promoting…" : "Promote"}
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </DashboardCard>
          {promotionError && (
            <p className="text-xs text-[--danger] leading-snug mt-2">{promotionError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, sub, icon, tone }: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  tone: "accent" | "warning" | "default";
}) {
  return (
    <DashboardCard id={`tile-${label}`} eyebrow="KNOWLEDGE" title={label}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-[--radius-md] shrink-0 border ${
          tone === "accent" ? "bg-[--accent-dim] border-[--border-active]" :
          tone === "warning" ? "bg-[--warning-dim] border-[color:rgba(245,158,11,0.3)]" :
          "bg-[--elevated] border-[--border-default]"
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold tabular-nums text-[--text-primary] leading-none">{value}</p>
          <p className="text-xs text-[--text-muted] mt-1 leading-snug">{sub}</p>
        </div>
      </div>
    </DashboardCard>
  );
}

function shelfTitle(shelf: "desk" | "bookshelf" | "cabinet"): string {
  switch (shelf) {
    case "desk":      return "Desk · operational";
    case "bookshelf": return "Bookshelf · canonical";
    case "cabinet":   return "Filing Cabinet · archive";
  }
}

function relativeDays(date: Date): string {
  return `${Math.round((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000))}d`;
}
