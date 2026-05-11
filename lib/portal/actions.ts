"use server";

// ============================================================
// Portal mutation server actions (Phase 2)
//
// All mutations route through here so we have a single audit
// boundary. Each action:
//   1. Resolves the current membership.
//   2. Checks the membership-gate.
//   3. Delegates to the repository (which appends an audit entry).
//   4. Calls revalidatePath so server components re-fetch.
// ============================================================

import { revalidatePath } from "next/cache";

import { canPerform } from "@/lib/auth/membership-gate";
import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";

interface DecisionActionInput {
  decisionId: string;
  notes?: string;
}

async function decideDecision(
  input: DecisionActionInput,
  outcome: "approved" | "deferred" | "rejected",
) {
  const repository = getPortalRepository();
  const workspace = await repository.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  const action =
    outcome === "approved"
      ? ("approve-decision" as const)
      : outcome === "deferred"
        ? ("defer-decision" as const)
        : ("reject-decision" as const);
  if (!canPerform(membership.role, action)) {
    throw new Error(
      `Role "${membership.role}" cannot ${outcome === "approved" ? "approve" : outcome} decisions in this workspace.`,
    );
  }
  await repository.recordDecisionOutcome({
    decisionId: input.decisionId,
    workspaceId: workspace.id,
    actor: membership.displayName,
    actorKind: "human",
    outcome,
    notes: input.notes,
  });
  revalidatePath("/portal", "layout");
}

export async function approveDecision(input: DecisionActionInput): Promise<void> {
  await decideDecision(input, "approved");
}
export async function deferDecision(input: DecisionActionInput): Promise<void> {
  await decideDecision(input, "deferred");
}
export async function rejectDecision(input: DecisionActionInput): Promise<void> {
  await decideDecision(input, "rejected");
}

export async function promoteKnowledge(input: {
  knowledgeId: string;
  notes?: string;
}): Promise<void> {
  const repository = getPortalRepository();
  const workspace = await repository.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (!canPerform(membership.role, "promote-knowledge")) {
    throw new Error(
      `Role "${membership.role}" cannot promote knowledge in this workspace.`,
    );
  }
  await repository.promoteKnowledgeToCanonical({
    knowledgeId: input.knowledgeId,
    workspaceId: workspace.id,
    actor: membership.displayName,
    actorKind: "human",
    promotionNotes: input.notes,
  });
  revalidatePath("/portal", "layout");
}
