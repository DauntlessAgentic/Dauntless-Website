"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { AlertOctagon, ChevronLeft, ShieldAlert, ShieldCheck } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  freezeWorkspaceAction,
  unfreezeWorkspaceAction,
} from "@/lib/portal/outbound-actions/freeze-actions";

type Status =
  | { frozen: true; frozenBy: string; frozenAt: string; reason: string }
  | { frozen: false };

interface Props {
  initialStatus: Status;
}

export function SomethingWentWrongView({ initialStatus }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFreeze = () => {
    setError(null);
    startTransition(async () => {
      try {
        const next = await freezeWorkspaceAction(reason || "Workspace owner pressed the safety switch.");
        setStatus(next);
        setReason("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Freeze failed.");
      }
    });
  };

  const handleUnfreeze = () => {
    setError(null);
    startTransition(async () => {
      try {
        const next = await unfreezeWorkspaceAction();
        setStatus(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unfreeze failed.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Portal help"
        title="Something feels wrong — here's what to do"
        description="One big button to stop all outbound actions in this workspace while you investigate. Nothing technical to learn first."
        badge={status.frozen ? "Frozen" : "Live"}
        badgeVariant={status.frozen ? "warning" : "success"}
        actions={
          <Link
            href="/portal/help"
            className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" /> Help
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="freeze-switch"
          eyebrow="SAFETY SWITCH"
          title={status.frozen ? "Outbound actions are frozen" : "Freeze all outbound actions"}
          subtitle={
            status.frozen
              ? "While frozen, no agent or human can commit an outbound action in this workspace. Approvals can still happen — they just cannot execute. Lift the freeze when you are ready."
              : "Use this if you see an agent doing something you did not expect, or if you want to pause everything while you investigate. Reversible at any time."
          }
          badge={status.frozen ? "ACTIVE" : "Ready"}
          badgeVariant={status.frozen ? "warning" : "default"}
        >
          <div className="px-3 py-3 flex flex-col gap-3">
            {status.frozen ? (
              <>
                <div className="rounded-[--radius-md] border border-[color:rgba(245,158,11,0.4)] bg-[--warning-dim] px-3 py-2.5 text-xs text-[--warning] leading-snug">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" /> Workspace frozen by {status.frozenBy}
                  </p>
                  <p className="mt-1 text-[--text-secondary]">
                    At {new Date(status.frozenAt).toLocaleString()}. Reason: <span className="italic">{status.reason}</span>
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="gap-1.5 self-start"
                  disabled={isPending}
                  onClick={handleUnfreeze}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isPending ? "Lifting…" : "Lift the freeze"}
                </Button>
              </>
            ) : (
              <>
                <label className="text-xs text-[--text-secondary] flex flex-col gap-1.5">
                  <span className="font-semibold text-[--text-primary]">
                    (Optional) What's going on?
                  </span>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="A bot just sent an email I did not expect."
                    rows={2}
                  />
                  <span className="text-[--text-muted] italic">
                    This shows up in the audit log so anyone reviewing later knows why the workspace was frozen.
                  </span>
                </label>
                <Button
                  variant="destructive"
                  size="md"
                  className="gap-1.5 self-start"
                  disabled={isPending}
                  onClick={handleFreeze}
                >
                  <AlertOctagon className="h-4 w-4" />
                  {isPending ? "Freezing…" : "Freeze all outbound actions"}
                </Button>
              </>
            )}
            {error && <p className="text-xs text-[--danger]">{error}</p>}
          </div>
        </DashboardCard>

        <DashboardCard
          id="next-steps"
          eyebrow="WHAT ELSE"
          title="After you press the button"
          subtitle="Plain checklist. Do these in order."
        >
          <ol className="px-3 py-3 flex flex-col gap-2 text-xs text-[--text-secondary] list-decimal pl-8">
            <li>
              <span className="font-semibold text-[--text-primary]">Take a screenshot.</span>{" "}
              Capture what you saw that worried you. The audit log records it too, but a screenshot is for you.
            </li>
            <li>
              <span className="font-semibold text-[--text-primary]">Open the audit log.</span>{" "}
              On <Link href="/portal/governance" className="text-[--accent-vivid] hover:underline">/portal/governance</Link>,
              find the entries from the last few hours. Anything labelled "agent" did not need your approval —
              flag it if it shouldn't have happened.
            </li>
            <li>
              <span className="font-semibold text-[--text-primary]">Tell a human teammate.</span>{" "}
              Workspace owners get notified automatically, but a Slack message is faster.
            </li>
            <li>
              <span className="font-semibold text-[--text-primary]">When ready, lift the freeze.</span>{" "}
              Approved actions queued during the freeze will only execute after you lift it. There is no time pressure.
            </li>
          </ol>
        </DashboardCard>

        <DashboardCard
          id="what-it-does-not-do"
          eyebrow="LIMITS"
          title="What the freeze does and does not do"
          subtitle="So you know exactly what to expect."
        >
          <div className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] p-2.5">
              <p className="font-semibold text-[--success] mb-1">It DOES stop:</p>
              <ul className="list-disc pl-4 text-[--text-secondary] leading-snug">
                <li>Any outbound action commit (Jira, HubSpot, Slack, etc.)</li>
                <li>Dry-runs of outbound actions</li>
                <li>Agents executing connectors on your behalf</li>
              </ul>
            </div>
            <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] p-2.5">
              <p className="font-semibold text-[--text-muted] mb-1">It does NOT stop:</p>
              <ul className="list-disc pl-4 text-[--text-secondary] leading-snug">
                <li>Reading or proposing — agents can still draft</li>
                <li>Edits to artifacts inside the portal</li>
                <li>Conversations with agents (they just can't act)</li>
              </ul>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
