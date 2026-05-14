"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Plug, Play, Check, RotateCcw, X } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";

import type { MembershipContext } from "@/lib/auth/session";
import type {
  ConnectorDefinition,
  OutboundAction,
  OutboundActionStatus,
} from "@/lib/portal/outbound-actions/types";
import type { Engagement } from "@/lib/portal/types";
import {
  approveOutboundActionAction,
  commitOutboundActionAction,
  proposeOutboundActionAction,
  rollbackOutboundActionAction,
} from "@/lib/portal/outbound-actions/actions";

interface OutboundActionsViewProps {
  membership: MembershipContext;
  connectors: ConnectorDefinition[];
  actions: OutboundAction[];
  engagements: Engagement[];
}

const STATUS_TONE: Record<OutboundActionStatus, React.ComponentProps<typeof ContentTag>["variant"]> = {
  proposed: "info",
  audited: "info",
  approved: "accent",
  "dry-run": "warning",
  committed: "success",
  failed: "danger",
  "rolled-back": "default",
};

export function OutboundActionsView({ membership, connectors, actions, engagements }: OutboundActionsViewProps) {
  const canPropose =
    membership.role === "owner" || membership.role === "executive" || membership.role === "lead";
  const canApprove = membership.role === "owner" || membership.role === "executive";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [connectorId, setConnectorId] = useState(connectors[0]?.id ?? "internal");
  const activeConnector = connectors.find((c) => c.id === connectorId) ?? connectors[0];
  const [capabilityId, setCapabilityId] = useState(activeConnector?.capabilities[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [engagementId, setEngagementId] = useState<string>(engagements[0]?.id ?? "");
  const [payload, setPayload] = useState('{\n  "example": "payload"\n}');

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(payload || "{}");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid payload JSON.");
      return;
    }
    startTransition(async () => {
      try {
        await proposeOutboundActionAction({
          connectorId: connectorId as ConnectorDefinition["id"],
          capabilityId,
          title,
          description,
          engagementId: engagementId || undefined,
          payload: parsed,
        });
        setTitle("");
        setDescription("");
        setPayload('{\n  "example": "payload"\n}');
      } catch (err) {
        setError(err instanceof Error ? err.message : "Propose failed.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Outbound Actions"
        title="Agents step out of the cockpit"
        description="Every outbound action follows the same propose → approve → commit contract as a decision. Dry-run by default; high-risk capabilities require fresh approval each time."
        badge={`${actions.filter((a) => a.status === "committed").length} committed · ${actions.filter((a) => a.status !== "committed" && a.status !== "rolled-back").length} in flight`}
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        {/* Advisory-board action #18 — plain-language explainer */}
        <DashboardCard
          id="actions-explainer"
          eyebrow="HOW THIS WORKS"
          title="Propose → Approve → Commit (or dry-run first)"
          subtitle="Every outbound action passes through three steps. You can preview without acting at any point."
        >
          <div className="px-3 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-[--radius-md] border border-[--border-subtle] bg-[--elevated] p-3">
              <p className="font-semibold text-[--text-primary] mb-1">1 · Propose</p>
              <p className="text-[--text-secondary] leading-snug">
                Someone (a teammate or an agent) drafts an action — "create a Jira ticket", "post a Slack message". Nothing leaves the portal yet.
              </p>
            </div>
            <div className="rounded-[--radius-md] border border-[--border-subtle] bg-[--elevated] p-3">
              <p className="font-semibold text-[--text-primary] mb-1">2 · Approve</p>
              <p className="text-[--text-secondary] leading-snug">
                A human reviews. They can approve, reject, or — for risky things — request a <span className="italic">dry-run</span> first.
              </p>
            </div>
            <div className="rounded-[--radius-md] border border-[--border-subtle] bg-[--elevated] p-3">
              <p className="font-semibold text-[--text-primary] mb-1">3 · Commit</p>
              <p className="text-[--text-secondary] leading-snug">
                The action executes against the external system. If something goes wrong, the recorded <span className="italic">inverse plan</span> can roll it back.
              </p>
            </div>
          </div>
          <div className="px-3 pb-3 text-xs text-[--text-muted] leading-snug">
            <p>
              <span className="font-semibold text-[--text-secondary]">Dry-run</span> means: simulate what would happen and return the result — without actually doing it. Safe to use any time.{" "}
              <Link href="/portal/help/glossary" className="text-[--accent-vivid] hover:underline">More portal vocabulary →</Link>
            </p>
            <p className="mt-1">
              Worried? <Link href="/portal/help/something-went-wrong" className="text-[--accent-vivid] hover:underline">Freeze all outbound actions →</Link>
            </p>
          </div>
        </DashboardCard>

        <DashboardCard
          id="actions-connectors"
          eyebrow="CONNECTORS"
          title={`${connectors.length} connectors registered · ${connectors.filter((c) => c.connected).length} connected`}
          subtitle="Each connector advertises its capabilities + scope. Phase 11.1 wires the HTTP adapters; Phase 11.0 simulates."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[300px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {connectors.map((connector) => (
                <li key={connector.id} className="flex flex-col gap-1 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Plug className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                    <p className="flex-1 text-xs font-semibold text-[--text-primary]">{connector.label}</p>
                    <ContentTag variant={connector.connected ? "success" : "default"} dot>
                      {connector.connected ? "connected" : "not configured"}
                    </ContentTag>
                    <ContentTag variant="info">{connector.category}</ContentTag>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {connector.capabilities.map((cap) => (
                      <ContentTag key={cap.id} variant={cap.defaultRiskTier === "high" ? "warning" : "default"}>
                        {cap.label} · {cap.defaultRiskTier}
                      </ContentTag>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="actions-propose"
          eyebrow="PROPOSE"
          title={canPropose ? "Propose an outbound action" : "Propose an outbound action (read-only)"}
          subtitle={
            canPropose
              ? "Defaults to dry-run on commit; high-risk capabilities require fresh approval each time."
              : `Your role (${membership.role}) cannot propose outbound actions.`
          }
        >
          <form onSubmit={handlePropose} className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Connector</span>
              <select
                value={connectorId}
                onChange={(e) => {
                  setConnectorId(e.target.value as ConnectorDefinition["id"]);
                  const next = connectors.find((c) => c.id === e.target.value);
                  setCapabilityId(next?.capabilities[0]?.id ?? "");
                }}
                disabled={!canPropose || isPending}
                className="h-8 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5"
              >
                {connectors.map((c) => (
                  <option key={c.id} value={c.id}>{c.label} {c.connected ? "(connected)" : ""}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Capability</span>
              <select
                value={capabilityId}
                onChange={(e) => setCapabilityId(e.target.value)}
                disabled={!canPropose || isPending}
                className="h-8 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5"
              >
                {activeConnector?.capabilities.map((cap) => (
                  <option key={cap.id} value={cap.id}>{cap.label} · {cap.defaultRiskTier}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Title</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canPropose || isPending} className="h-8 text-xs" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Engagement</span>
              <select
                value={engagementId}
                onChange={(e) => setEngagementId(e.target.value)}
                disabled={!canPropose || isPending}
                className="h-8 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5"
              >
                <option value="">— Workspace-wide —</option>
                {engagements.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="uppercase tracking-widest text-[--text-muted]">Description</span>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={!canPropose || isPending} className="min-h-[60px] text-xs" />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="uppercase tracking-widest text-[--text-muted]">Payload (JSON)</span>
              <Textarea value={payload} onChange={(e) => setPayload(e.target.value)} disabled={!canPropose || isPending} className="min-h-[100px] text-xs font-mono" />
            </label>
            <div className="md:col-span-2 flex items-center gap-2">
              <Button type="submit" size="sm" variant="primary" disabled={!canPropose || isPending || !title.trim()}>
                {isPending ? "Proposing…" : "Propose"}
              </Button>
              {error && <p className="text-xs text-[--danger]">{error}</p>}
            </div>
          </form>
        </DashboardCard>

        <DashboardCard
          id="actions-queue"
          eyebrow="QUEUE"
          title={`${actions.length} action${actions.length === 1 ? "" : "s"} in this workspace`}
          subtitle="Approve → dry-run → commit. Reversible capabilities can be rolled back via the inverse plan."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[520px]">
            {actions.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                No outbound actions yet. Propose one above to seed the queue.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {actions.map((action) => (
                  <ActionRow
                    key={action.id}
                    action={action}
                    canApprove={canApprove}
                    isPending={isPending}
                    onApprove={() =>
                      startTransition(async () => {
                        try {
                          await approveOutboundActionAction({ actionId: action.id });
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Approve failed.");
                        }
                      })
                    }
                    onDryRun={() =>
                      startTransition(async () => {
                        try {
                          await commitOutboundActionAction({ actionId: action.id, dryRunOnly: true });
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Dry-run failed.");
                        }
                      })
                    }
                    onCommit={() =>
                      startTransition(async () => {
                        try {
                          await commitOutboundActionAction({ actionId: action.id });
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Commit failed.");
                        }
                      })
                    }
                    onRollback={() =>
                      startTransition(async () => {
                        try {
                          await rollbackOutboundActionAction({ actionId: action.id });
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Rollback failed.");
                        }
                      })
                    }
                  />
                ))}
              </ul>
            )}
          </ScrollArea>
        </DashboardCard>
      </div>
    </div>
  );
}

function ActionRow({
  action,
  canApprove,
  isPending,
  onApprove,
  onDryRun,
  onCommit,
  onRollback,
}: {
  action: OutboundAction;
  canApprove: boolean;
  isPending: boolean;
  onApprove: () => void;
  onDryRun: () => void;
  onCommit: () => void;
  onRollback: () => void;
}) {
  return (
    <li className="flex flex-col gap-1.5 px-3 py-3">
      <div className="flex items-center gap-2">
        <ContentTag variant={STATUS_TONE[action.status]} dot>
          {action.status}
        </ContentTag>
        <ContentTag variant={action.riskTier === "high" ? "warning" : "info"}>
          {action.riskTier} risk
        </ContentTag>
        <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{action.title}</p>
        <code className="text-xs font-mono text-[--text-muted]">{action.connectorId}/{action.capabilityId}</code>
      </div>
      <p className="text-xs text-[--text-secondary] leading-snug">{action.description}</p>
      <details className="text-xs">
        <summary className="cursor-pointer text-[--text-muted]">Proposed payload</summary>
        <pre className="font-mono bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-2 py-1.5 mt-1 whitespace-pre-wrap text-[--text-primary]">
          {JSON.stringify(action.proposedPayload, null, 2)}
        </pre>
      </details>
      {action.dryRunOutput && (
        <details className="text-xs">
          <summary className="cursor-pointer text-[--text-muted]">Last simulated diff</summary>
          <pre className="font-mono bg-[--elevated-2] border border-[--border-subtle] rounded-[--radius-md] px-2 py-1.5 mt-1 whitespace-pre-wrap text-[--text-secondary]">
            {JSON.stringify(action.dryRunOutput, null, 2)}
          </pre>
        </details>
      )}
      {action.inversePlan.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-[--text-muted]">Inverse plan</summary>
          <ul className="mt-1 space-y-1">
            {action.inversePlan.map((step, idx) => (
              <li key={idx} className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
                <p className="font-mono text-[--text-primary] text-xs">{step.capability}</p>
                <p className="text-xs text-[--text-muted]">{step.notes}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          className="gap-1.5"
          disabled={!canApprove || isPending || action.status !== "proposed"}
          onClick={onApprove}
        >
          <Check className="h-3 w-3" /> Approve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5"
          disabled={!canApprove || isPending || (action.status !== "approved" && action.status !== "dry-run")}
          onClick={onDryRun}
        >
          <Play className="h-3 w-3" /> Dry-run
        </Button>
        <Button
          size="sm"
          variant="primary"
          className="gap-1.5"
          disabled={!canApprove || isPending || (action.status !== "approved" && action.status !== "dry-run")}
          onClick={onCommit}
        >
          <Play className="h-3 w-3" /> Commit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5"
          disabled={!canApprove || isPending || action.status !== "committed" || action.inversePlan.length === 0}
          onClick={onRollback}
        >
          <RotateCcw className="h-3 w-3" /> Rollback
        </Button>
        {action.failureReason && (
          <span className="inline-flex items-center gap-1 text-xs text-[--danger]">
            <X className="h-3 w-3" /> {action.failureReason}
          </span>
        )}
      </div>
    </li>
  );
}
