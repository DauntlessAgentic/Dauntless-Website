// ============================================================
// Model variant store (Phase 13.0)
//
// In-process store of per-workspace baseline + fine-tuned model
// variants. Each workspace ships with a deterministic seed:
// baseline Claude Sonnet 4.6 + a fine-tuned variant trained on
// the workspace's canonical decision set with positive eval lift.
// ============================================================

import type { FineTuneProposal, ModelVariant, RollbackInput } from "./types";

const variants: ModelVariant[] = [];
let counter = 0;
let seeded = false;

function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

function ensureSeed(workspaceId: string): void {
  if (seeded) return;
  variants.push(
    {
      id: "mv-baseline-sonnet",
      workspaceId,
      baseModel: "claude-sonnet-4-6",
      kind: "baseline",
      label: "Baseline · Claude Sonnet 4.6",
      description: "Workspace baseline. Routes by default unless a fine-tune is promoted.",
      status: "active",
      createdAt: new Date("2026-03-01T12:00:00Z"),
      evalScore: 0.71,
      baselineEvalScore: 0.71,
      sourceArtifactIds: [],
      dataResidency: "ca",
      isRouted: true,
      driftScore: 0.04,
    },
    {
      id: "mv-ft-tbs-q2",
      workspaceId,
      baseModel: "claude-sonnet-4-6",
      kind: "fine-tuned",
      label: "TBS · Governance-tuned (Q2 dataset)",
      description: "Fine-tuned on the workspace's canonical Governance Framework + Decision Architecture artifacts.",
      status: "ready",
      createdAt: new Date("2026-04-22T12:00:00Z"),
      evalScore: 0.81,
      baselineEvalScore: 0.71,
      sourceArtifactIds: ["art-governance", "art-decision-architecture", "art-operating-model"],
      dataResidency: "ca",
      isRouted: false,
      driftScore: 0.08,
    },
  );
  seeded = true;
}

export function listModelVariants(workspaceId: string): ModelVariant[] {
  ensureSeed(workspaceId);
  return variants
    .filter((v) => v.workspaceId === workspaceId)
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((v) => ({ ...v, sourceArtifactIds: [...v.sourceArtifactIds] }));
}

export function getActiveVariant(workspaceId: string): ModelVariant | null {
  ensureSeed(workspaceId);
  return variants.find((v) => v.workspaceId === workspaceId && v.isRouted) ?? null;
}

export function proposeFineTune(workspaceId: string, input: FineTuneProposal): ModelVariant {
  ensureSeed(workspaceId);
  // Deterministic simulated eval lift — 0.05 baseline + 0.03 per source artifact, capped at 0.95.
  const baselineEval = 0.71;
  const evalScore = Math.min(0.95, baselineEval + 0.05 + 0.03 * input.sourceArtifactIds.length);
  const variant: ModelVariant = {
    id: generateId("mv-ft"),
    workspaceId,
    baseModel: input.baseModel,
    kind: "fine-tuned",
    label: input.label,
    description: input.description,
    status: "training",
    createdAt: new Date(),
    evalScore,
    baselineEvalScore: baselineEval,
    sourceArtifactIds: [...input.sourceArtifactIds],
    dataResidency: input.dataResidency,
    isRouted: false,
    driftScore: 0,
  };
  variants.push(variant);
  // Simulate the training → ready transition synchronously.
  variant.status = "ready";
  return { ...variant, sourceArtifactIds: [...variant.sourceArtifactIds] };
}

export function routeToVariant(workspaceId: string, variantId: string): ModelVariant {
  ensureSeed(workspaceId);
  const candidate = variants.find((v) => v.id === variantId && v.workspaceId === workspaceId);
  if (!candidate) throw new Error(`Model variant not found: ${variantId}`);
  if (candidate.status !== "ready" && candidate.status !== "active") {
    throw new Error(`Cannot route to a variant in status ${candidate.status}.`);
  }
  // Quality gate: a fine-tuned variant must out-perform baseline before it can replace the default.
  if (candidate.kind === "fine-tuned" && candidate.evalScore < candidate.baselineEvalScore + 0.02) {
    throw new Error("Fine-tuned variant does not outperform baseline by ≥2 points; routing blocked.");
  }
  for (const v of variants) {
    if (v.workspaceId === workspaceId) {
      v.isRouted = v.id === variantId;
      if (v.id === variantId) v.status = "active";
      else if (v.status === "active") v.status = "ready";
    }
  }
  return { ...candidate, sourceArtifactIds: [...candidate.sourceArtifactIds] };
}

export function rollbackVariant(workspaceId: string, input: RollbackInput): void {
  ensureSeed(workspaceId);
  const target = variants.find((v) => v.id === input.variantId && v.workspaceId === workspaceId);
  if (!target) throw new Error(`Model variant not found: ${input.variantId}`);
  target.status = "rolled-back";
  target.isRouted = false;
  // Re-route to the most recently active baseline.
  const baseline = variants
    .filter((v) => v.workspaceId === workspaceId && v.kind === "baseline")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  if (baseline) {
    baseline.isRouted = true;
    baseline.status = "active";
  }
}

export function recordDriftSample(workspaceId: string, variantId: string, drift: number): void {
  const variant = variants.find((v) => v.id === variantId && v.workspaceId === workspaceId);
  if (!variant) return;
  variant.driftScore = Math.max(0, Math.min(1, drift));
  // Auto-rollback if drift > 0.4 on a fine-tuned variant.
  if (variant.kind === "fine-tuned" && variant.driftScore > 0.4 && variant.isRouted) {
    rollbackVariant(workspaceId, { variantId, reason: "Auto-rollback: drift > 0.4." });
  }
}

/** Test-only escape hatch. */
export function __resetModelVariants(): void {
  variants.length = 0;
  counter = 0;
  seeded = false;
}
