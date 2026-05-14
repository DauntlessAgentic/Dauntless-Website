// ============================================================
// Decision comments (Advisory action #24)
//
// Lightweight in-process comment thread per decision. Surfaces a
// "comment to a human" affordance with equal visual weight to
// "run agent" buttons — Lena's request. Phase 7.2 will persist.
// ============================================================

import { emitPortalEvent } from "@/lib/portal/telemetry/event-bus";

export interface DecisionComment {
  id: string;
  decisionId: string;
  workspaceId: string;
  engagementId?: string;
  author: string;
  authorKind: "human" | "agent";
  body: string;
  postedAt: Date;
}

const comments: DecisionComment[] = [];
let counter = 0;

export function listDecisionComments(decisionId: string): DecisionComment[] {
  return comments
    .filter((c) => c.decisionId === decisionId)
    .slice()
    .sort((a, b) => a.postedAt.getTime() - b.postedAt.getTime());
}

export function addDecisionComment(input: {
  decisionId: string;
  workspaceId: string;
  engagementId?: string;
  author: string;
  authorKind: "human" | "agent";
  body: string;
}): DecisionComment {
  counter += 1;
  const comment: DecisionComment = {
    id: `dcm-${Date.now().toString(36)}-${counter.toString(36)}`,
    decisionId: input.decisionId,
    workspaceId: input.workspaceId,
    engagementId: input.engagementId,
    author: input.author,
    authorKind: input.authorKind,
    body: input.body.trim().slice(0, 4000),
    postedAt: new Date(),
  };
  comments.push(comment);
  emitPortalEvent({
    kind: "comment-posted",
    workspaceId: input.workspaceId,
    engagementId: input.engagementId ?? "",
    actor: input.author,
    actorKind: input.authorKind,
    artifactId: input.decisionId,
    resolved: false,
  });
  return comment;
}

/** Test-only escape hatch. */
export function __resetDecisionComments(): void {
  comments.length = 0;
  counter = 0;
}
