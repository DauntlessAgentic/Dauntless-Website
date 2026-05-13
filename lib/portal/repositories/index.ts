// ============================================================
// Portal repository factory.
//
// Single entry point for fetching portal data.  Chooses a
// backend at module load based on PORTAL_REPOSITORY_BACKEND.
//
// Defaults to "mock" so the portal is always functional with
// no configuration.  Set "supabase" once the Supabase backend
// in ./supabase.ts is wired and the schema has been applied.
// ============================================================

import { mockPortalRepository } from "./mock";
import { supabasePortalRepository } from "./supabase";
import type { PortalRepository, RepositoryBackend } from "./types";

function selectBackend(): RepositoryBackend {
  const raw = process.env.PORTAL_REPOSITORY_BACKEND?.toLowerCase().trim();
  if (raw === "supabase") return "supabase";
  return "mock";
}

const BACKENDS: Record<RepositoryBackend, PortalRepository> = {
  mock:     mockPortalRepository,
  supabase: supabasePortalRepository,
};

export const portalRepository: PortalRepository = BACKENDS[selectBackend()];

export { mockPortalRepository, supabasePortalRepository };
export type { PortalRepository, RepositoryBackend } from "./types";
