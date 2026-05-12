// ============================================================
// Agent tool catalog (Phase 5)
//
// Every tool the portal exposes to an agent lives here, keyed by
// archetype. The orchestrator never builds a tool list ad-hoc —
// it asks the catalog "what can this archetype see?". This is
// where separation-of-powers is *literally* encoded.
//
// Adding a new tool requires:
//   1. Pick an archetype owner.
//   2. Add the AnthropicToolDefinition below.
//   3. Implement the executor in `executeArchetypeTool` (this file).
//   4. Add a separation-of-powers test asserting other archetypes
//      cannot reach it.
// ============================================================

// Server-only by convention.

import type { PortalRepository } from "@/lib/portal/repositories";
import type {
  AgentArchetype,
  Artifact,
  Conversation,
  Decision,
  Evidence,
  KnowledgeItem,
  RiskTier,
  Signal,
} from "@/lib/portal/types";

import {
  ENGAGEMENT_ANALYST_TOOLS,
  executeTool as executeEngagementAnalystTool,
  type ToolExecutionContext,
  type ToolExecutionResult,
} from "./tools";
import type { AnthropicToolDefinition } from "./runtime/anthropic";

// ── Read tools shared by every archetype ──────────────────────

const SHARED_READ_TOOLS: AnthropicToolDefinition[] = [
  {
    name: "search_artifacts",
    description: "Returns the most-relevant artifacts in the workspace. Optionally filter by engagement, type, or review state.",
    input_schema: {
      type: "object",
      properties: {
        engagementId: { type: "string" },
        reviewState: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "read_decision",
    description: "Fetch a single decision by id, including its recommendation, evidence ids, and current status.",
    input_schema: {
      type: "object",
      properties: { decisionId: { type: "string" } },
      required: ["decisionId"],
    },
  },
  {
    name: "summarize_signals",
    description: "Returns the most recent N signals from the workspace 'what changed' feed.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number" },
        kind: { type: "string" },
        severity: { type: "string" },
      },
    },
  },
  {
    name: "cite_evidence",
    description: "Returns the evidence rows attached to the provided evidence ids.",
    input_schema: {
      type: "object",
      properties: {
        evidenceIds: { type: "array", items: { type: "string" } },
      },
      required: ["evidenceIds"],
    },
  },
];

// ── Operator-only write tools ─────────────────────────────────

const OPERATOR_TOOLS: AnthropicToolDefinition[] = [
  {
    name: "draft_artifact_version",
    description:
      "Draft a new version of an existing artifact. Lands as `in-review` so a human or the Auditor can sign off. Use a strict version bump (semver-style).",
    input_schema: {
      type: "object",
      properties: {
        artifactId: { type: "string" },
        versionBump: { type: "string", description: "major | minor | patch" },
        summary: { type: "string", description: "What changed in this version." },
        body: { type: "string", description: "Updated artifact body (Markdown)." },
      },
      required: ["artifactId", "versionBump", "summary", "body"],
    },
  },
  {
    name: "request_review",
    description: "Hand off the current artifact draft to an Auditor. Creates an audit-log handoff entry and a signal.",
    input_schema: {
      type: "object",
      properties: {
        artifactId: { type: "string" },
        notes: { type: "string" },
      },
      required: ["artifactId"],
    },
  },
];

// ── Auditor-only tools ────────────────────────────────────────

const AUDITOR_TOOLS: AnthropicToolDefinition[] = [
  {
    name: "audit_evidence_completeness",
    description:
      "Check that every claim in a target decision or artifact links to a real Evidence row. Returns gaps + risk score.",
    input_schema: {
      type: "object",
      properties: {
        targetKind: { type: "string", description: "decision | artifact" },
        targetId: { type: "string" },
      },
      required: ["targetKind", "targetId"],
    },
  },
  {
    name: "audit_canonical_candidate",
    description:
      "Run a canonical-promotion audit on a knowledge item. Returns a verdict (approve / revise / reject) with cited reasoning.",
    input_schema: {
      type: "object",
      properties: {
        knowledgeId: { type: "string" },
      },
      required: ["knowledgeId"],
    },
  },
  {
    name: "propose_revision",
    description:
      "Surface a specific revision request against an artifact or decision. The request lands as an audit-log entry and a signal.",
    input_schema: {
      type: "object",
      properties: {
        targetKind: { type: "string" },
        targetId: { type: "string" },
        requestedChange: { type: "string" },
        severity: { type: "string", description: "low | medium | high" },
      },
      required: ["targetKind", "targetId", "requestedChange", "severity"],
    },
  },
];

