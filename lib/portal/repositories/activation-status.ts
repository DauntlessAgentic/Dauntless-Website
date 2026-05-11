// ============================================================
// Repository activation status (Phase 2)
//
// Surfaces "which backend is wired, what's missing" to the portal
// Governance page. The idea is that an operator landing on the
// portal can tell at a glance whether they are looking at the
// deterministic seed or a real Supabase-backed workspace.
// ============================================================

import type { PortalRepository, RepositoryActivationStatus } from "./types";

export function computeActivationStatus(
  repository: PortalRepository,
  env: NodeJS.ProcessEnv = process.env,
): RepositoryActivationStatus {
  const gaps: string[] = [];

  const hasSupabaseUrl = Boolean(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseKey = Boolean(
    env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const hasPortalDbUrl = Boolean(env.PORTAL_DATABASE_URL);

  if (repository.kind === "in-memory") {
    if (!hasSupabaseUrl && !hasPortalDbUrl) {
      gaps.push("Set SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY) or PORTAL_DATABASE_URL to enable persistence.");
    } else if (hasSupabaseUrl && !hasSupabaseKey) {
      gaps.push("SUPABASE_URL is set but no service-role / anon key is configured.");
    }
    return {
      repositoryId: repository.id,
      repositoryKind: repository.kind,
      isHosted: false,
      isWritable: true,
      configGaps: gaps,
      notes:
        "Portal is running against the deterministic in-memory seed. Mutations persist for the lifetime of the server process only.",
    };
  }

  return {
    repositoryId: repository.id,
    repositoryKind: repository.kind,
    isHosted: true,
    isWritable: true,
    configGaps: gaps,
    notes: `Portal is running against ${repository.label}.`,
  };
}
