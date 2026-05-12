// ============================================================
// Engagement Analyst tool surface (Phase 3)
//
// The agent calls these tools to ground its proposal in real
// workspace state. Each tool is a tight, typed function that
// reads from the repository and returns a JSON-stringified
// result block.
//
// The tools never mutate workspace state directly — the only
// write the agent performs is the final `propose_decision` call,
// which lands a Decision row in `pending-approval` state. Humans
// approve through the existing Phase 2 flow.
// ============================================================

// Server-only by convention (Next bundler will reject client imports via the
// "use server" actions that consume this). We don't use the `server-only`
// package because it throws under node:test; see tests/portal/*.mjs.

import type { PortalRepository } from "@/lib/portal/repositories";
import type {
  Artifact,
  Decision,
  Evidence,
  RiskTier,
  Signal,
} from "@/lib/portal/types";

import type { AnthropicToolDefinition } from "./runtime/anthropic";

export const ENGAGEMENT_ANALYST_TOOLS: AnthropicToolDefinition[] = [
  {
    name: "search_artifacts",
    description:
      "Returns the most-relevant artifacts in the workspace. Optionally filter by engagement, type, or review state. Use this to ground a proposal in living deliverables, not generic advice.",
    input_schema: {
      type: "object",
      properties: {
        engagementId: { type: "string", description: "Restrict to artifacts owned by this engagement." },
        reviewState: { type: "string", description: "Filter by review state (draft/in-review/approved/needs-revision)." },
        limit: { type: "number", description: "Max results (default 6)." },
      },
    },
  },
  {
    name: "read_decision",
    description:
      "Fetch a single decision by id, including its recommendation, evidence ids, and current status. Use to ground a follow-up proposal in the prior decision's reasoning.",
    input_schema: {
      type: "object",
      properties: {
        decisionId: { type: "string", description: "Decision id." },
      },
      required: ["decisionId"],
    },
  },
  {
    name: "summarize_signals",
    description:
      "Returns the most recent N signals from the workspace 'what changed' feed, optionally filtered by kind or severity. Use to assess whether new evidence has emerged since prior decisions.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max results (default 8)." },
        kind: { type: "string", description: "Signal kind to filter on." },
        severity: { type: "string", description: "Severity to filter on (info/notable/important/urgent)." },
      },
    },
  },
  {
    name: "cite_evidence",
    description:
      "Returns the evidence rows attached to the provided evidence ids. Use this to verify that every claim in your recommendation links to a real Evidence row.",
    input_schema: {
      type: "object",
      properties: {
        evidenceIds: {
          type: "array",
          description: "Evidence ids to fetch.",
          items: { type: "string" },
        },
      },
      required: ["evidenceIds"],
    },
  },
  {
    name: "propose_decision",
    description:
      "FINAL ACTION. Land a new decision in `pending-approval` status. Provide a concise title, rationale, 2–3 options (one marked default), the risk tier (low/medium/high), and the ids of the artifacts + evidence rows you cited. Confidence is your own self-rated 0–1. Never call this without first reading artifacts and evidence.",
    input_schema: {
      type: "object",
      properties: {
        engagementId: { type: "string", description: "Engagement this decision belongs to." },
        title: { type: "string", description: "Short imperative title (≤80 chars)." },
        summary: { type: "string", description: "One-paragraph recommendation summary." },
        rationale: { type: "string", description: "Why this option, why now. Cite artifacts + evidence ids inline." },
        riskTier: { type: "string", description: "low / medium / high" },
        confidence: { type: "number", description: "Self-rated confidence 0–1." },
        options: {
          type: "array",
          description: "2–3 options. Exactly one must have isDefault=true.",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              description: { type: "string" },
              isDefault: { type: "boolean" },
            },
            required: ["label", "description"],
          },
        },
        artifactIds: {
          type: "array",
          description: "Artifact ids the recommendation rests on.",
          items: { type: "string" },
        },
        evidenceIds: {
          type: "array",
          description: "Evidence ids cited in the rationale.",
          items: { type: "string" },
        },
      },
      required: [
        "engagementId",
        "title",
        "summary",
        "rationale",
        "riskTier",
        "confidence",
        "options",
        "artifactIds",
        "evidenceIds",
      ],
    },
  },
];

// ── Tool input schemas (typed) ──────────────────────────────────

export interface SearchArtifactsInput {
  engagementId?: string;
  reviewState?: string;
  limit?: number;
}
export interface ReadDecisionInput {
  decisionId: string;
}
export interface SummarizeSignalsInput {
  limit?: number;
  kind?: string;
  severity?: string;
}
export interface CiteEvidenceInput {
  evidenceIds: string[];
}
export interface ProposeDecisionInput {
  engagementId: string;
  title: string;
  summary: string;
  rationale: string;
  riskTier: RiskTier;
  confidence: number;
  options: Array<{ label: string; description: string; isDefault?: boolean }>;
  artifactIds: string[];
  evidenceIds: string[];
}

export interface ToolExecutionContext {
  repository: PortalRepository;
  workspaceId: string;
  /** Identifier used as `proposedBy` and `actor` on the decision/audit row. */
  agentId: string;
  agentDisplayName: string;
}