// ── Chief of Staff tools ─────────────────────────────────────

const CHIEF_OF_STAFF_TOOLS: AnthropicToolDefinition[] = [
  {
    name: "generate_briefing",
    description:
      "Produce an executive-ready briefing summarizing the top 3 decisions, top 3 risks, and 3 next-best-actions for the workspace.",
    input_schema: {
      type: "object",
      properties: {
        horizon: { type: "string", description: "this-week | this-quarter" },
      },
    },
  },
  {
    name: "summarize_engagement",
    description: "Write a one-paragraph status digest for a single engagement.",
    input_schema: {
      type: "object",
      properties: {
        engagementId: { type: "string" },
      },
      required: ["engagementId"],
    },
  },
];

// ── Strategist tools (includes propose_decision) ─────────────

const STRATEGIST_TOOLS: AnthropicToolDefinition[] = [
  ...ENGAGEMENT_ANALYST_TOOLS.filter((t) => t.name === "propose_decision"),
];

// ── Catalog by archetype ─────────────────────────────────────

export const TOOLS_BY_ARCHETYPE: Record<AgentArchetype, AnthropicToolDefinition[]> = {
  strategist:        [...SHARED_READ_TOOLS, ...STRATEGIST_TOOLS],
  operator:          [...SHARED_READ_TOOLS, ...OPERATOR_TOOLS],
  auditor:           [...SHARED_READ_TOOLS, ...AUDITOR_TOOLS],
  "chief-of-staff":  [...SHARED_READ_TOOLS, ...CHIEF_OF_STAFF_TOOLS],
};

/** Pure predicate: is this tool permitted for this archetype? */
export function isToolPermitted(archetype: AgentArchetype, toolName: string): boolean {
  return TOOLS_BY_ARCHETYPE[archetype].some((t) => t.name === toolName);
}

// ── Execution ────────────────────────────────────────────────

export async function executeArchetypeTool(
  archetype: AgentArchetype,
  toolName: string,
  input: unknown,
  ctx: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  if (!isToolPermitted(archetype, toolName)) {
    return {
      toolName,
      output: JSON.stringify({
        error: `separation-of-powers violation: ${archetype} cannot call ${toolName}`,
      }),
      isError: true,
    };
  }

  // Shared read tools + strategist propose_decision route through the
  // existing engagement-analyst executor (same shape).
  if (
    SHARED_READ_TOOLS.some((t) => t.name === toolName) ||
    toolName === "propose_decision"
  ) {
    return executeEngagementAnalystTool(toolName, input, ctx);
  }

  switch (toolName) {
    case "draft_artifact_version":   return draftArtifactVersion(input as DraftInput, ctx);
    case "request_review":           return requestReview(input as RequestReviewInput, ctx);
    case "audit_evidence_completeness": return auditEvidenceCompleteness(input as AuditTargetInput, ctx);
    case "audit_canonical_candidate":   return auditCanonicalCandidate(input as { knowledgeId: string }, ctx);
    case "propose_revision":         return proposeRevision(input as ProposeRevisionInput, ctx);
    case "generate_briefing":        return generateBriefing(input as { horizon?: string }, ctx);
    case "summarize_engagement":     return summarizeEngagement(input as { engagementId: string }, ctx);
    default:
      return {
        toolName,
        output: JSON.stringify({ error: `Unknown tool: ${toolName}` }),
        isError: true,
      };
  }
}

// ── Tool implementations ─────────────────────────────────────

