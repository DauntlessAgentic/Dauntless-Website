// ============================================================
// Engagement Analyst (Phase 5: delegated)
//
// The Phase 3 module is now a thin shim over the generic runner.
// Agent state, system prompt, and tool surface live in the
// `registry` + `tool-catalog` modules; orchestration lives in
// `runner.ts`. Keeping the public API stable so older imports
// (notably the Phase 3 test suite) continue to work.
// ============================================================

// Server-only by convention.

import { runAgent, type AgentRunInput, type AgentRunResult } from "./runner";
import { ENGAGEMENT_ANALYST_ID, ENGAGEMENT_ANALYST_NAME } from "./engagement-analyst.shared";

export { ENGAGEMENT_ANALYST_ID, ENGAGEMENT_ANALYST_NAME };

export type EngagementAnalystRunInput = Omit<AgentRunInput, "agentId">;
export type EngagementAnalystRunResult = AgentRunResult;

export async function runEngagementAnalyst(
  input: EngagementAnalystRunInput,
): Promise<EngagementAnalystRunResult> {
  return runAgent({ ...input, agentId: ENGAGEMENT_ANALYST_ID });
}
