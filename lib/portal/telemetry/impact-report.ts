// ============================================================
// Quarterly Impact Report generator (Phase 6)
//
// Assembles a board-ready briefing from telemetry + repository
// state. The Report Builder agent normally drafts the narrative;
// this module gives the agent a structured input package (the
// "Impact Report payload") and renders a Markdown fallback when
// no agent has been engaged.
//
// Phase 6.0 keeps the report transient (generated per request).
// Phase 6.1 will persist it as an Artifact in the workspace so
// the Bookshelf compounds quarterly briefings.
// ============================================================

// Server-only by convention.

import { getPortalRepository } from "@/lib/portal/repositories";
import type {
  Artifact,
  Decision,
  Engagement,
  KnowledgeItem,
  Metric,
} from "@/lib/portal/types";

import { listPortalEvents, type PortalEvent } from "./event-bus";
import { computeDerivedMetrics, type DerivedMetric } from "./metrics";

export interface ImpactReportSection {
  heading: string;
  body: string;
}

export interface ImpactReportInput {
  workspaceName: string;
  generatedAt: Date;
  horizonDays: number;
  metrics: DerivedMetric[];
  staticMetrics: Metric[];
  engagements: Engagement[];
  topDecisions: Decision[];
  canonicalArtifacts: Artifact[];
  canonicalKnowledge: KnowledgeItem[];
  agentActivity: {
    totalRuns: number;
    decisionsProposed: number;
    canonicalPromotions: number;
    handoffs: number;
  };
  recentEvents: PortalEvent[];
}

export interface ImpactReportOutput {
  input: ImpactReportInput;
  sections: ImpactReportSection[];
  markdown: string;
}

export async function generateImpactReport(workspaceId: string, horizonDays = 28): Promise<ImpactReportOutput> {
  const repo = getPortalRepository();
  const [workspace, engagements, decisions, artifacts, knowledge, metrics] = await Promise.all([
    repo.getDefaultWorkspace(),
    repo.listEngagements(workspaceId),
    repo.listDecisions(workspaceId),
    repo.listArtifacts(workspaceId),
    repo.listKnowledge(workspaceId),
    repo.listMetrics(workspaceId),
  ]);

  const derived = computeDerivedMetrics(workspaceId);
  const sinceDate = new Date(Date.now() - horizonDays * 24 * 60 * 60 * 1000);
  const recentEvents = listPortalEvents({ workspaceId, since: sinceDate });

  const topDecisions = decisions
    .filter((d) => d.status !== "superseded")
    .sort((a, b) => decisionRank(b) - decisionRank(a))
    .slice(0, 5);

  const canonicalArtifacts = artifacts.filter((a) => a.canonical);
  const canonicalKnowledge = knowledge.filter((k) => k.canonical);

  const totalRuns = recentEvents.filter((e) => e.kind === "agent-run-completed").length;
  const decisionsProposed = recentEvents.filter((e) => e.kind === "decision-proposed").length;
  const canonicalPromotions = recentEvents.filter((e) => e.kind === "artifact-promoted-canonical").length;
  const handoffs = recentEvents.filter((e) => e.kind === "agent-handoff").length;

  const input: ImpactReportInput = {
    workspaceName: workspace.name,
    generatedAt: new Date(),
    horizonDays,
    metrics: derived,
    staticMetrics: metrics,
    engagements,
    topDecisions,
    canonicalArtifacts,
    canonicalKnowledge,
    agentActivity: { totalRuns, decisionsProposed, canonicalPromotions, handoffs },
    recentEvents: recentEvents.slice(0, 50),
  };

  const sections = renderSections(input);
  return {
    input,
    sections,
    markdown: renderMarkdown(input, sections),
  };
}

function decisionRank(d: Decision): number {
  const tierWeight = d.riskTier === "high" ? 100 : d.riskTier === "medium" ? 50 : 10;
  const statusWeight = d.status === "pending-approval" ? 50 : d.status === "approved" ? 30 : 5;
  return tierWeight + statusWeight + Math.round(d.recommendation.confidence * 30);
}

function renderSections(input: ImpactReportInput): ImpactReportSection[] {
  const lines: ImpactReportSection[] = [];

  lines.push({
    heading: "1. Executive summary",
    body: [
      `Over the last ${input.horizonDays} days, ${input.workspaceName} resolved ${input.agentActivity.decisionsProposed} new proposals and promoted ${input.agentActivity.canonicalPromotions} artifacts to canonical.`,
      `The fleet executed ${input.agentActivity.totalRuns} agent runs with ${input.agentActivity.handoffs} separation-of-powers handoffs.`,
      "",
      `Three engagements remain live: ${input.engagements.map((e) => e.name).join("; ")}.`,
    ].join("\n"),
  });

  lines.push({
    heading: "2. Outcome metrics",
    body: input.metrics
      .map((m) => `- **${m.label}** — ${m.unit === "percent" ? `${m.current}%` : m.unit === "days" ? `${m.current}d` : m.current}. ${m.narrative}`)
      .join("\n"),
  });

  lines.push({
    heading: "3. Decisions",
    body: input.topDecisions.length === 0
      ? "_No tracked decisions in this window._"
      : input.topDecisions
          .map((d) => `- **${d.title}** — ${d.riskTier} risk · ${d.status.replace("-", " ")} · confidence ${Math.round(d.recommendation.confidence * 100)}%. ${d.recommendation.summary}`)
          .join("\n"),
  });

  lines.push({
    heading: "4. Canonical knowledge",
    body: input.canonicalArtifacts.length + input.canonicalKnowledge.length === 0
      ? "_No canonical artifacts or knowledge promoted yet._"
      : [
          `${input.canonicalArtifacts.length} canonical artifact${input.canonicalArtifacts.length === 1 ? "" : "s"}:`,
          ...input.canonicalArtifacts.slice(0, 6).map((a) => `- ${a.name} (${a.type})`),
          `${input.canonicalKnowledge.length} canonical knowledge item${input.canonicalKnowledge.length === 1 ? "" : "s"}:`,
          ...input.canonicalKnowledge.slice(0, 6).map((k) => `- ${k.title} (${k.memoryTier})`),
        ].join("\n"),
  });

  lines.push({
    heading: "5. Agent fleet activity",
    body: [
      `- Total agent runs: ${input.agentActivity.totalRuns}`,
      `- Decisions proposed by agents: ${input.agentActivity.decisionsProposed}`,
      `- Canonical promotions: ${input.agentActivity.canonicalPromotions}`,
      `- Inter-archetype handoffs: ${input.agentActivity.handoffs}`,
    ].join("\n"),
  });

  return lines;
}

function renderMarkdown(input: ImpactReportInput, sections: ImpactReportSection[]): string {
  const header = `# Quarterly Impact Report — ${input.workspaceName}\n\n_Generated ${input.generatedAt.toLocaleDateString()} from the portal telemetry bus._\n\nHorizon: last ${input.horizonDays} days.\n\n---\n`;
  const body = sections.map((s) => `## ${s.heading}\n\n${s.body}`).join("\n\n");
  return `${header}\n${body}\n`;
}
