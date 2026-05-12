"use server";

import { revalidatePath } from "next/cache";

import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";

import {
  proposeFineTune as proposeStore,
  rollbackVariant as rollbackStore,
  routeToVariant as routeStore,
} from "./store";

export async function proposeFineTune(input: {
  baseModel: string;
  label: string;
  description: string;
  sourceArtifactIds: string[];
  dataResidency: "ca" | "us" | "eu";
}): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot propose fine-tunes.`);
  }
  proposeStore(ws.id, input);
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "agent-run",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.label,
    detail: `${membership.displayName} proposed fine-tune "${input.label}" over ${input.sourceArtifactIds.length} artifacts.`,
    riskTier: "medium",
  });
  revalidatePath("/portal", "layout");
}

export async function routeToVariant(input: { variantId: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot route model variants.`);
  }
  routeStore(ws.id, input.variantId);
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "agent-run",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.variantId,
    detail: `${membership.displayName} routed workspace agents to model variant ${input.variantId}.`,
    riskTier: "medium",
  });
  revalidatePath("/portal", "layout");
}

export async function rollbackVariant(input: { variantId: string; reason?: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot rollback model variants.`);
  }
  rollbackStore(ws.id, { variantId: input.variantId, reason: input.reason });
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "decision-rejected",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.variantId,
    detail: `${membership.displayName} rolled back variant ${input.variantId}. ${input.reason ?? ""}`.trim(),
    riskTier: "medium",
  });
  revalidatePath("/portal", "layout");
}
