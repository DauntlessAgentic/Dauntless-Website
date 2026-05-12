"use server";

import { revalidatePath } from "next/cache";

import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";

import {
  contributeArtifact,
  joinFederation as joinStore,
  leaveFederation as leaveStore,
  withdrawContribution as withdrawStore,
} from "./index";

export async function joinFederation(input: { federationId: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot join federations.`);
  }
  joinStore(ws.id, input.federationId);
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "access-granted",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.federationId,
    detail: `${membership.displayName} joined federation ${input.federationId}.`,
    riskTier: "medium",
  });
  revalidatePath("/portal", "layout");
}

export async function leaveFederation(input: { federationId: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot leave federations.`);
  }
  leaveStore(ws.id, input.federationId);
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "access-revoked",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.federationId,
    detail: `${membership.displayName} withdrew workspace from federation ${input.federationId}.`,
    riskTier: "medium",
  });
  revalidatePath("/portal", "layout");
}

export async function contributeArtifactToFederation(input: {
  federationId: string;
  artifactId: string;
  anonymizationLevel: "light" | "standard" | "strict";
}): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot contribute artifacts to federations.`);
  }
  const artifacts = await repo.listArtifacts(ws.id);
  const artifact = artifacts.find((a) => a.id === input.artifactId);
  if (!artifact) throw new Error(`Artifact not found: ${input.artifactId}`);
  contributeArtifact(
    {
      workspaceId: ws.id,
      federationId: input.federationId,
      artifactId: input.artifactId,
      contributedBy: membership.displayName,
      anonymizationLevel: input.anonymizationLevel,
    },
    artifact,
  );
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "evidence-exported",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.artifactId,
    detail: `Contributed ${artifact.name} to federation ${input.federationId} (${input.anonymizationLevel}).`,
    riskTier: input.anonymizationLevel === "strict" ? "low" : input.anonymizationLevel === "standard" ? "medium" : "high",
  });
  revalidatePath("/portal", "layout");
}

export async function withdrawFederationContribution(input: { contributionId: string }): Promise<void> {
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(ws.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot withdraw contributions.`);
  }
  withdrawStore(input.contributionId, membership.displayName);
  await repo.appendAuditEntry({
    workspaceId: ws.id,
    action: "access-revoked",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.contributionId,
    detail: `${membership.displayName} withdrew federation contribution ${input.contributionId}.`,
    riskTier: "low",
  });
  revalidatePath("/portal", "layout");
}
