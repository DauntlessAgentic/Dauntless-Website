// ============================================================
// Portal repository factory (Phase 2)
//
// Single entry point for the portal UI:
//
//   import { getPortalRepository } from "@/lib/portal/repositories";
//   const repo = getPortalRepository();
//   const snapshot = await repo.getSnapshot(workspace.id);
//
// The factory selects an implementation based on environment
// configuration. The in-memory fallback is always available so the
// portal boots without infrastructure.
// ============================================================

import { InMemoryPortalRepository } from "./in-memory";
import type { PortalRepository } from "./types";

let cached: PortalRepository | null = null;

/**
 * Returns the active portal repository. The first call constructs
 * the repository; subsequent calls return the cached instance so
 * in-process state (e.g. recorded approvals during dev) persists
 * for the lifetime of the server.
 */
export function getPortalRepository(): PortalRepository {
  if (cached) return cached;
  cached = createRepository();
  return cached;
}

/**
 * Test-only escape hatch. Resets the cached repository so the next
 * call to {@link getPortalRepository} constructs a fresh instance
 * from the deterministic seed.
 */
export function __resetPortalRepository(): void {
  cached = null;
}

function createRepository(): PortalRepository {
  // In the future:
  //   if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  //     return new SupabasePortalRepository({ ... });
  //   }
  return new InMemoryPortalRepository();
}

export { InMemoryPortalRepository } from "./in-memory";
export { computeActivationStatus } from "./activation-status";
export type {
  PortalRepository,
  DecisionOutcomeInput,
  KnowledgePromotionInput,
  RepositoryActivationStatus,
} from "./types";
