"use server";

// ============================================================
// Agent server actions (Phase 5)
//
// Every agent in the registry can be triggered through
// `runAgentAction`. The Engagement Analyst-specific action
// remains as a backwards-compatibility shim.
// ============================================================

import { revalidatePath } from "next/cache";

import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";

import { ENGAGEMENT_ANALYST_ID } from "./engagement-analyst.shared";
import { getAgentDefinition } from "./registry";
import { runAgent, type AgentRunInput } from "./runner";

export interface AgentRunSummary {
  status: "completed" | "errored" | "stub";
  agentId: string;
  agentName: string;
  archetype: string;
  decisionId?: string;
  summary: string;
  model: string;
  /** Pretty-printed cost (e.g. "$0.0042"). */
  costUsd: string;
  cacheHitRate: number;
  inputTokens: number;
  outputTokens: number;
  toolCalls: Array<{ tool: string; isError: boolean }>;
  handoffTo?: string;
}

export async function runAgentAction(input: AgentRunInput): Promise<AgentRunSummary> {
  const definition = getAgentDefinition(input.agentId);
  if (!definition) throw new Error(`Unknown agent: ${input.agentId}`);

  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  const canRunAgent = roleCanRun(membership.role, definition.archetype);
  if (!canRunAgent) {
    throw new Error(
      `Role "${membership.role}" cannot trigger ${definition.archetype} agents in this workspace.`,
    );
  }

  const result = await runAgent(input);
  revalidatePath("/portal", "layout");

  return {
    status: result.status,
    agentId: definition.id,
    agentName: definition.name,
    archetype: definition.archetype,
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
    handoffTo: result.handoffTo,
  };
}

// Backwards-compatibility shim — the Phase 3 view imported this name.
export async function runEngagementAnalystAction(input: {
  prompt?: string;
  engagementId?: string;
}): Promise<AgentRunSummary> {
  return runAgentAction({ agentId: ENGAGEMENT_ANALYST_ID, ...input });
}

function roleCanRun(role: string, archetype: string): boolean {
  // Owners + executives + leads can run everything.
  if (role === "owner" || role === "executive" || role === "lead") return true;
  // Auditors can run auditor + chief-of-staff agents (read-only-ish).
  if (role === "auditor" && (archetype === "auditor" || archetype === "chief-of-staff")) return true;
  return false;
}
