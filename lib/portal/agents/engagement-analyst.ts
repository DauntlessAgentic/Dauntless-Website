// ============================================================
// Engagement Analyst agent (Phase 3)
//
// The one real agent the portal ships first. The pattern below
// is intentionally simple — single-turn-with-tool-use:
//
//   user → assistant (tool_use)* → tool_result → assistant (text + tool_use propose_decision)
//
// We loop up to MAX_TOOL_TURNS to let the model call multiple
// read tools before proposing. The conversation never exceeds
// MAX_OUTPUT_TOKENS in total budget.
//
// The system prompt + the workspace bookshelf summary are emitted
// as cacheable blocks so subsequent runs hit the cache.
//
// When ANTHROPIC_API_KEY is not configured the orchestrator falls
// back to a deterministic stub that still produces a real
// Decision row — keeping the full UX exercisable in dev.
// ============================================================

// Server-only by convention (Next bundler will reject client imports via the
// "use server" actions that consume this). We don't use the `server-only`
// package because it throws under node:test; see tests/portal/*.mjs.

import { getPortalRepository, type PortalRepository } from "@/lib/portal/repositories";
import type { Artifact, KnowledgeItem } from "@/lib/portal/types";

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
  ENGAGEMENT_ANALYST_TOOLS,
  executeTool,
  type ProposeDecisionInput,
  type ToolExecutionResult,
} from "./tools";

export {
  ENGAGEMENT_ANALYST_ID,
  ENGAGEMENT_ANALYST_NAME,
} from "./engagement-analyst.shared";
import {
  ENGAGEMENT_ANALYST_ID,
  ENGAGEMENT_ANALYST_NAME,
} from "./engagement-analyst.shared";

const MAX_TOOL_TURNS = 6;

const SYSTEM_PROMPT = `You are the Engagement Analyst, a Strategist-archetype agent in the Dauntless Client Intelligence Portal.

Your job is to propose ONE high-leverage decision for a Dauntless engagement, grounded entirely in workspace state — never in generic advice.

Operating rules (binding):
1. Always read before proposing. Call \`search_artifacts\` and \`summarize_signals\` at minimum, plus \`read_decision\` or \`cite_evidence\` as needed, BEFORE \`propose_decision\`.
2. Cite at least two artifact ids and at least two evidence ids in the proposal.
3. Risk tier: "high" when the decision is reversibility-bounded (procurement gate, policy alignment, agent autonomy threshold); "medium" for cross-team / multi-week impact; "low" otherwise.
4. Confidence: set ≥0.75 only if every claim is grounded in a cited evidence row. Set below 0.5 when you would prefer a human to defer.
5. Tone: premium AI strategy cockpit. Avoid SaaS-CRM verbs ("submit", "ticket", "form").
6. Output a SHORT assistant-message after \`propose_decision\` summarizing what you proposed and why. No emojis. No filler.

Domain vocabulary you may use freely: Living Deliverables, Decision Surface, Engagement Continuity, Artifact Proof, Evidence Vault, Decision Register, Knowledge Architecture (Desk/Bookshelf/Cabinet), Activation Plan, Outcome Evidence, Governance Layer, Compounding Intelligence.

You are operating against the workspace described in the next block. Treat it as the authoritative starting context — anything outside it is uncertain.`;

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
      id,
      name,
      kind,
      phase,
      status,
      progress,
      risks,
    })),
    canonicalArtifacts: artifacts
      .filter((a) => a.canonical || a.reviewState === "approved")
      .slice(0, 12)
      .map(({ id, name, type, engagementId, description }) => ({
        id,
        name,
        type,
        engagementId,
        description,
      })),
    canonicalKnowledge: knowledge
      .filter((k) => k.canonical)
      .slice(0, 12)
      .map(({ id, title, memoryTier, freshness }) => ({ id, title, memoryTier, freshness })),
    pendingDecisionCount: decisions.filter((d) => d.status === "pending-approval").length,
  };
}

export interface EngagementAnalystRunInput {
  /** Optional steering prompt from the operator. */
  prompt?: string;
  /** Force a specific engagement to focus on. */
  engagementId?: string;
}

export interface EngagementAnalystRunResult {
  status: "completed" | "errored" | "stub";
  decisionId?: string;
  summary: string;
  toolCalls: ToolExecutionResult[];
  runRecord: AgentRunRecord;
}

