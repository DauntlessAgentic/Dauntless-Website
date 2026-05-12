"use server";

// ============================================================
// Quarterly Impact Report agent actions (Phase 6)
//
// Thin convenience action that triggers the Report Builder
// archetype with a steering prompt tuned for impact-report
// generation. Live API hits Claude; offline produces a stub run
// that still updates an artifact.
// ============================================================

import { runAgentAction, type AgentRunSummary } from "./actions";

export async function runReportBuilderAction(input: { prompt?: string }): Promise<AgentRunSummary> {
  return runAgentAction({
    agentId: "agent-report-builder",
    prompt: input.prompt,
  });
}
