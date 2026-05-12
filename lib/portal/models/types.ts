// ============================================================
// Per-workspace model registry (Phase 13.0)
//
// Workspaces can register baseline models + fine-tuned variants
// produced from their own canonical layer. Phase 13.0 ships the
// shape + a deterministic fine-tune simulator (eval lift, drift
// detection). Phase 13.1 wires real fine-tune jobs.
// ============================================================

export type ModelKind = "baseline" | "fine-tuned";

export type ModelVariantStatus =
  | "training"
  | "evaluating"
  | "ready"
  | "active"
  | "rolled-back"
  | "failed";

export interface ModelVariant {
  id: string;
  workspaceId: string;
  baseModel: string;
  kind: ModelKind;
  label: string;
  description: string;
  status: ModelVariantStatus;
  createdAt: Date;
  /** Eval against the workspace's canonical decision set, 0–1. */
  evalScore: number;
  /** Eval against the same set for the baseline; provides a delta. */
  baselineEvalScore: number;
  /** Source artifacts used to seed the fine-tune. */
  sourceArtifactIds: string[];
  /** Data-residency boundary for training data. */
  dataResidency: "ca" | "us" | "eu";
  /** Whether this variant is the workspace's active routing target. */
  isRouted: boolean;
  /** Last-detected drift score (0–1; higher = more drift). */
  driftScore: number;
}

export interface FineTuneProposal {
  baseModel: string;
  label: string;
  description: string;
  sourceArtifactIds: string[];
  dataResidency: "ca" | "us" | "eu";
}

export interface RollbackInput {
  variantId: string;
  reason?: string;
}
