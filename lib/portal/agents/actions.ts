"use server";

// ============================================================
// Agent server actions (Phase 3)
//
// Single entry point for the UI to trigger the Engagement
// Analyst. Returns a serializable payload that the client
// surface can render directly.
// ============================================================

import { revalidatePath } from "next/cache";

import { canPerform } from "@/lib/auth/membership-gate";
import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";

import {
  runEngagementAnalyst,
  type EngagementAnalystRunInput,
} from "./engagement-analyst";

export interface AgentRunSummary {
  status: "completed" | "errored" | "stub";
  decisionId?: string;
  summary: string;
  model: string;
  /** Pretty-printed cost (e.g. "$0.0042"). */
  costUsd: string;
  cacheHitRate: number;
  inputTokens: number;
  outputTokens: number;
  toolCalls: Array<{ tool: string; isError: boolean }>;
}

export async function runEngagementAnalystAction(
  input: EngagementAnalystRunInput,
): Promise<AgentRunSummary> {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  // Treat triggering an agent run as a write — propose-decision is the side effect.
  if (!canPerform(membership.role, "approve-decision") && membership.role !== "lead") {
    throw new Error(
      `Role "${membership.role}" cannot trigger agent runs. Owner / executive / lead only.`,
    );
  }
  const result = await runEngagementAnalyst(input);
  revalidatePath("/portal", "layout");
  return {
    status: result.status,
    decisionId: result.decisionId,
    summary: result.summary,
    model: result.runRecord.model,
    costUsd:
      result.runRecord.cost.totalUsd === 0
        ? "$0.00 (stub)"
        : `$${result.runRecord.cost.totalUsd.toFixed(4)}`,
    cacheHitRate: result.runRecord.cost.cacheHitRate,
    inputTokens: result.runRecord.usage.inputTokens + result.runRecord.usage.cacheReadTokens,
    outputTokens: result.runRecord.usage.outputTokens,
    toolCalls: result.toolCalls.map((t) => ({ tool: t.toolName, isError: t.isError })),
  };
}
