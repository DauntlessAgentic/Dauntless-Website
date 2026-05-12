"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, X, CalendarPlus } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";

import type { MembershipContext } from "@/lib/auth/session";
import type {
  Artifact,
  Decision,
  Engagement,
  ScheduleItem,
  ScheduleItemKind,
  ScheduleItemStatus,
} from "@/lib/portal/types";
import {
  proposeScheduleItem,
  updateScheduleItemStatus,
} from "@/lib/portal/schedule-actions";

interface ScheduleViewProps {
  upcoming: ScheduleItem[];
  past: ScheduleItem[];
  engagements: Engagement[];
  artifacts: Artifact[];
  decisions: Decision[];
  membership: MembershipContext;
}

const KIND_TONE: Record<ScheduleItemKind, React.ComponentProps<typeof ContentTag>["variant"]> = {
  booking: "info",
  walkthrough: "accent",
  steerco: "warning",
  review: "success",
  checkpoint: "default",
};

const STATUS_TONE: Record<ScheduleItemStatus, React.ComponentProps<typeof ContentTag>["variant"]> = {
  scheduled: "success",
  tentative: "info",
  completed: "default",
  cancelled: "warning",
};

export function ScheduleView({
  upcoming,
  past,
  engagements,
  artifacts: _artifacts,
  decisions: _decisions,
  membership,
}: ScheduleViewProps) {
  const canPropose =
    membership.role === "owner" || membership.role === "executive" || membership.role === "lead";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ScheduleItemKind>("walkthrough");
  const [engagementId, setEngagementId] = useState<string>(engagements[0]?.id ?? "");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 16);
  });
  const [durationMins, setDurationMins] = useState(45);
  const [attendees, setAttendees] = useState("");
  const [notes, setNotes] = useState("");

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPropose) return;
    setError(null);
    startTransition(async () => {
      try {
        await proposeScheduleItem({
          engagementId: engagementId || undefined,
          kind,
          title,
          startsAt: new Date(date).toISOString(),
          durationMins,
          attendees: attendees
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
          notes: notes.trim() || undefined,
        });
        setTitle("");
        setNotes("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Propose failed.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Schedule"
        title="Engagement touchpoints, bookings, and SteerCo prep"
        description="Phase 5.1 port of the CAIA calendar concept. Every item links back to an engagement, artifact, or decision; every status change is audited."
        badge={`${upcoming.length} upcoming`}
        badgeVariant="accent"
        actions={
          <Link
            href="/portal"
            className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
          >
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="schedule-upcoming"
          eyebrow="UPCOMING"
          title="Next touchpoints"
          subtitle="Ordered by start time. Confirm or cancel to record an outcome."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[420px]">
            {upcoming.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                Nothing upcoming. Propose a touchpoint below.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {upcoming.map((item) => (
                  <ScheduleRow
                    key={item.id}
                    item={item}
                    canMutate={canPropose}
                    isPending={isPending}
                    onUpdate={(status) =>
                      startTransition(async () => {
                        try {
                          await updateScheduleItemStatus({ scheduleItemId: item.id, status });
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Update failed.");
                        }
                      })
                    }
                  />
                ))}
              </ul>
            )}
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="schedule-propose"
          eyebrow="PROPOSE"
          title={canPropose ? "Add a new touchpoint" : "Propose new touchpoint (read-only)"}
          subtitle={
            canPropose
              ? "Tentative by default. Confirms emit a signal so the Command Center surfaces the new item."
              : `Your role (${membership.role}) cannot propose schedule items.`
          }
        >
          <form onSubmit={handlePropose} className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
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
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Kind</span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as ScheduleItemKind)}
                disabled={!canPropose || isPending}
                className="h-8 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5"
              >
                <option value="walkthrough">walkthrough</option>
                <option value="steerco">steerco</option>
                <option value="review">review</option>
                <option value="checkpoint">checkpoint</option>
                <option value="booking">booking</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Start</span>
              <Input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!canPropose || isPending}
                className="h-8 text-xs"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Duration (mins)</span>
              <Input
                type="number"
                min={15}
                max={240}
                step={15}
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
                disabled={!canPropose || isPending}
                className="h-8 text-xs"
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Attendees (comma-separated)</span>
              <Input
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                disabled={!canPropose || isPending}
                className="h-8 text-xs"
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="uppercase tracking-widest text-[--text-muted]">Notes</span>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!canPropose || isPending}
                className="min-h-[60px] text-xs"
              />
            </label>
            <div className="md:col-span-2 flex items-center gap-2">
              <Button type="submit" size="sm" variant="primary" disabled={!canPropose || isPending || !title.trim()} className="gap-1.5">
                <CalendarPlus className="h-3 w-3" />
                {isPending ? "Proposing…" : "Propose"}
              </Button>
              {error && <p className="text-xs text-[--danger]">{error}</p>}
            </div>
          </form>
        </DashboardCard>

        <DashboardCard
          id="schedule-past"
          eyebrow="HISTORY"
          title="Past + cancelled"
          subtitle="Read-only. Outcomes carry into the audit log + Decision Register."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[320px]">
            {past.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                No past touchpoints yet.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {past.map((item) => (
                  <ScheduleRow key={item.id} item={item} canMutate={false} isPending={false} onUpdate={() => undefined} />
                ))}
              </ul>
            )}
          </ScrollArea>
        </DashboardCard>
      </div>
    </div>
  );
}

function ScheduleRow({
  item,
  canMutate,
  isPending,
  onUpdate,
}: {
  item: ScheduleItem;
  canMutate: boolean;
  isPending: boolean;
  onUpdate: (status: ScheduleItemStatus) => void;
}) {
  const dayLabel = item.startsAt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = item.startsAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return (
    <li className="flex flex-col gap-1 px-3 py-2">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
        <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{item.title}</p>
        <ContentTag variant={KIND_TONE[item.kind]} dot>
          {item.kind}
        </ContentTag>
        <ContentTag variant={STATUS_TONE[item.status]}>{item.status}</ContentTag>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[--text-muted]">
        <span className="font-mono tabular-nums">{dayLabel} · {timeLabel}</span>
        <span className="font-mono tabular-nums">{item.durationMins}m</span>
        <span>{item.attendees.length} attendee{item.attendees.length === 1 ? "" : "s"}</span>
        {item.linkedArtifactId && (
          <Link href={`/portal/deliverables/${item.linkedArtifactId}`} className="text-[--accent-vivid] hover:underline">
            artifact ↗
          </Link>
        )}
        {item.linkedDecisionId && (
          <Link href={`/portal/decisions?focus=${item.linkedDecisionId}`} className="text-[--accent-vivid] hover:underline">
            decision ↗
          </Link>
        )}
      </div>
      {item.notes && <p className="text-xs text-[--text-secondary] leading-snug">{item.notes}</p>}
      {canMutate && (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            disabled={isPending || item.status === "scheduled"}
            onClick={() => onUpdate("scheduled")}
          >
            <Check className="h-3 w-3" /> Confirm
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            disabled={isPending || item.status === "completed"}
            onClick={() => onUpdate("completed")}
          >
            Mark complete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            disabled={isPending || item.status === "cancelled"}
            onClick={() => onUpdate("cancelled")}
          >
            <X className="h-3 w-3" /> Cancel
          </Button>
        </div>
      )}
    </li>
  );
}
