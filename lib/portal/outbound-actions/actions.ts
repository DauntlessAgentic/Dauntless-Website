"use server";

// ============================================================
// Outbound action server actions (Phase 11.0)
// ============================================================

import { revalidatePath } from "next/cache";

import { canPerform } from "@/lib/auth/membership-gate";
import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";

import {
  approveOutboundAction as approveStore,
  commitOutboundAction as commitStore,
  proposeOutboundAction as proposeStore,
  rollbackOutboundAction as rollbackStore,
} from "./store";
import type {
  ConnectorId,
  OutboundActionRiskTier,
} from "./types";

export async function proposeOutboundActionAction(input: {
  connectorId: ConnectorId;
  capabilityId: string;
  title: string;
  description: string;
  riskTier?: OutboundActionRiskTier;
  engagementId?: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (!canPerform(membership.role, "approve-decision") && membership.role !== "lead") {
    throw new Error(`Role "${membership.role}" cannot propose outbound actions.`);
  }
  await proposeStore({
    workspaceId: workspace.id,
    engagementId: input.engagementId,
    connectorId: input.connectorId,
    capabilityId: input.capabilityId,
    title: input.title,
    description: input.description,
    riskTier: input.riskTier,
    proposedBy: membership.displayName,
    proposedByKind: "human",
    payload: input.payload,
  });
  revalidatePath("/portal", "layout");
}

export async function approveOutboundActionAction(input: { actionId: string }): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot approve outbound actions.`);
  }
  await approveStore({
    workspaceId: workspace.id,
    actionId: input.actionId,
    actor: membership.displayName,
    actorKind: "human",
  });
  revalidatePath("/portal", "layout");
}

export async function commitOutboundActionAction(input: { actionId: string; dryRunOnly?: boolean }): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot commit outbound actions.`);
  }
  await commitStore({
    workspaceId: workspace.id,
    actionId: input.actionId,
    actor: membership.displayName,
    actorKind: "human",
    dryRunOnly: input.dryRunOnly,
  });
  revalidatePath("/portal", "layout");
}

export async function rollbackOutboundActionAction(input: { actionId: string; reason?: string }): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot rollback outbound actions.`);
  }
  await rollbackStore({
    workspaceId: workspace.id,
    actionId: input.actionId,
    actor: membership.displayName,
    reason: input.reason,
  });
  revalidatePath("/portal", "layout");
}
