"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Network, Search, X } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";

import type { MembershipContext } from "@/lib/auth/session";
import type { Artifact } from "@/lib/portal/types";
import type {
  FederationContribution,
  FederationDefinition,
  FederationMembership,
} from "@/lib/portal/federation/types";
import type { FederationSearchResult } from "@/lib/portal/federation";
import {
  contributeArtifactToFederation,
  joinFederation,
  leaveFederation,
  withdrawFederationContribution,
} from "@/lib/portal/federation/actions";

interface FederationViewProps {
  membership: MembershipContext;
  federations: FederationDefinition[];
  memberships: FederationMembership[];
  contributions: FederationContribution[];
  artifacts: Artifact[];
  query: string;
  activeFederationId?: string;
  results: FederationSearchResult[];
}

export function FederationView({
  membership,
  federations,
  memberships,
  contributions,
  artifacts,
  query,
  activeFederationId,
  results,
}: FederationViewProps) {
  const router = useRouter();
  const canManage = membership.role === "owner" || membership.role === "executive";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [queryDraft, setQueryDraft] = useState(query);
  const [contribFedId, setContribFedId] = useState<string>(memberships[0]?.federationId ?? federations[0]?.id ?? "");
  const [contribArtifactId, setContribArtifactId] = useState<string>(artifacts[0]?.id ?? "");
  const [contribLevel, setContribLevel] = useState<"light" | "standard" | "strict">("standard");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (queryDraft) url.searchParams.set("q", queryDraft);
    else url.searchParams.delete("q");
    if (activeFederationId) url.searchParams.set("fed", activeFederationId);
    startTransition(() => router.push(url.pathname + url.search));
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Federation"
        title="Shared canonical layer across peer workspaces"
        description={`${memberships.filter((m) => m.status === "active").length} active membership${memberships.filter((m) => m.status === "active").length === 1 ? "" : "s"} · ${contributions.filter((c) => c.status === "active").length} active contribution${contributions.filter((c) => c.status === "active").length === 1 ? "" : "s"}.`}
        badge="Phase 12.0"
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="federation-search"
          eyebrow="CROSS-TENANT SEARCH"
          title="Search the federation canonical layer"
          subtitle="Workspace provenance is intentionally stripped from results — that's the federation's privacy contract."
        >
          <form onSubmit={handleSearch} className="px-3 py-2.5 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[--text-muted]" />
                <Input value={queryDraft} onChange={(e) => setQueryDraft(e.target.value)} placeholder="Search across federation contributions…" className="pl-7 h-8 text-xs" />
              </div>
              <Button type="submit" size="sm" variant="primary" disabled={isPending}>Search</Button>
            </div>
            {results.length > 0 && (
              <ScrollArea className="max-h-[260px] mt-2">
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {results.map((r) => (
                    <li key={r.contributionId} className="flex flex-col gap-1 py-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                        <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{r.title}</p>
                        <ContentTag variant="info">{r.federationName}</ContentTag>
                        <span className="text-xs font-mono tabular-nums text-[--text-muted]">{r.score.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-[--text-secondary] leading-snug">{r.snippet}</p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
            {query && results.length === 0 && (
              <p className="text-xs text-[--text-muted] leading-snug">No federation contributions match. Try contributing one first.</p>
            )}
          </form>
        </DashboardCard>

        <DashboardCard
          id="federation-catalog"
          eyebrow="FEDERATIONS"
          title="Available federations"
          subtitle="Each federation is sector-scoped and curated by Dauntless. Joining is reversible; leaving revokes all active contributions."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[420px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {federations.map((f) => {
                const m = memberships.find((row) => row.federationId === f.id);
                const isMember = m?.status === "active";
                return (
                  <li key={f.id} className="flex flex-col gap-1.5 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Network className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                      <p className="flex-1 text-xs font-semibold text-[--text-primary]">{f.name}</p>
                      <ContentTag variant={isMember ? "success" : "default"} dot>
                        {isMember ? "member" : "not joined"}
                      </ContentTag>
                      <ContentTag variant="info">{f.tier}</ContentTag>
                      <ContentTag variant="default">{f.memberCount} workspaces</ContentTag>
                    </div>
                    <p className="text-xs text-[--text-secondary] leading-snug">{f.description}</p>
                    <p className="text-xs text-[--text-muted] leading-snug">
                      Curated anchors: {f.curatedAnchors.join(" · ")}
                    </p>
                    {canManage && (
                      <div className="flex items-center gap-1.5">
                        {!isMember ? (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                try {
                                  await joinFederation({ federationId: f.id });
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Join failed.");
                                }
                              })
                            }
                          >
                            Join
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                try {
                                  await leaveFederation({ federationId: f.id });
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Leave failed.");
                                }
                              })
                            }
                          >
                            Leave
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="federation-contribute"
          eyebrow="CONTRIBUTE"
          title={canManage ? "Opt an artifact into a federation" : "Contribute artifact (read-only)"}
          subtitle={
            canManage
              ? "Anonymization runs at opt-in time. The federation snapshot is what other members see; withdraw any time to revoke."
              : `Your role (${membership.role}) cannot contribute artifacts.`
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              startTransition(async () => {
                try {
                  await contributeArtifactToFederation({
                    federationId: contribFedId,
                    artifactId: contribArtifactId,
                    anonymizationLevel: contribLevel,
                  });
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Contribute failed.");
                }
              });
            }}
            className="px-3 py-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs"
          >
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Federation</span>
              <select
                value={contribFedId}
                onChange={(e) => setContribFedId(e.target.value)}
                disabled={!canManage || isPending}
                className="h-8 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5"
              >
                {memberships
                  .filter((m) => m.status === "active")
                  .map((m) => (
                    <option key={m.federationId} value={m.federationId}>{m.federationId}</option>
                  ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Artifact</span>
              <select
                value={contribArtifactId}
                onChange={(e) => setContribArtifactId(e.target.value)}
                disabled={!canManage || isPending}
                className="h-8 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5"
              >
                {artifacts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Anonymization</span>
              <select
                value={contribLevel}
                onChange={(e) => setContribLevel(e.target.value as typeof contribLevel)}
                disabled={!canManage || isPending}
                className="h-8 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5"
              >
                <option value="light">light · names preserved</option>
                <option value="standard">standard · names → [member]</option>
                <option value="strict">strict · per-role placeholders</option>
              </select>
            </label>
            <div className="md:col-span-3 flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!canManage || isPending || !contribFedId || !contribArtifactId}
              >
                Contribute
              </Button>
              {error && <p className="text-xs text-[--danger]">{error}</p>}
            </div>
          </form>
        </DashboardCard>

        <DashboardCard
          id="federation-contributions"
          eyebrow="CONTRIBUTIONS"
          title={`${contributions.filter((c) => c.status === "active").length} active · ${contributions.filter((c) => c.status === "withdrawn").length} withdrawn`}
          subtitle="Withdraw to revoke a contribution at any time. Phase 12.1 will trigger remote cache invalidation."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[360px]">
            {contributions.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                No contributions yet. Use the form above.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {contributions.map((c) => (
                  <li key={c.id} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ContentTag variant={c.status === "active" ? "success" : "default"} dot>
                        {c.status}
                      </ContentTag>
                      <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{c.snapshot.title}</p>
                      <ContentTag variant="info">{c.anonymizationLevel}</ContentTag>
                      <span className="text-xs font-mono tabular-nums text-[--text-muted]">
                        {c.contributedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[--text-muted] leading-snug">{c.federationId} · {c.contributedBy}</p>
                    {c.status === "active" && canManage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 w-fit"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            try {
                              await withdrawFederationContribution({ contributionId: c.id });
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Withdraw failed.");
                            }
                          })
                        }
                      >
                        <X className="h-3 w-3" /> Withdraw
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DashboardCard>
      </div>
    </div>
  );
}
