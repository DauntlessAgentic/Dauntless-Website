"use server";

// ============================================================
// Artifact editor + canonical promotion actions (Phase 4.1)
//
// Every write path through the artifact editor lands here. The
// "Propose for canonical" path runs the Governance Auditor agent
// inline so the verdict is visible before a human's approval gate.
// ============================================================

import { revalidatePath } from "next/cache";

import { canPerform } from "@/lib/auth/membership-gate";
import { getCurrentMembership } from "@/lib/auth/session";
import { invalidateKnowledgeIndex } from "@/lib/portal/knowledge";
import { getPortalRepository } from "@/lib/portal/repositories";
import { runAgent } from "@/lib/portal/agents/runner";

export interface SaveArtifactBodyActionInput {
  artifactId: string;
  body: string;
  /** When true, an edit on an `approved` artifact drops it back to `in-review`. */
  reopenForReview?: boolean;
}

export async function saveArtifactBody(input: SaveArtifactBodyActionInput): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (!canPerform(membership.role, "edit-artifact")) {
    throw new Error(`Role "${membership.role}" cannot edit artifacts in this workspace.`);
  }
  await repo.saveArtifactBody({
    workspaceId: workspace.id,
    artifactId: input.artifactId,
    body: input.body,
    actor: membership.displayName,
    actorKind: "human",
    reopenForReview: input.reopenForReview,
  });
  invalidateKnowledgeIndex(workspace.id);
  revalidatePath("/portal", "layout");
}

export interface ProposeForCanonicalActionInput {
  artifactId: string;
}

export interface CanonicalProposalOutcome {
  status: "audited" | "audit-skipped";
  verdict?: "pass" | "needs-revision" | "fail";
  notes?: string;
  toolCalls: Array<{ tool: string; isError: boolean }>;
}

/**
 * Propose for canonical + run the Governance Auditor inline. The auditor
 * verdict lands on the proposal. The human "Approve" gate stays — even a
 * "pass" verdict needs an explicit click.
 */
export async function proposeForCanonical(input: ProposeForCanonicalActionInput): Promise<CanonicalProposalOutcome> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (!canPerform(membership.role, "promote-knowledge")) {
    throw new Error(`Role "${membership.role}" cannot propose canonical artifacts.`);
  }
  await repo.proposeArtifactForCanonical({
    workspaceId: workspace.id,
    artifactId: input.artifactId,
    proposedBy: membership.displayName,
    proposedByKind: "human",
  });

  // Run the Governance Auditor inline. Use stub mode if no API key.
  const run = await runAgent({
    agentId: "agent-governance-auditor",
    prompt: `A canonical-promotion proposal has just been filed for artifact ${input.artifactId}. Audit the evidence chain and the linked knowledge for freshness. Return a verdict.`,
  });

  // Parse the most recent audit_evidence_completeness output for the verdict.
  const auditCall = run.toolCalls.find((t) => t.toolName === "audit_evidence_completeness");
  if (!auditCall || auditCall.isError) {
    return {
      status: "audit-skipped",
      toolCalls: run.toolCalls.map((t) => ({ tool: t.toolName, isError: t.isError })),
    };
  }
  let verdict: "pass" | "needs-revision" | "fail" = "needs-revision";
  let notes = run.summary;
  try {
    const parsed = JSON.parse(auditCall.output);
    if (parsed.verdict === "pass" || parsed.verdict === "fail" || parsed.verdict === "needs-revision") {
      verdict = parsed.verdict;
    }
    notes = `verdict=${verdict}; cited=${(parsed.cited ?? []).length}; missing=${(parsed.missingIds ?? []).length}.`;
  } catch {
    // fallthrough — keep the default verdict + summary
  }

  await repo.recordCanonicalAuditVerdict({
    workspaceId: workspace.id,
    artifactId: input.artifactId,
    verdict,
    notes,
    auditedBy: "agent-governance-auditor",
  });

  invalidateKnowledgeIndex(workspace.id);
  revalidatePath("/portal", "layout");

  return {
    status: "audited",
    verdict,
    notes,
    toolCalls: run.toolCalls.map((t) => ({ tool: t.toolName, isError: t.isError })),
  };
}

export interface DecideCanonicalActionInput {
  artifactId: string;
  reason?: string;
}

export async function approveCanonical(input: DecideCanonicalActionInput): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot approve canonical promotions.`);
  }
  await repo.approveCanonicalProposal({
    workspaceId: workspace.id,
    artifactId: input.artifactId,
    actor: membership.displayName,
    actorKind: "human",
  });
  invalidateKnowledgeIndex(workspace.id);
  revalidatePath("/portal", "layout");
}

export async function rejectCanonical(input: DecideCanonicalActionInput): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (membership.role !== "owner" && membership.role !== "executive") {
    throw new Error(`Role "${membership.role}" cannot reject canonical proposals.`);
  }
  await repo.rejectCanonicalProposal({
    workspaceId: workspace.id,
    artifactId: input.artifactId,
    actor: membership.displayName,
    actorKind: "human",
    reason: input.reason,
  });
  invalidateKnowledgeIndex(workspace.id);
  revalidatePath("/portal", "layout");
}

export interface MintVersionActionInput {
  artifactId: string;
  versionBump: "major" | "minor" | "patch";
  summary: string;
  body: string;
}

export async function mintArtifactVersion(input: MintVersionActionInput): Promise<{ versionId: string; version: string }> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  if (!canPerform(membership.role, "edit-artifact")) {
    throw new Error(`Role "${membership.role}" cannot edit artifacts in this workspace.`);
  }
  const result = await repo.draftArtifactVersion({
    workspaceId: workspace.id,
    artifactId: input.artifactId,
    versionBump: input.versionBump,
    summary: input.summary,
    body: input.body,
    actor: membership.displayName,
    actorKind: "human",
  });
  invalidateKnowledgeIndex(workspace.id);
  revalidatePath("/portal", "layout");
  return { versionId: result.id, version: result.version };
}

export interface PostCommentActionInput {
  artifactId: string;
  versionId: string;
  body: string;
}

export async function postArtifactComment(input: PostCommentActionInput): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  await repo.postArtifactComment({
    workspaceId: workspace.id,
    artifactId: input.artifactId,
    versionId: input.versionId,
    body: input.body,
    author: membership.displayName,
    authorKind: "human",
  });
  revalidatePath("/portal", "layout");
}

export async function resolveArtifactComment(input: { artifactId: string; commentId: string }): Promise<void> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  await repo.resolveArtifactComment({
    workspaceId: workspace.id,
    artifactId: input.artifactId,
    commentId: input.commentId,
    actor: membership.displayName,
  });
  revalidatePath("/portal", "layout");
}
