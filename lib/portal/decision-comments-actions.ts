"use server";

import { revalidatePath } from "next/cache";

import { loadPortalContext } from "@/lib/portal/server";
import { addDecisionComment, listDecisionComments, type DecisionComment } from "./decision-comments";
import { getPortalRepository } from "./repositories";

function requireMember(
  membership: Awaited<ReturnType<typeof loadPortalContext>>["membership"],
): string {
  if (
    (membership.status === "member" || membership.status === "dev-bypass") &&
    membership.membership
  ) {
    return `${membership.membership.userName}`;
  }
  throw new Error("Sign in to comment.");
}

export async function postDecisionComment(input: {
  decisionId: string;
  body: string;
}): Promise<DecisionComment> {
  if (!input.body || input.body.trim().length === 0) {
    throw new Error("Comment cannot be empty.");
  }
  const { snapshot, membership } = await loadPortalContext();
  const author = requireMember(membership);
  const repo = getPortalRepository();
  const decisions = await repo.listDecisions(snapshot.workspace.id);
  const decision = decisions.find((d) => d.id === input.decisionId);
  if (!decision) throw new Error(`Decision not found: ${input.decisionId}`);
  const comment = addDecisionComment({
    decisionId: decision.id,
    workspaceId: snapshot.workspace.id,
    engagementId: decision.engagementId,
    author,
    authorKind: "human",
    body: input.body,
  });
  await repo.appendAuditEntry({
    workspaceId: snapshot.workspace.id,
    action: "agent-run",
    actor: author,
    actorKind: "human",
    refId: decision.id,
    detail: `${author} commented on decision "${decision.title}".`,
    riskTier: "low",
  });
  revalidatePath("/portal/decisions", "layout");
  return comment;
}

export async function getDecisionComments(decisionId: string): Promise<DecisionComment[]> {
  return listDecisionComments(decisionId);
}
