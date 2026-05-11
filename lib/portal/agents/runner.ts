// ============================================================
// Generic agent runner (Phase 5)
//
// Every agent in the fleet executes through this single
// orchestrator. The orchestrator:
//   1. Looks up the agent definition in AGENT_REGISTRY.
//   2. Composes a system prompt with cached workspace context.
//   3. Calls Anthropic with the archetype's tool surface.
//   4. Routes tool_use blocks through `executeArchetypeTool`,
//      which enforces separation-of-powers.
//   5. Records telemetry.
//
// Stub mode: when ANTHROPIC_API_KEY is unset, each archetype has
// a deterministic stub path so the UX runs end-to-end without
// model spend.
// ============================================================

// Server-only by convention.

import { getPortalRepository, type PortalRepository } from "@/lib/portal/repositories";
import type { AgentArchetype, Artifact, KnowledgeItem } from "@/lib/portal/types";

import {
  callAnthropicMessages,
  costFromUsage,
  DEFAULT_ANTHROPIC_MODEL,
  ProviderRuntimeError,
  type AnthropicContentBlock,
  type AnthropicMessage,
  type AnthropicSystemBlock,
  type AnthropicUsage,
} from "./runtime/anthropic";
import {
  recordAgentRun,
  type AgentRunRecord,
} from "./telemetry";
import {
  executeArchetypeTool,
  TOOLS_BY_ARCHETYPE,
} from "./tool-catalog";
import type { ToolExecutionResult } from "./tools";
import { getAgentDefinition, type AgentDefinition } from "./registry";

const MAX_TOOL_TURNS = 6;

export interface AgentRunInput {
  agentId: string;
  /** Optional steering prompt from the operator. */
  prompt?: string;
  /** Force a specific engagement to focus on. */
  engagementId?: string;
}

export interface AgentRunResult {
  status: "completed" | "errored" | "stub";
  decisionId?: string;
  summary: string;
  toolCalls: ToolExecutionResult[];
  runRecord: AgentRunRecord;
  /** Optional handoff target archetype if the agent finished with a handoff. */
  handoffTo?: AgentArchetype;
}

interface BookshelfContext {
  workspace: { id: string; name: string };
  engagements: Array<{
    id: string;
    name: string;
    kind: string;
    phase: string;
    status: string;
    progress: number;
    risks: string[];
  }>;
  canonicalArtifacts: Pick<Artifact, "id" | "name" | "type" | "engagementId" | "description">[];
  canonicalKnowledge: Pick<KnowledgeItem, "id" | "title" | "memoryTier" | "freshness">[];
  pendingDecisionCount: number;
}

async function buildBookshelfContext(repo: PortalRepository, workspaceId: string): Promise<BookshelfContext> {
  const [workspace, engagements, artifacts, decisions, knowledge] = await Promise.all([
    repo.getDefaultWorkspace(),
    repo.listEngagements(workspaceId),
    repo.listArtifacts(workspaceId),
    repo.listDecisions(workspaceId),
    repo.listKnowledge(workspaceId),
  ]);
  return {
    workspace: { id: workspace.id, name: workspace.name },
    engagements: engagements.map(({ id, name, kind, phase, status, progress, risks }) => ({
      id, name, kind, phase, status, progress, risks,
    })),
    canonicalArtifacts: artifacts
      .filter((a) => a.canonical || a.reviewState === "approved")
      .slice(0, 12)
      .map(({ id, name, type, engagementId, description }) => ({ id, name, type, engagementId, description })),
    canonicalKnowledge: knowledge
      .filter((k) => k.canonical)
      .slice(0, 12)
      .map(({ id, title, memoryTier, freshness }) => ({ id, title, memoryTier, freshness })),
    pendingDecisionCount: decisions.filter((d) => d.status === "pending-approval").length,
  };
}

