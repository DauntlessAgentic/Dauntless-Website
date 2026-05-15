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

/**
 * Resolve the active member AND enforce the role gate. Per audit-2 §H1
 * the freeze switch is reserved for owner / executive / lead — never
 * viewer or auditor, who are read-only by intent. The check belongs
 * here (server boundary) so a malicious client can't bypass it.
 */
function requireFreezeAuthorizedMember(
  membership: Awaited<ReturnType<typeof loadPortalContext>>["membership"],
): string {
  const isAuthed =
    (membership.status === "member" || membership.status === "dev-bypass") &&
    membership.membership;
  if (!isAuthed) {
    throw new Error("Sign in to freeze or unfreeze a workspace.");
  }
  const role = membership.membership!.role;
  if (role !== "owner" && role !== "executive" && role !== "lead") {
    throw new Error(
      `Role "${role}" cannot freeze or unfreeze this workspace. Ask a workspace owner.`,
    );
  }
  return `${membership.membership!.userName} (${role})`;
}

export async function freezeWorkspaceAction(reason: string): Promise<{
  frozen: true;
  frozenBy: string;
  frozenAt: string;
  reason: string;
}> {
  const { snapshot, membership } = await loadPortalContext();
  const actor = requireFreezeAuthorizedMember(membership);
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
  const actor = requireFreezeAuthorizedMember(membership);
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
