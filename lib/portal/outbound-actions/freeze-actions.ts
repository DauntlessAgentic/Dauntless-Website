"use server";

// ============================================================
// Server actions for the workspace freeze switch.
// Surfaced on /portal/help/something-went-wrong.
// ============================================================

import { loadPortalContext } from "@/lib/portal/server";
import {
  freezeWorkspace,
  unfreezeWorkspace,
  isWorkspaceFrozen,
} from "./freeze";

function requireMember(
  membership: Awaited<ReturnType<typeof loadPortalContext>>["membership"],
): string {
  if (
    (membership.status === "member" || membership.status === "dev-bypass") &&
    membership.membership
  ) {
    return `${membership.membership.userName} (${membership.membership.role})`;
  }
  throw new Error("Sign in to freeze or unfreeze a workspace.");
}

export async function freezeWorkspaceAction(reason: string): Promise<{
  frozen: true;
  frozenBy: string;
  frozenAt: string;
  reason: string;
}> {
  const { snapshot, membership } = await loadPortalContext();
  const actor = requireMember(membership);
  const record = await freezeWorkspace({
    workspaceId: snapshot.workspace.id,
    actor,
    reason: reason || "No reason given.",
  });
  return {
    frozen: true,
    frozenBy: record.frozenBy,
    frozenAt: record.frozenAt.toISOString(),
    reason: record.reason,
  };
}

export async function unfreezeWorkspaceAction(): Promise<{ frozen: false }> {
  const { snapshot, membership } = await loadPortalContext();
  const actor = requireMember(membership);
  await unfreezeWorkspace({ workspaceId: snapshot.workspace.id, actor });
  return { frozen: false };
}

export async function getWorkspaceFreezeStatus(): Promise<
  | { frozen: true; frozenBy: string; frozenAt: string; reason: string }
  | { frozen: false }
> {
  const { snapshot } = await loadPortalContext();
  const record = isWorkspaceFrozen(snapshot.workspace.id);
  if (!record) return { frozen: false };
  return {
    frozen: true,
    frozenBy: record.frozenBy,
    frozenAt: record.frozenAt.toISOString(),
    reason: record.reason,
  };
}