export async function runAgent(input: AgentRunInput): Promise<AgentRunResult> {
  const definition = getAgentDefinition(input.agentId);
  if (!definition) {
    throw new Error(`Unknown agent: ${input.agentId}`);
  }
  const repository = getPortalRepository();
  const workspace = await repository.getDefaultWorkspace();
  const context = await buildBookshelfContext(repository, workspace.id);
  const focusEngagementId = input.engagementId ?? context.engagements[0]?.id ?? "";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_DEFAULT_MODEL ?? definition.preferredModel ?? DEFAULT_ANTHROPIC_MODEL;

  if (!apiKey) {
    return runArchetypeStub(definition, repository, workspace.id, context, focusEngagementId, input.prompt);
  }

  const startedAt = new Date();
  const system: AnthropicSystemBlock[] = [
    { type: "text", text: definition.systemPrompt, cache_control: { type: "ephemeral" } },
    {
      type: "text",
      text: `Workspace context (cached):\n${JSON.stringify(context, null, 2)}`,
      cache_control: { type: "ephemeral" },
    },
  ];

  const userPrompt =
    input.prompt ??
    definition.defaultPromptTemplate.replace("{engagementId}", focusEngagementId);

  const messages: AnthropicMessage[] = [{ role: "user", content: userPrompt }];
  const toolCalls: ToolExecutionResult[] = [];
  let proposedDecisionId: string | undefined;
  let handoffTo: AgentArchetype | undefined;
  let totalUsage: AnthropicUsage = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  };
  let lastProviderRequestId: string | undefined;
  let finalText = "";
  let status: AgentRunRecord["status"] = "completed";
  let errorMessage: string | undefined;

  try {
    for (let turn = 0; turn < MAX_TOOL_TURNS; turn += 1) {
      const response = await callAnthropicMessages(
        {
          model,
          system,
          messages,
          tools: TOOLS_BY_ARCHETYPE[definition.archetype],
          temperature: 0.2,
        },
        { apiKey },
      );

      totalUsage = sumUsage(totalUsage, response.usage);
      const toolUses = response.content.filter(
        (block): block is Extract<AnthropicContentBlock, { type: "tool_use" }> => block.type === "tool_use",
      );
      const texts = response.content.filter(
        (block): block is Extract<AnthropicContentBlock, { type: "text" }> => block.type === "text",
      );
      finalText = texts.map((t) => t.text).join("\n").trim() || finalText;

      if (toolUses.length === 0) break;

      messages.push({ role: "assistant", content: response.content });

      const toolResults: AnthropicContentBlock[] = [];
      for (const use of toolUses) {
        const result = await executeArchetypeTool(definition.archetype, use.name, use.input, {
          repository,
          workspaceId: workspace.id,
          agentId: definition.id,
          agentDisplayName: definition.name,
        });
        toolCalls.push(result);
        if (result.proposedDecisionId) proposedDecisionId = result.proposedDecisionId;
        if (use.name === "request_review") handoffTo = "auditor";
        toolResults.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: result.output,
          is_error: result.isError || undefined,
        });
      }
      messages.push({ role: "user", content: toolResults });

      if (response.stop_reason === "end_turn") break;
    }
  } catch (err) {
    status = "errored";
    if (err instanceof ProviderRuntimeError) {
      errorMessage = `${err.kind}: ${err.message}`;
      lastProviderRequestId = err.providerRequestId ?? lastProviderRequestId;
    } else {
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  const finishedAt = new Date();
  const cost = costFromUsage(model, totalUsage);
  const runRecord: AgentRunRecord = {
    id: `run-${Date.now().toString(36)}`,
    agentId: definition.id,
    workspaceId: workspace.id,
    startedAt,
    finishedAt,
    model,
    status,
    providerRequestId: lastProviderRequestId,
    proposedDecisionId,
    toolCalls: toolCalls.map((t) => ({ tool: t.toolName, isError: t.isError })),
    usage: {
      inputTokens: totalUsage.input_tokens,
      outputTokens: totalUsage.output_tokens,
      cacheReadTokens: totalUsage.cache_read_input_tokens,
      cacheWriteTokens: totalUsage.cache_creation_input_tokens,
    },
    cost,
    error: errorMessage,
    notes: finalText || undefined,
  };
  recordAgentRun(runRecord);

  // If a Strategist or Operator ended a run with a write tool, emit a
  // handoff signal so the next role can pick it up.
  if (handoffTo && proposedDecisionId === undefined) {
    await repository.recordAgentHandoff({
      workspaceId: workspace.id,
      fromAgentId: definition.id,
      toArchetype: handoffTo,
      reason: finalText || `${definition.name} finished a write; routing to ${handoffTo}.`,
      refKind: "artifact",
    });
  }

  return {
    status,
    decisionId: proposedDecisionId,
    summary: finalText || errorMessage || "Run produced no output.",
    toolCalls,
    runRecord,
    handoffTo,
  };
}

function sumUsage(a: AnthropicUsage, b: AnthropicUsage): AnthropicUsage {
  return {
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_creation_input_tokens: a.cache_creation_input_tokens + b.cache_creation_input_tokens,
    cache_read_input_tokens: a.cache_read_input_tokens + b.cache_read_input_tokens,
  };
}

// ── Stub fallback (no API key) ────────────────────────────────

async function runArchetypeStub(
  definition: AgentDefinition,
  repository: PortalRepository,
  workspaceId: string,
  context: BookshelfContext,
  focusEngagementId: string,
  prompt?: string,
): Promise<AgentRunResult> {
  const startedAt = new Date();
  const toolCalls: ToolExecutionResult[] = [];
  let proposedDecisionId: string | undefined;
  let handoffTo: AgentArchetype | undefined;
  let summary = "";

  switch (definition.archetype) {
    case "strategist": {
      const result = await stubStrategist(definition, repository, workspaceId, context, focusEngagementId);
      toolCalls.push(...result.toolCalls);
      proposedDecisionId = result.decisionId;
      summary = result.summary;
      break;
    }
    case "operator": {
      const result = await stubOperator(definition, repository, workspaceId, context);
      toolCalls.push(...result.toolCalls);
      summary = result.summary;
      handoffTo = "auditor";
      break;
    }
    case "auditor": {
      const result = await stubAuditor(definition, repository, workspaceId);
      toolCalls.push(...result.toolCalls);
      summary = result.summary;
      break;
    }
    case "chief-of-staff": {
      const result = await stubChiefOfStaff(definition, repository, workspaceId);
      toolCalls.push(...result.toolCalls);
      summary = result.summary;
      break;
    }
  }

  const finishedAt = new Date();
  const runRecord: AgentRunRecord = {
    id: `run-${Date.now().toString(36)}-stub-${definition.id.slice(-6)}`,
    agentId: definition.id,
    workspaceId,
    startedAt,
    finishedAt,
    model: "stub",
    status: "stub",
    proposedDecisionId,
    toolCalls: toolCalls.map((t) => ({ tool: t.toolName, isError: t.isError })),
    usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 },
    cost: {
      inputUsd: 0,
      outputUsd: 0,
      cacheWriteUsd: 0,
      cacheReadUsd: 0,
      totalUsd: 0,
      cacheHitRate: 0,
    },
    notes: prompt ? `Stub run. Operator prompt: "${prompt}". ${summary}` : summary,
  };
  recordAgentRun(runRecord);

  if (handoffTo) {
    await repository.recordAgentHandoff({
      workspaceId,
      fromAgentId: definition.id,
      toArchetype: handoffTo,
      reason: summary,
      refKind: "artifact",
    });
  }

  return {
    status: "stub",
    decisionId: proposedDecisionId,
    summary,
    toolCalls,
    runRecord,
    handoffTo,
  };
}