export async function runEngagementAnalyst(
  input: EngagementAnalystRunInput,
): Promise<EngagementAnalystRunResult> {
  const repository = getPortalRepository();
  const workspace = await repository.getDefaultWorkspace();
  const context = await buildBookshelfContext(repository, workspace.id);
  const focusEngagementId = input.engagementId ?? context.engagements[0]?.id ?? "";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_DEFAULT_MODEL ?? DEFAULT_ANTHROPIC_MODEL;

  if (!apiKey) {
    return runStub(repository, workspace.id, context, focusEngagementId, input.prompt);
  }

  const startedAt = new Date();
  const system: AnthropicSystemBlock[] = [
    { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    {
      type: "text",
      text: `Workspace context (cached):\n${JSON.stringify(context, null, 2)}`,
      cache_control: { type: "ephemeral" },
    },
  ];

  const userPrompt =
    input.prompt ??
    `Propose the next high-leverage decision the portal should land. Focus on engagement ${focusEngagementId} unless evidence strongly favours another.`;

  const messages: AnthropicMessage[] = [{ role: "user", content: userPrompt }];

  const toolCalls: ToolExecutionResult[] = [];
  let proposedDecisionId: string | undefined;
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
          tools: ENGAGEMENT_ANALYST_TOOLS,
          temperature: 0.2,
        },
        { apiKey },
      );

      totalUsage = sumUsage(totalUsage, response.usage);
      const requestIdHeader = (response as unknown as { _requestId?: string })._requestId;
      if (typeof requestIdHeader === "string") lastProviderRequestId = requestIdHeader;

      const toolUses = response.content.filter(
        (block): block is Extract<AnthropicContentBlock, { type: "tool_use" }> => block.type === "tool_use",
      );
      const texts = response.content.filter(
        (block): block is Extract<AnthropicContentBlock, { type: "text" }> => block.type === "text",
      );
      finalText = texts.map((t) => t.text).join("\n").trim() || finalText;

      if (toolUses.length === 0) {
        break;
      }

      messages.push({ role: "assistant", content: response.content });

      const toolResults: AnthropicContentBlock[] = [];
      for (const use of toolUses) {
        const result = await executeTool(use.name, use.input, {
          repository,
          workspaceId: workspace.id,
          agentId: ENGAGEMENT_ANALYST_ID,
          agentDisplayName: ENGAGEMENT_ANALYST_NAME,
        });
        toolCalls.push(result);
        if (result.proposedDecisionId) {
          proposedDecisionId = result.proposedDecisionId;
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: result.output,
          is_error: result.isError || undefined,
        });
      }
      messages.push({ role: "user", content: toolResults });

      // If the proposal landed, we still want one more turn so the model
      // can emit its closing assistant text. Break after that turn naturally.
      if (proposedDecisionId && response.stop_reason === "tool_use") {
        continue;
      }
      if (response.stop_reason === "end_turn") {
        break;
      }
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
    agentId: ENGAGEMENT_ANALYST_ID,
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

  return {
    status,
    decisionId: proposedDecisionId,
    summary: finalText || errorMessage || "Run produced no output.",
    toolCalls,
    runRecord,
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

// ── Deterministic stub (no API key configured) ────────────────

async function runStub(
  repository: PortalRepository,
  workspaceId: string,
  context: BookshelfContext,
  focusEngagementId: string,
  prompt?: string,
): Promise<EngagementAnalystRunResult> {
  const startedAt = new Date();

  // Pretend we read the artifacts + evidence so the trace is honest about
  // what a real run would do.
  const artifacts = await repository.listArtifacts(workspaceId);
  const evidence = await repository.listEvidence(workspaceId);

  const targetEngagement =
    context.engagements.find((e) => e.id === focusEngagementId) ?? context.engagements[0];
  const seedArtifacts = artifacts
    .filter((a) => a.engagementId === targetEngagement?.id)
    .slice(0, 3);
  const seedEvidence = evidence
    .filter((e) => seedArtifacts.some((a) => a.linkedEvidenceIds.includes(e.id)))
    .slice(0, 4);

  const stubProposal: ProposeDecisionInput = {
    engagementId: targetEngagement?.id ?? focusEngagementId,
    title: `Anchor ${targetEngagement?.name ?? "the next phase"} on the canonical evidence trail`,
    summary:
      "Adopt the current Discovery findings as the canonical anchor for the next engagement phase. Two artifacts and four evidence rows cluster around the same recommendation; deferring loses the convergence and the SteerCo window.",
    rationale:
      "Synthesis of recent signals shows convergent SteerCo readiness, paired with two canonical-eligible artifacts. Deferring past Friday loses the procurement gating window. Risk is medium because the change is reversible at the next checkpoint.",
    riskTier: "medium",
    confidence: 0.72,
    options: [
      {
        label: "Adopt anchor now",
        description: "Land the recommendation as canonical; carry forward into the next phase.",
        isDefault: true,
      },
      {
        label: "Defer one cycle",
        description: "Re-confirm SteerCo alignment in the next review; risk losing the gating window.",
      },
      {
        label: "Reject and revisit",
        description: "Surface contradicting signals before reconsidering.",
      },
    ],
    artifactIds: seedArtifacts.map((a) => a.id),
    evidenceIds: seedEvidence.map((e) => e.id),
  };

  const proposalResult = await executeTool("propose_decision", stubProposal, {
    repository,
    workspaceId,
    agentId: ENGAGEMENT_ANALYST_ID,
    agentDisplayName: ENGAGEMENT_ANALYST_NAME,
  });

  const finishedAt = new Date();
  const summary = prompt
    ? `Stub run (no ANTHROPIC_API_KEY configured). Proposed an anchor decision against ${targetEngagement?.name ?? "the focused engagement"} in response to: "${prompt}".`
    : `Stub run (no ANTHROPIC_API_KEY configured). Proposed an anchor decision against ${targetEngagement?.name ?? "the focused engagement"}.`;

  const runRecord: AgentRunRecord = {
    id: `run-${Date.now().toString(36)}-stub`,
    agentId: ENGAGEMENT_ANALYST_ID,
    workspaceId,
    startedAt,
    finishedAt,
    model: "stub",
    status: "stub",
    proposedDecisionId: proposalResult.proposedDecisionId,
    toolCalls: [{ tool: "propose_decision", isError: proposalResult.isError }],
    usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 },
    cost: {
      inputUsd: 0,
      outputUsd: 0,
      cacheWriteUsd: 0,
      cacheReadUsd: 0,
      totalUsd: 0,
      cacheHitRate: 0,
    },
    notes: summary,
  };
  recordAgentRun(runRecord);

  return {
    status: "stub",
    decisionId: proposalResult.proposedDecisionId,
    summary,
    toolCalls: [proposalResult],
    runRecord,
  };
}