export interface ToolExecutionResult {
  toolName: string;
  output: string;
  isError: boolean;
  /** Populated when propose_decision runs successfully. */
  proposedDecisionId?: string;
}

export async function executeTool(
  toolName: string,
  input: unknown,
  ctx: ToolExecutionContext,
): Promise<ToolExecutionResult> {
  try {
    switch (toolName) {
      case "search_artifacts":
        return ok(toolName, await searchArtifacts(input as SearchArtifactsInput, ctx));
      case "read_decision":
        return ok(toolName, await readDecision(input as ReadDecisionInput, ctx));
      case "summarize_signals":
        return ok(toolName, await summarizeSignals(input as SummarizeSignalsInput, ctx));
      case "cite_evidence":
        return ok(toolName, await citeEvidence(input as CiteEvidenceInput, ctx));
      case "propose_decision": {
        const result = await proposeDecision(input as ProposeDecisionInput, ctx);
        return {
          toolName,
          output: JSON.stringify({ ok: true, decisionId: result.id, status: result.status }),
          isError: false,
          proposedDecisionId: result.id,
        };
      }
      default:
        return error(toolName, `Unknown tool: ${toolName}`);
    }
  } catch (err) {
    return error(toolName, err instanceof Error ? err.message : String(err));
  }
}

function ok(toolName: string, payload: unknown): ToolExecutionResult {
  return { toolName, output: JSON.stringify(payload), isError: false };
}
function error(toolName: string, message: string): ToolExecutionResult {
  return { toolName, output: JSON.stringify({ error: message }), isError: true };
}

// ── Tool implementations ──────────────────────────────────────

async function searchArtifacts(
  input: SearchArtifactsInput,
  ctx: ToolExecutionContext,
): Promise<Pick<Artifact, "id" | "engagementId" | "name" | "type" | "reviewState" | "canonical" | "description" | "ownerName">[]> {
  const artifacts = await ctx.repository.listArtifacts(ctx.workspaceId);
  let filtered = artifacts;
  if (input.engagementId) {
    filtered = filtered.filter((a) => a.engagementId === input.engagementId);
  }
  if (input.reviewState) {
    filtered = filtered.filter((a) => a.reviewState === input.reviewState);
  }
  filtered = filtered
    .sort((a, b) => b.lastReviewedAt.getTime() - a.lastReviewedAt.getTime())
    .slice(0, input.limit ?? 6);
  return filtered.map(({ id, engagementId, name, type, reviewState, canonical, description, ownerName }) => ({
    id,
    engagementId,
    name,
    type,
    reviewState,
    canonical,
    description,
    ownerName,
  }));
}

async function readDecision(input: ReadDecisionInput, ctx: ToolExecutionContext): Promise<Decision | { error: string }> {
  const decisions = await ctx.repository.listDecisions(ctx.workspaceId);
  const target = decisions.find((d) => d.id === input.decisionId);
  if (!target) return { error: `Decision not found: ${input.decisionId}` };
  return target;
}

async function summarizeSignals(
  input: SummarizeSignalsInput,
  ctx: ToolExecutionContext,
): Promise<Pick<Signal, "id" | "kind" | "severity" | "title" | "detail" | "engagementId" | "capturedAt">[]> {
  const signals = await ctx.repository.listSignals(ctx.workspaceId);
  let filtered = signals;
  if (input.kind) filtered = filtered.filter((s) => s.kind === input.kind);
  if (input.severity) filtered = filtered.filter((s) => s.severity === input.severity);
  return filtered
    .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime())
    .slice(0, input.limit ?? 8)
    .map(({ id, kind, severity, title, detail, engagementId, capturedAt }) => ({
      id,
      kind,
      severity,
      title,
      detail,
      engagementId,
      capturedAt,
    }));
}

async function citeEvidence(input: CiteEvidenceInput, ctx: ToolExecutionContext): Promise<Evidence[]> {
  const evidence = await ctx.repository.listEvidence(ctx.workspaceId);
  return evidence.filter((e) => input.evidenceIds.includes(e.id));
}

async function proposeDecision(input: ProposeDecisionInput, ctx: ToolExecutionContext): Promise<Decision> {
  if (!Array.isArray(input.options) || input.options.length < 2) {
    throw new Error("propose_decision requires at least 2 options.");
  }
  if (!input.options.some((o) => o.isDefault)) {
    input.options[0].isDefault = true;
  }
  const decision = await ctx.repository.proposeDecision({
    engagementId: input.engagementId,
    workspaceId: ctx.workspaceId,
    title: input.title,
    riskTier: input.riskTier,
    proposedBy: ctx.agentId,
    actorDisplayName: ctx.agentDisplayName,
    actorKind: "agent",
    recommendation: {
      summary: input.summary,
      rationale: input.rationale,
      confidence: clamp01(input.confidence),
      options: input.options.map((o) => ({
        label: o.label,
        description: o.description,
        isDefault: Boolean(o.isDefault),
      })),
      defaultChoice: input.options.find((o) => o.isDefault)?.label ?? input.options[0].label,
    },
    artifactIds: input.artifactIds,
    evidenceIds: input.evidenceIds,
  });
  return decision;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