interface StubResult {
  toolCalls: ToolExecutionResult[];
  summary: string;
  decisionId?: string;
}

async function stubStrategist(
  definition: AgentDefinition,
  repository: PortalRepository,
  workspaceId: string,
  context: BookshelfContext,
  focusEngagementId: string,
): Promise<StubResult> {
  const artifacts = await repository.listArtifacts(workspaceId);
  const evidence = await repository.listEvidence(workspaceId);
  const target = context.engagements.find((e) => e.id === focusEngagementId) ?? context.engagements[0];
  const seedArtifacts = artifacts.filter((a) => a.engagementId === target?.id).slice(0, 3);
  const seedEvidence = evidence
    .filter((e) => seedArtifacts.some((a) => a.linkedEvidenceIds.includes(e.id)))
    .slice(0, 4);

  const proposal = await executeArchetypeTool("strategist", "propose_decision", {
    engagementId: target?.id ?? focusEngagementId,
    title:
      definition.id === "agent-roadmap-strategist"
        ? `Sequence ${target?.name ?? "the next phase"} ahead of cross-engagement dependencies`
        : `Anchor ${target?.name ?? "the next phase"} on the canonical evidence trail`,
    summary:
      definition.id === "agent-roadmap-strategist"
        ? "Lead with this engagement next quarter; defer the parallel Build until the procurement gate clears."
        : "Adopt the current Discovery findings as the canonical anchor for the next engagement phase.",
    rationale:
      "Convergent SteerCo signals + canonical-eligible artifacts indicate the optimal sequencing window. Reversibility intact at the next checkpoint.",
    riskTier: "medium",
    confidence: 0.7,
    options: [
      { label: "Adopt this sequence now", description: "Lock the order; revisit at the next checkpoint.", isDefault: true },
      { label: "Defer one cycle", description: "Wait for the next SteerCo signal." },
      { label: "Reject and rework", description: "Surface contradicting signals before reconsidering." },
    ],
    artifactIds: seedArtifacts.map((a) => a.id),
    evidenceIds: seedEvidence.map((e) => e.id),
  }, {
    repository,
    workspaceId,
    agentId: definition.id,
    agentDisplayName: definition.name,
  });

  return {
    toolCalls: [proposal],
    decisionId: proposal.proposedDecisionId,
    summary: `Stub run. ${definition.name} proposed a decision against ${target?.name ?? focusEngagementId}.`,
  };
}

