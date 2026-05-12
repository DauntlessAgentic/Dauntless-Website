import {
  getPerAgentTelemetry,
  getTelemetrySummary,
  listAgentRuns,
} from "@/lib/portal/agents/telemetry";
import { computeActivationStatus, getPortalRepository } from "@/lib/portal/repositories";
import { loadPortalContext } from "@/lib/portal/server";
import { GovernanceView } from "./view";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const { snapshot, membership } = await loadPortalContext();
  const activationStatus = computeActivationStatus(getPortalRepository());
  const telemetry = getTelemetrySummary();
  const agentRuns = listAgentRuns(8).map((run) => ({
    id: run.id,
    agentId: run.agentId,
    finishedAt: run.finishedAt,
    model: run.model,
    status: run.status,
    proposedDecisionId: run.proposedDecisionId,
    inputTokens: run.usage.inputTokens + run.usage.cacheReadTokens,
    outputTokens: run.usage.outputTokens,
    cacheHitRate: run.cost.cacheHitRate,
    totalUsd: run.cost.totalUsd,
    notes: run.notes,
    error: run.error,
  }));
  const perAgent = getPerAgentTelemetry();
  return (
    <GovernanceView
      snapshot={snapshot}
      membership={membership}
      activationStatus={activationStatus}
      agentTelemetry={telemetry}
      agentRuns={agentRuns}
      perAgentTelemetry={perAgent}
    />
  );
}