interface DraftInput {
  artifactId: string;
  versionBump: "major" | "minor" | "patch";
  summary: string;
  body: string;
}

async function draftArtifactVersion(input: DraftInput, ctx: ToolExecutionContext): Promise<ToolExecutionResult> {
  try {
    const result = await ctx.repository.draftArtifactVersion({
      workspaceId: ctx.workspaceId,
      artifactId: input.artifactId,
      versionBump: input.versionBump,
      summary: input.summary,
      body: input.body,
      actor: ctx.agentDisplayName,
      actorKind: "agent",
    });
    return {
      toolName: "draft_artifact_version",
      output: JSON.stringify({ ok: true, version: result.version, versionId: result.id }),
      isError: false,
    };
  } catch (err) {
    return {
      toolName: "draft_artifact_version",
      output: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      isError: true,
    };
  }
}

interface RequestReviewInput {
  artifactId: string;
  notes?: string;
}

async function requestReview(input: RequestReviewInput, ctx: ToolExecutionContext): Promise<ToolExecutionResult> {
  try {
    await ctx.repository.requestArtifactReview({
      workspaceId: ctx.workspaceId,
      artifactId: input.artifactId,
      actor: ctx.agentDisplayName,
      actorKind: "agent",
      notes: input.notes,
    });
    return {
      toolName: "request_review",
      output: JSON.stringify({ ok: true }),
      isError: false,
    };
  } catch (err) {
    return {
      toolName: "request_review",
      output: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      isError: true,
    };
  }
}

interface AuditTargetInput {
  targetKind: "decision" | "artifact";
  targetId: string;
}

async function auditEvidenceCompleteness(input: AuditTargetInput, ctx: ToolExecutionContext): Promise<ToolExecutionResult> {
  const evidence = await ctx.repository.listEvidence(ctx.workspaceId);
  const decisions = await ctx.repository.listDecisions(ctx.workspaceId);
  const artifacts = await ctx.repository.listArtifacts(ctx.workspaceId);
  let citedIds: string[] = [];
  let target: Decision | Artifact | undefined;
  if (input.targetKind === "decision") {
    target = decisions.find((d) => d.id === input.targetId);
    if (!target) return errResult("audit_evidence_completeness", `Decision not found: ${input.targetId}`);
    citedIds = (target as Decision).evidenceIds;
  } else {
    target = artifacts.find((a) => a.id === input.targetId);
    if (!target) return errResult("audit_evidence_completeness", `Artifact not found: ${input.targetId}`);
    citedIds = (target as Artifact).linkedEvidenceIds;
  }
  const cited = citedIds
    .map((id) => evidence.find((e) => e.id === id))
    .filter((e): e is Evidence => Boolean(e));
  const missing = citedIds.filter((id) => !evidence.some((e) => e.id === id));
  const score = cited.length === 0 ? 0 : Math.min(1, cited.length / 3);
  const verdict =
    cited.length >= 3 && missing.length === 0 ? "pass" : cited.length === 0 ? "fail" : "needs-revision";
  return {
    toolName: "audit_evidence_completeness",
    output: JSON.stringify({
      targetKind: input.targetKind,
      targetId: input.targetId,
      verdict,
      score,
      cited: cited.map((e) => ({ id: e.id, title: e.title })),
      missingIds: missing,
    }),
    isError: false,
  };
}

