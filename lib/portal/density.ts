// ============================================================
// Density mode (comfortable vs. compact)
//
// Advisory-board action #21: Jim found the default density too
// tight; Priya prefers compact. We persist the choice in a cookie
// and apply it as a body class so every consumer can opt in via
// `[data-density="comfortable"] selector { ... }`.
// ============================================================

export type DensityMode = "comfortable" | "compact";

export const DENSITY_COOKIE = "dauntless-density";

export function isDensityMode(value: unknown): value is DensityMode {
  return value === "comfortable" || value === "compact";
}

export function defaultDensity(): DensityMode {
  return "compact";
}
