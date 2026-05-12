"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldAlert, Play } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";

import type { MembershipContext } from "@/lib/auth/session";
import type {
  MarketplaceInstall,
  MarketplaceListing,
  MarketplacePayout,
} from "@/lib/portal/marketplace/types";
import {
  installAction,
  killSwitchAction,
  publishAction,
  runEvalAction,
  uninstallAction,
} from "@/lib/portal/marketplace/actions";

interface MarketplaceViewProps {
  membership: MembershipContext;
  listings: MarketplaceListing[];
  installs: MarketplaceInstall[];
  payouts: MarketplacePayout[];
}

const STATUS_TONE: Record<MarketplaceListing["status"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  "pending-eval": "info",
  "passed-eval": "accent",
  live: "success",
  killswitched: "danger",
  withdrawn: "warning",
};

export function MarketplaceView({ membership, listings, installs, payouts }: MarketplaceViewProps) {
  const isOwner = membership.role === "owner";
  const canInstall = isOwner || membership.role === "executive";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [killReason, setKillReason] = useState("");
  const [killTarget, setKillTarget] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Marketplace"
        title="Third-party agents under the same governance contract"
        description={`${listings.filter((l) => l.status === "live").length} live · ${listings.filter((l) => l.status === "pending-eval").length} pending eval · ${installs.length} installed in this workspace.`}
        badge="Phase 15.0"
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="marketplace-listings"
          eyebrow="LISTINGS"
          title="Browse + install"
          subtitle="Every listing rides the same archetype + tool-catalog contract Dauntless agents follow. Killswitch revokes globally within minutes."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[520px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {listings.map((listing) => {
                const install = installs.find((i) => i.listingId === listing.id && i.status === "active");
                return (
                  <li key={listing.id} className="flex flex-col gap-1.5 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                      <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{listing.name}</p>
                      <ContentTag variant={STATUS_TONE[listing.status]} dot>
                        {listing.status}
                      </ContentTag>
                      <ContentTag variant="info">{listing.archetype}</ContentTag>
                      <span className="text-xs font-mono tabular-nums text-[--text-primary]">
                        ${listing.pricePerInstallUsd}/mo · {listing.revenueSharePct}% to dev
                      </span>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{listing.description}</p>
                    <p className="text-xs text-[--text-muted] leading-snug">by {listing.developer}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {listing.toolSurface.map((tool) => (
                        <ContentTag key={tool} variant="default">{tool}</ContentTag>
                      ))}
                    </div>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-[--text-muted]">Declared scope</summary>
                      <ul className="mt-1 ml-3 list-disc text-[--text-secondary] space-y-0.5">
                        {listing.scopeBullets.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    </details>
                    {listing.evalResults && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-[--text-muted]">
                          Eval verdict: <strong className={listing.evalResults.verdict === "pass" ? "text-[--success]" : "text-[--danger]"}>{listing.evalResults.verdict}</strong>
                          {" "}({listing.evalResults.passingControlCount}/{listing.evalResults.totalControlCount})
                        </summary>
                        <ul className="mt-1 ml-3 text-[--text-secondary] space-y-0.5">
                          <li>Decision accuracy: {Math.round(listing.evalResults.decisionAccuracy * 100)}%</li>
                          <li>Evidence completeness: {Math.round(listing.evalResults.evidenceCompleteness * 100)}%</li>
                          <li>Toxicity: {Math.round(listing.evalResults.toxicityScore * 100)}%</li>
                          <li>Respects separation-of-powers: {listing.evalResults.separationOfPowersRespect ? "yes" : "no"}</li>
                          <li>Notes: {listing.evalResults.notes}</li>
                        </ul>
                      </details>
                    )}
                    {listing.assuranceReport && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-[--text-muted]">Dauntless assurance report</summary>
                        <p className="mt-1 ml-3 text-[--text-secondary]">{listing.assuranceReport.summary}</p>
                        {listing.assuranceReport.followUps.length > 0 && (
                          <ul className="ml-3 list-disc text-[--text-secondary]">
                            {listing.assuranceReport.followUps.map((f, idx) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        )}
                      </details>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {isOwner && listing.status === "pending-eval" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1.5"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              try {
                                await runEvalAction({ listingId: listing.id });
                              } catch (err) {
                                setError(err instanceof Error ? err.message : "Eval failed.");
                              }
                            })
                          }
                        >
                          <Play className="h-3 w-3" /> Run eval
                        </Button>
                      )}
                      {isOwner && listing.status === "passed-eval" && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              try {
                                await publishAction({ listingId: listing.id });
                              } catch (err) {
                                setError(err instanceof Error ? err.message : "Publish failed.");
                              }
                            })
                          }
                        >
                          Publish
                        </Button>
                      )}
                      {canInstall && listing.status === "live" && !install && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              try {
                                await installAction({ listingId: listing.id });
                              } catch (err) {
                                setError(err instanceof Error ? err.message : "Install failed.");
                              }
                            })
                          }
                        >
                          Install
                        </Button>
                      )}
                      {install && canInstall && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              try {
                                await uninstallAction({ installId: install.id });
                              } catch (err) {
                                setError(err instanceof Error ? err.message : "Uninstall failed.");
                              }
                            })
                          }
                        >
                          Uninstall
                        </Button>
                      )}
                      {isOwner && listing.status === "live" && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          <input
                            type="text"
                            value={killTarget === listing.id ? killReason : ""}
                            onChange={(e) => {
                              setKillTarget(listing.id);
                              setKillReason(e.target.value);
                            }}
                            placeholder="killswitch reason…"
                            className="h-7 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5 w-44"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5"
                            disabled={isPending || killTarget !== listing.id || !killReason.trim()}
                            onClick={() =>
                              startTransition(async () => {
                                try {
                                  await killSwitchAction({ listingId: listing.id, reason: killReason.trim() });
                                  setKillReason("");
                                  setKillTarget(null);
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Killswitch failed.");
                                }
                              })
                            }
                          >
                            <ShieldAlert className="h-3 w-3" /> Killswitch
                          </Button>
                        </div>
                      )}
                    </div>
                    {listing.status === "killswitched" && (
                      <p className="text-xs text-[--danger] leading-snug">
                        Killswitched: {listing.killSwitchReason ?? "(no reason given)"}.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </DashboardCard>

        {isOwner && (
          <DashboardCard
            id="marketplace-payouts"
            eyebrow="REVENUE SHARE"
            title={`Monthly payouts · ${payouts.length} record${payouts.length === 1 ? "" : "s"}`}
            subtitle="Phase 15.1 will wire real ACH / wire transfers from the payout ledger."
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[200px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[--panel-bg] z-10">
                  <tr className="border-b border-[--border-subtle]">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Developer</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Period</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Installs</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Gross</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Share</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p, idx) => (
                    <tr key={`${p.developer}-${p.periodLabel}-${idx}`} className="border-b border-[--border-subtle]">
                      <td className="px-3 py-2 text-[--text-primary]">{p.developer}</td>
                      <td className="px-3 py-2 text-[--text-primary] font-mono">{p.periodLabel}</td>
                      <td className="px-3 py-2 text-[--text-primary] font-mono tabular-nums">{p.installs}</td>
                      <td className="px-3 py-2 text-[--text-primary] font-mono tabular-nums">${p.grossUsd.toFixed(2)}</td>
                      <td className="px-3 py-2 text-[--text-primary] font-mono tabular-nums">${p.shareUsd.toFixed(2)}</td>
                      <td className="px-3 py-2 text-[--text-muted] font-mono tabular-nums">{p.paidAt ? p.paidAt.toLocaleDateString() : "pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </DashboardCard>
        )}

        {error && <p className="text-xs text-[--danger]">{error}</p>}

        <p className="text-xs text-[--text-muted] leading-snug">
          Submission spec: every third-party agent declares archetype + tool surface + scope.
          The eval harness runs against the same tool catalog Dauntless agents use, so listings that violate
          separation-of-powers fail automatically.
        </p>
      </div>
    </div>
  );
}