async function stubOperator(
  definition: AgentDefinition,
  repository: PortalRepository,
  workspaceId: string,
  context: BookshelfContext,
): Promise<StubResult> {
  // Pick the oldest in-review or draft artifact and bump its version.
  const artifacts = await repository.listArtifacts(workspaceId);
  const candidate =
    artifacts
      .filter((a) => a.reviewState === "draft" || a.reviewState === "in-review")
      .sort((a, b) => a.lastReviewedAt.getTime() - b.lastReviewedAt.getTime())[0] ??
    artifacts[0];

  if (!candidate) {
    return { toolCalls: [], summary: `Stub run. ${definition.name} found no artifacts to refresh.` };
  }

  const draft = await executeArchetypeTool("operator", "draft_artifact_version", {
    artifactId: candidate.id,
    versionBump: "patch",
    summary: `${definition.name} refreshed the evidence trail and tightened the rationale.`,
    body: `${candidate.description}\n\nUpdated by ${definition.name} stub run.`,
  }, {
    repository,
    workspaceId,
    agentId: definition.id,
    agentDisplayName: definition.name,
  });
  const handoff = await executeArchetypeTool("operator", "request_review", {
    artifactId: candidate.id,
    notes: "Operator stub handing off for an evidence audit.",
  }, {
    repository,
    workspaceId,
    agentId: definition.id,
    agentDisplayName: definition.name,
  });

  return {
    toolCalls: [draft, handoff],
    summary: `Stub run. ${definition.name} drafted a patch on ${candidate.name} and handed off to an Auditor.`,
  };
}

async function stubAuditor(
  definition: AgentDefinition,
  repository: PortalRepository,
  workspaceId: string,
): Promise<StubResult> {
  // Pick the top pending decision and audit its evidence completeness.
  const decisions = await repository.listDecisions(workspaceId);
  const pending = decisions.find((d) => d.status === "pending-approval") ?? decisions[0];
  if (!pending) {
    return { toolCalls: [], summary: `Stub run. ${definition.name} found nothing to audit.` };
  }
  const audit = await executeArchetypeTool("auditor", "audit_evidence_completeness", {
    targetKind: "decision",
    targetId: pending.id,
  }, {
    repository,
    workspaceId,
    agentId: definition.id,
    agentDisplayName: definition.name,
  });
  const parsed = JSON.parse(audit.output);
  let revision: ToolExecutionResult | null = null;
  if (parsed.verdict !== "pass") {
    revision = await executeArchetypeTool("auditor", "propose_revision", {
      targetKind: "decision",
      targetId: pending.id,
      requestedChange:
        parsed.verdict === "fail"
          ? "Provide ≥3 evidence rows before re-submitting."
          : "Backfill missing evidence rows referenced in the rationale.",
      severity: parsed.verdict === "fail" ? "high" : "medium",
    }, {
      repository,
      workspaceId,
      agentId: definition.id,
      agentDisplayName: definition.name,
    });
  }
  return {
    toolCalls: revision ? [audit, revision] : [audit],
    summary: `Stub run. ${definition.name} audited ${pending.title}: verdict ${parsed.verdict}.`,
  };
}

async function stubChiefOfStaff(
  definition: AgentDefinition,
  repository: PortalRepository,
  workspaceId: string,
): Promise<StubResult> {
  const briefing = await executeArchetypeTool("chief-of-staff", "generate_briefing", {
    horizon: "this-week",
  }, {
    repository,
    workspaceId,
    agentId: definition.id,
    agentDisplayName: definition.name,
  });
  const parsed = JSON.parse(briefing.output);
  return {
    toolCalls: [briefing],
    summary: `Stub run. ${definition.name} produced a this-week briefing covering ${parsed.topDecisions.length} decisions and ${parsed.topRisks.length} risks.`,
  };
}
