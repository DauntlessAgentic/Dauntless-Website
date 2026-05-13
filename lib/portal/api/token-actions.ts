"use server";

// ============================================================
// Portal API token server actions (A7 pre-launch)
//
// Owner/executive-gated issuance + revocation of workspace-scoped
// API tokens. Backed by lib/portal/api/tokens.ts (in-memory).
//
// On issuance, the action returns the plaintext token ONCE so the
// UI can render it for the user to copy. Subsequent reads only
// expose the preview + metadata.
// ============================================================

import { revalidatePath } from "next/cache";

import { canPerform } from "@/lib/auth/membership-gate";
import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";

import { issueApiToken, revokeApiToken } from "./tokens";

import type { MembershipRole } from "@/lib/portal/types";

export interface IssueApiTokenActionInput {
  label: string;
  scopeRole: MembershipRole;
}

export interface IssueApiTokenActionResult {
  ok: boolean;
  /** Plaintext token, returned once at issuance. */
  plaintext?: string;
  tokenId?: string;
  preview?: string;
  reason?: string;
}

export async function issueApiTokenAction(
  input: IssueApiTokenActionInput,
): Promise<IssueApiTokenActionResult> {
  const repository = getPortalRepository();
  const workspace = await repository.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);

  if (!canPerform(membership.role, "manage-api-tokens")) {
    return {
      ok: false,
      reason: `Role "${membership.role}" cannot manage API tokens.`,
    };
  }

  const trimmedLabel = input.label.trim();
  if (!trimmedLabel) {
    return { ok: false, reason: "Label is required." };
  }
  if (trimmedLabel.length > 80) {
    return { ok: false, reason: "Label must be 80 characters or fewer." };
  }
  if (!isValidScopeRole(input.scopeRole)) {
    return { ok: false, reason: "Invalid scope role." };
  }

  const { plaintext, record } = issueApiToken({
    workspaceId: workspace.id,
    label: trimmedLabel,
    scopeRole: input.scopeRole,
    issuedBy: membership.displayName,
  });

  await repository.appendAuditEntry({
    workspaceId: workspace.id,
    action: "access-granted",
    actor: membership.displayName,
    actorKind: "human",
    refId: record.id,
    detail: `Issued API token "${record.label}" (scope: ${record.scopeRole})`,
    riskTier: "medium",
  });

  revalidatePath("/portal/api");

  return {
    ok: true,
    plaintext,
    tokenId: record.id,
    preview: record.preview,
  };
}

export interface RevokeApiTokenActionInput {
  tokenId: string;
}

export interface RevokeApiTokenActionResult {
  ok: boolean;
  reason?: string;
}

export async function revokeApiTokenAction(
  input: RevokeApiTokenActionInput,
): Promise<RevokeApiTokenActionResult> {
  const repository = getPortalRepository();
  const workspace = await repository.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);

  if (!canPerform(membership.role, "manage-api-tokens")) {
    return {
      ok: false,
      reason: `Role "${membership.role}" cannot manage API tokens.`,
    };
  }

  const ok = revokeApiToken(input.tokenId);
  if (!ok) {
    return { ok: false, reason: "Token not found or already revoked." };
  }

  await repository.appendAuditEntry({
    workspaceId: workspace.id,
    action: "access-revoked",
    actor: membership.displayName,
    actorKind: "human",
    refId: input.tokenId,
    detail: "Revoked API token",
    riskTier: "medium",
  });

  revalidatePath("/portal/api");

  return { ok: true };
}

function isValidScopeRole(value: unknown): value is MembershipRole {
  return (
    value === "owner" ||
    value === "executive" ||
    value === "lead" ||
    value === "viewer" ||
    value === "auditor"
  );
}
