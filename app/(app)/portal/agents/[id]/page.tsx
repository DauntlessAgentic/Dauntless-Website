import { notFound } from "next/navigation";

import { listAgentRuns } from "@/lib/portal/agents/telemetry";
import { getAgentDefinition } from "@/lib/portal/agents/registry";
import { TOOLS_BY_ARCHETYPE } from "@/lib/portal/agents/tool-catalog";
import { loadPortalContext } from "@/lib/portal/server";

import { AgentDetailView } from "./view";

export const dynamic = "force-dynamic";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params;
  const { snapshot, membership } = await loadPortalContext();
  const agent = snapshot.agents.find((a) => a.id === id);
  if (!agent) notFound();

  const definition = getAgentDefinition(id);
  const tools = definition ? TOOLS_BY_ARCHETYPE[definition.archetype] : [];
  const runs = listAgentRuns(50)
    .filter((r) => r.agentId === id && r.workspaceId === snapshot.workspace.id)
    .map((r) => ({
      id: r.id,
      model: r.model,
      status: r.status,
      finishedAt: r.finishedAt,
      proposedDecisionId: r.proposedDecisionId,
      inputTokens: r.usage.inputTokens + r.usage.cacheReadTokens,
      outputTokens: r.usage.outputTokens,
      cacheHitRate: r.cost.cacheHitRate,
      totalUsd: r.cost.totalUsd,
      notes: r.notes,
      error: r.error,
    }));
  const conversation = snapshot.conversations.find((c) => c.agentId === id);

  return (
    <AgentDetailView
      agent={agent}
      definition={definition}
      tools={tools}
      runs={runs}
      conversation={conversation}
      membership={membership}
    />
  );
}
