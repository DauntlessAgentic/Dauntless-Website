"use server";

import { revalidatePath } from "next/cache";

import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";

import {
  installListing as installStore,
  killSwitch as killStore,
  publishListing as publishStore,
  removeInstall as removeStore,
  runEvalForListing as runEvalStore,
  submitListing as submitStore,
} from "./store";

export async function submitListingAction(input: {
  name: string;
  developer: string;
  archetype: "strategist" | "operator" | "auditor" | "chief-of-staff";
  description: string;
  scopeBullets: string[];
  toolSurface: string[];
  models: string[];
  pricePerInstallUsd?: number;
  revenueSharePct?: number;
}): Promise<void> {
  submitStore(input);
  revalidatePath("/portal", "layout");
}

export async function runEvalAction(input: { listingId: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner") {
    throw new Error("Only Dauntless owners can run marketplace evals.");
  }
  runEvalStore(input.listingId);
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "agent-run",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.listingId,
    detail: `${membership.displayName} ran marketplace eval for ${input.listingId}.`,
    riskTier: "low",
  });
  revalidatePath("/portal", "layout");
}

export async function publishAction(input: { listingId: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner") {
    throw new Error("Only Dauntless owners can publish marketplace listings.");
  }
  publishStore(input.listingId);
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "artifact-published",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.listingId,
    detail: `${membership.displayName} published marketplace listing ${input.listingId}.`,
    riskTier: "low",
  });
  revalidatePath("/portal", "layout");
}

export async function installAction(input: { listingId: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error("Only owners + executives can install marketplace listings.");
  }
  installStore({ listingId: input.listingId, workspaceId: ws.id, installedBy: membership.displayName });
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "access-granted",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.listingId,
    detail: `${membership.displayName} installed marketplace listing ${input.listingId}.`,
    riskTier: "medium",
  });
  revalidatePath("/portal", "layout");
}

export async function uninstallAction(input: { installId: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error("Only owners + executives can uninstall marketplace listings.");
  }
  removeStore(input.installId);
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "access-revoked",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.installId,
    detail: `${membership.displayName} removed marketplace install ${input.installId}.`,
    riskTier: "low",
  });
  revalidatePath("/portal", "layout");
}

export async function killSwitchAction(input: { listingId: string; reason: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner") {
    throw new Error("Only Dauntless owners can killswitch marketplace listings.");
  }
  killStore(input.listingId, input.reason);
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "access-revoked",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.listingId,
    detail: `${membership.displayName} killswitched marketplace listing ${input.listingId}: ${input.reason}`,
    riskTier: "high",
  });
  revalidatePath("/portal", "layout");
}
