"use server";

import { revalidatePath } from "next/cache";

import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";
import type { ScheduleItemKind, ScheduleItemStatus } from "@/lib/portal/types";

export async function proposeScheduleItem(input: {
  engagementId?: string;
  kind: ScheduleItemKind;
  title: string;
  startsAt: string; // ISO; Server actions only serialize primitives
  durationMins: number;
  attendees: string[];
  linkedDecisionId?: string;
  linkedArtifactId?: string;
  notes?: string;
}): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (membership.role !== "owner" && membership.role !== "executive" && membership.role !== "lead") {
    throw new Error(`Role "${membership.role}" cannot propose schedule items.`);
  }
  await repo.proposeScheduleItem({
    workspaceId: workspace.id,
    engagementId: input.engagementId,
    kind: input.kind,
    title: input.title,
    startsAt: new Date(input.startsAt),
    durationMins: input.durationMins,
    attendees: input.attendees,
    linkedDecisionId: input.linkedDecisionId,
    linkedArtifactId: input.linkedArtifactId,
    notes: input.notes,
    proposedBy: membership.displayName,
    proposedByKind: "human",
  });
  revalidatePath("/portal", "layout");
}

export async function updateScheduleItemStatus(input: {
  scheduleItemId: string;
  status: ScheduleItemStatus;
}): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  await repo.updateScheduleItemStatus({
    workspaceId: workspace.id,
    scheduleItemId: input.scheduleItemId,
    status: input.status,
    actor: membership.displayName,
    actorKind: "human",
  });
  revalidatePath("/portal", "layout");
}
