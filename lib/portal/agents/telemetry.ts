// ============================================================
// Agent run telemetry store (Phase 3)
//
// In-memory ledger of every Engagement Analyst run. Phase 6 will
// flush these onto the persistent event bus; for now they back
// the "Agent runs & cost" card on /portal/governance.
// ============================================================

// Server-only by convention (Next bundler will reject client imports via the
// "use server" actions that consume this). We don't use the `server-only`
// package because it throws under node:test; see tests/portal/*.mjs.

import type { UsageCost } from "./runtime/anthropic";

export interface AgentRunRecord {
  id: string;
  agentId: string;
  workspaceId: string;
  startedAt: Date;
  finishedAt: Date;
  model: string;
  status: "completed" | "errored" | "stub";
  /** Anthropic request id when available — useful for support tickets. */
  providerRequestId?: string;
  /** Decision proposed during this run, if any. */
  proposedDecisionId?: string;
  /** Tools invoked + tool execution latency. */
  toolCalls: Array<{ tool: string; isError: boolean }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
  };
  cost: UsageCost;
  /** Human-readable error if the run failed. */
  error?: string;
  /** Notes for the governance feed. */
  notes?: string;
}

const records: AgentRunRecord[] = [];
const MAX_RETAINED = 50;

export function recordAgentRun(record: AgentRunRecord): void {
  records.push(record);
  if (records.length > MAX_RETAINED) {
    records.splice(0, records.length - MAX_RETAINED);
  }
}

export function listAgentRuns(limit = 20): AgentRunRecord[] {
  return records
    .slice()
    .sort((a, b) => b.finishedAt.getTime() - a.finishedAt.getTime())
    .slice(0, limit);
}

export function getTelemetrySummary(): {
  totalRuns: number;
  completedRuns: number;
  erroredRuns: number;
  totalCostUsd: number;
  averageCacheHitRate: number;
  averageInputTokens: number;
  decisionsProposed: number;
} {
  if (records.length === 0) {
    return {
      totalRuns: 0,
      completedRuns: 0,
      erroredRuns: 0,
      totalCostUsd: 0,
      averageCacheHitRate: 0,
      averageInputTokens: 0,
      decisionsProposed: 0,
    };
  }
  const totalCostUsd = records.reduce((acc, r) => acc + r.cost.totalUsd, 0);
  const cacheHitRates = records.filter((r) => r.cost.cacheHitRate > 0);
  const averageCacheHitRate =
    cacheHitRates.length === 0
      ? 0
      : cacheHitRates.reduce((acc, r) => acc + r.cost.cacheHitRate, 0) / cacheHitRates.length;
  const averageInputTokens =
    records.reduce((acc, r) => acc + r.usage.inputTokens + r.usage.cacheReadTokens, 0) / records.length;
  return {
    totalRuns: records.length,
    completedRuns: records.filter((r) => r.status === "completed").length,
    erroredRuns: records.filter((r) => r.status === "errored").length,
    totalCostUsd,
    averageCacheHitRate,
    averageInputTokens,
    decisionsProposed: records.filter((r) => r.proposedDecisionId).length,
  };
}

export interface PerAgentTelemetry {
  agentId: string;
  runs: number;
  decisionsProposed: number;
  totalCostUsd: number;
  averageCacheHitRate: number;
  lastRunAt?: Date;
  hasError: boolean;
}

export function getPerAgentTelemetry(): PerAgentTelemetry[] {
  const byAgent = new Map<string, PerAgentTelemetry>();
  for (const record of records) {
    const existing = byAgent.get(record.agentId) ?? {
      agentId: record.agentId,
      runs: 0,
      decisionsProposed: 0,
      totalCostUsd: 0,
      averageCacheHitRate: 0,
      lastRunAt: undefined,
      hasError: false,
    };
    existing.runs += 1;
    if (record.proposedDecisionId) existing.decisionsProposed += 1;
    existing.totalCostUsd += record.cost.totalUsd;
    existing.averageCacheHitRate =
      (existing.averageCacheHitRate * (existing.runs - 1) + record.cost.cacheHitRate) / existing.runs;
    existing.hasError = existing.hasError || record.status === "errored";
    if (!existing.lastRunAt || existing.lastRunAt < record.finishedAt) {
      existing.lastRunAt = record.finishedAt;
    }
    byAgent.set(record.agentId, existing);
  }
  return [...byAgent.values()].sort((a, b) => b.runs - a.runs);
}

/** Test-only escape hatch — clears the in-memory ledger. */
export function __resetAgentTelemetry(): void {
  records.length = 0;
}