async function auditCanonicalCandidate(
  input: { knowledgeId: string },
  ctx: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  const knowledge = await ctx.repository.listKnowledge(ctx.workspaceId);
  const target = knowledge.find((k) => k.id === input.knowledgeId);
  if (!target) return errResult("audit_canonical_candidate", `Knowledge not found: ${input.knowledgeId}`);

  const ageDays = (Date.now() - target.lastValidatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const tier = target.memoryTier;
  const tierEligible = tier === "M2" || tier === "M3";
  const confidenceOk = target.confidence >= 0.7;
  const freshnessOk = ageDays < 90;

  const verdict =
    !tierEligible ? "reject"
    : !confidenceOk ? "revise"
    : !freshnessOk ? "revise"
    : "approve";
  return {
    toolName: "audit_canonical_candidate",
    output: JSON.stringify({
      knowledgeId: input.knowledgeId,
      verdict,
      reasons: {
        tierEligible,
        confidenceOk,
        freshnessOk,
        confidence: target.confidence,
        memoryTier: target.memoryTier,
        freshness: target.freshness,
      },
    }),
    isError: false,
  };
}

interface ProposeRevisionInput {
  targetKind: "artifact" | "decision";
  targetId: string;
  requestedChange: string;
  severity: "low" | "medium" | "high";
}

async function proposeRevision(input: ProposeRevisionInput, ctx: ToolExecutionContext): Promise<ToolExecutionResult> {
  await ctx.repository.proposeRevision({
    workspaceId: ctx.workspaceId,
    targetKind: input.targetKind,
    targetId: input.targetId,
    requestedChange: input.requestedChange,
    severity: input.severity,
    actor: ctx.agentDisplayName,
    actorKind: "agent",
  });
  return {
    toolName: "propose_revision",
    output: JSON.stringify({ ok: true, requested: input.requestedChange }),
    isError: false,
  };
}

async function generateBriefing(
  input: { horizon?: string },
  ctx: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  const [decisions, signals, nextBestActions] = await Promise.all([
    ctx.repository.listDecisions(ctx.workspaceId),
    ctx.repository.listSignals(ctx.workspaceId),
    ctx.repository.listNextBestActions(ctx.workspaceId),
  ]);
  const pending = decisions
    .filter((d) => d.status === "pending-approval")
    .slice(0, 3)
    .map((d) => ({ id: d.id, title: d.title, riskTier: d.riskTier as RiskTier, confidence: d.recommendation.confidence }));
  const risks = signals
    .filter((s) => s.severity === "important" || s.severity === "urgent")
    .slice(0, 3)
    .map((s) => ({ id: s.id, title: s.title, severity: s.severity }));
  const actions = nextBestActions.slice(0, 3).map((a) => ({ id: a.id, label: a.label, priority: a.priority }));
  return {
    toolName: "generate_briefing",
    output: JSON.stringify({
      horizon: input.horizon ?? "this-week",
      topDecisions: pending,
      topRisks: risks,
      topActions: actions,
    }),
    isError: false,
  };
}

async function summarizeEngagement(
  input: { engagementId: string },
  ctx: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  const engagement = (await ctx.repository.listEngagements(ctx.workspaceId)).find((e) => e.id === input.engagementId);
  if (!engagement) return errResult("summarize_engagement", `Engagement not found: ${input.engagementId}`);
  const [artifacts, decisions, tasks] = await Promise.all([
    ctx.repository.listArtifacts(ctx.workspaceId),
    ctx.repository.listDecisions(ctx.workspaceId),
    ctx.repository.listTasks(ctx.workspaceId),
  ]);
  const scoped = {
    artifactsCount: artifacts.filter((a) => a.engagementId === input.engagementId).length,
    pendingDecisionsCount: decisions.filter(
      (d) => d.engagementId === input.engagementId && d.status === "pending-approval",
    ).length,
    blockedTasksCount: tasks.filter((t) => t.engagementId === input.engagementId && t.status === "blocked").length,
  };
  return {
    toolName: "summarize_engagement",
    output: JSON.stringify({
      engagementId: engagement.id,
      name: engagement.name,
      phase: engagement.phase,
      status: engagement.status,
      progress: engagement.progress,
      risks: engagement.risks,
      ...scoped,
    }),
    isError: false,
  };
}

function errResult(toolName: string, message: string): ToolExecutionResult {
  return {
    toolName,
    output: JSON.stringify({ error: message }),
    isError: true,
  };
}

// Re-export for downstream consumers (type-only, no implementations).
export type {
  Artifact,
  Conversation,
  Decision,
  Evidence,
  KnowledgeItem,
  PortalRepository,
  Signal,
};
