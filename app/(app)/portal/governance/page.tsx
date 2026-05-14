import {
  getPerAgentTelemetry,
  getTelemetrySummary,
  listAgentRuns,
} from "@/lib/portal/agents/telemetry";
import { computeActivationStatus, getPortalRepository } from "@/lib/portal/repositories";
import { loadPortalContext } from "@/lib/portal/server";
import { computeControlsInForce } from "@/lib/portal/governance/controls-in-force";
import {
  isConnectorEnabled,
  listEnabledConnectors,
} from "@/lib/portal/outbound-actions/enabled-connectors";
import { listConnectors } from "@/lib/portal/outbound-actions/connectors";
import { getWorkspaceFreezeStatus } from "@/lib/portal/outbound-actions/freeze-actions";
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
  const controls = computeControlsInForce(snapshot.workspace.id);
  const freezeStatus = await getWorkspaceFreezeStatus();
  const allConnectors = listConnectors(process.env).map((c) => ({
    id: c.id,
    label: c.label,
    enabled: isConnectorEnabled(snapshot.workspace.id, c.id),
  }));
  const enabledConnectors = listEnabledConnectors(snapshot.workspace.id);
  return (
    <GovernanceView
      snapshot={snapshot}
      membership={membership}
      activationStatus={activationStatus}
      agentTelemetry={telemetry}
      agentRuns={agentRuns}
      perAgentTelemetry={perAgent}
      controls={controls}
      freezeStatus={freezeStatus}
      connectors={allConnectors}
      enabledConnectors={enabledConnectors}
    />
  );
}
