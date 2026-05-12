"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, X } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DecisionList } from "@/components/patterns/decision-list";
import { EvidenceLink } from "@/components/patterns/evidence-link";
import type { Decision, PortalSnapshot } from "@/lib/portal/types";
import type { MembershipContext } from "@/lib/auth/session";
import { canPerform } from "@/lib/auth/membership-gate";
import { approveDecision, deferDecision, rejectDecision } from "@/lib/portal/actions";

type Filter = "pending" | "approved" | "deferred" | "rejected" | "superseded" | "all";
const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "pending",     label: "Pending" },
  { key: "approved",    label: "Approved" },
  { key: "deferred",    label: "Deferred" },
  { key: "rejected",    label: "Rejected" },
  { key: "superseded",  label: "Superseded" },
  { key: "all",         label: "All" },
];

function bucket(decision: Decision, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "pending") return decision.status === "pending-approval";
  if (filter === "approved") return decision.status === "approved";
  if (filter === "deferred") return decision.status === "deferred";
  if (filter === "rejected") return decision.status === "rejected";
  if (filter === "superseded") return decision.status === "superseded";
  return false;
}

interface DecisionsViewProps {
  snapshot: PortalSnapshot;
  membership: MembershipContext;
}

export function DecisionsView({ snapshot, membership }: DecisionsViewProps) {
  const { decisions: mockDecisions, evidence: mockEvidence, engagements: mockEngagements } = snapshot;
  const [filter, setFilter] = useState<Filter>("pending");
  const [selectedId, setSelectedId] = useState<string>(mockDecisions[0]?.id ?? "");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = mockDecisions.filter((d) => bucket(d, filter));
  const selected = mockDecisions.find((d) => d.id === selectedId) ?? filtered[0];
  const evidence = selected
    ? selected.evidenceIds.map((id) => mockEvidence.find((e) => e.id === id)).filter((e): e is NonNullable<typeof e> => Boolean(e))
    : [];
  const engagement = selected ? mockEngagements.find((e) => e.id === selected.engagementId) : undefined;
  const canApprove = canPerform(membership.role, "approve-decision");

  const handleDecision = (
    action: (input: { decisionId: string }) => Promise<void>,
  ) => {
    if (!selected) return;
    setActionError(null);
    startTransition(async () => {
      try {
        await action({ decisionId: selected.id });
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Decision Register"
        title="What needs your judgment"
        description={`${mockDecisions.filter((d) => d.status === "pending-approval").length} pending · ${mockDecisions.length} total — every approved decision is versioned, not destroyed.`}
        badge={`${mockDecisions.filter((d) => d.status === "pending-approval").length} pending`}
        badgeVariant="warning"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>{f.label}</TabsTrigger>
            ))}
          </TabsList>
          {FILTERS.map((f) => (
            <TabsContent key={f.key} value={f.key} />
          ))}
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 min-h-[520px]">
            <DashboardCard
              id="decision-register"
              eyebrow="REGISTER"
              title="Decisions"
              subtitle={`${filtered.length} in this view`}
              agentId="agent-engagement-analyst"
              agentState="thinking"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <ul className="flex flex-col">
                  {filtered.map((decision) => (
                    <li key={decision.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(decision.id)}
                        className={`w-full text-left ${decision.id === selected?.id ? "bg-[--accent-dim] border-l-2 border-[--border-active]" : "hover:bg-[--elevated]"}`}
                      >
                        <DecisionList decisions={[decision]} />
                      </button>
                    </li>
                  ))}
                  {filtered.length === 0 && (
                    <li className="px-3 py-8 text-center text-xs text-[--text-muted]">No decisions in this view.</li>
                  )}
                </ul>
              </ScrollArea>
            </DashboardCard>
          </div>

          <div className="min-h-[520px] flex flex-col gap-3">
            <DashboardCard
              id="decision-detail"
              eyebrow="DECISION DETAIL"
              title={selected?.title ?? "No decision selected"}
              subtitle={engagement?.name}
              actions={
                selected && (
                  <Link
                    href={`/portal/decisions/${selected.id}`}
                    className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
                  >
                    Open detail <ArrowRight className="h-3 w-3" />
                  </Link>
                )
              }
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                {selected && (
                  <div className="px-3 py-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Field label="Status">{selected.status.replace("-", " ")}</Field>
                      <Field label="Risk tier">{selected.riskTier}</Field>
                      <Field label="Confidence">{Math.round(selected.recommendation.confidence * 100)}%</Field>
                      <Field label="Proposed by">{selected.proposedBy}</Field>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Recommendation</p>
                      <p className="text-xs text-[--text-primary] leading-relaxed">{selected.recommendation.summary}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Rationale</p>
                      <p className="text-xs text-[--text-secondary] leading-relaxed">{selected.recommendation.rationale}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Options</p>
                      <ul className="flex flex-col gap-1.5">
                        {selected.recommendation.options.map((option) => (
                          <li
                            key={option.label}
                            className={`rounded-[--radius-md] px-2 py-1.5 text-xs leading-snug ${
                              option.isDefault
                                ? "bg-[--accent-dim] border border-[--border-active] text-[--text-primary]"
                                : "bg-[--elevated] border border-[--border-subtle] text-[--text-secondary]"
                            }`}
                          >
                            <p className="font-semibold">{option.label}{option.isDefault ? " · default" : ""}</p>
                            <p className="text-[--text-muted]">{option.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {selected.status === "pending-approval" && (
                      <div className="space-y-1.5 pt-1 border-t border-[--border-subtle]">
                        <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">
                          {canApprove ? "Record outcome" : "Outcome (read-only for your role)"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant="primary"
                            className="gap-1.5"
                            disabled={!canApprove || isPending}
                            onClick={() => handleDecision(approveDecision)}
                          >
                            <Check className="h-3 w-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1.5"
                            disabled={!canApprove || isPending}
                            onClick={() => handleDecision(deferDecision)}
                          >
                            <Clock className="h-3 w-3" /> Defer
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5"
                            disabled={!canApprove || isPending}
                            onClick={() => handleDecision(rejectDecision)}
                          >
                            <X className="h-3 w-3" /> Reject
                          </Button>
                        </div>
                        {actionError && (
                          <p className="text-xs text-[--danger] leading-snug">{actionError}</p>
                        )}
                      </div>
                    )}
                    {selected.status !== "pending-approval" && selected.decidedAt && (
                      <p className="text-xs text-[--text-muted] pt-1 border-t border-[--border-subtle]">
                        {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)} by {selected.decidedBy} on {selected.decidedAt.toLocaleDateString()}.
                      </p>
                    )}
                  </div>
                )}
              </ScrollArea>
            </DashboardCard>

            <DashboardCard
              id="decision-evidence"
              eyebrow="EVIDENCE VAULT"
              title="What backs this recommendation"
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-1.5 px-3 py-2.5">
                  {evidence.length === 0 ? (
                    <p className="text-xs text-[--text-muted]">No evidence linked yet.</p>
                  ) : (
                    evidence.map((ev) => (
                      <EvidenceLink key={ev.id} kind={ev.kind} title={ev.title} source={ev.source} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </DashboardCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
      <p className="text-xs uppercase tracking-widest text-[--text-muted]">{label}</p>
      <p className="text-xs text-[--text-primary]">{children}</p>
    </div>
  );
}
