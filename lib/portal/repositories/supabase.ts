// ============================================================
// Supabase backend for the portal repository layer — STUB.
//
// v1 ships the interface implementation only.  Activating it
// requires:
//   1. Add @supabase/supabase-js and @supabase/ssr to deps.
//   2. Replace the throw-on-call methods below with real
//      Supabase client calls against supabase/migrations 0001+0002.
//   3. Set PORTAL_REPOSITORY_BACKEND=supabase plus the standard
//      NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
//      env vars in .env.local.
//
// Until then the repository factory routes to the mock backend
// by default.  Importing this module is safe; calling any of its
// methods throws a clear, actionable error.
// ============================================================

import type {
  PortalRepository,
} from "./types";

function notConfigured(): never {
  throw new Error(
    "Supabase backend is not configured. Set PORTAL_REPOSITORY_BACKEND=mock, " +
      "or wire @supabase/supabase-js in lib/portal/repositories/supabase.ts.",
  );
}

export const supabasePortalRepository: PortalRepository = {
  snapshot: () => notConfigured(),
  organizations: {
    get: () => notConfigured(),
  },
  workspaces: {
    get: () => notConfigured(),
    byOrganization: () => notConfigured(),
  },
  memberships: {
    forWorkspace: () => notConfigured(),
    forUser: () => notConfigured(),
  },
  engagements: {
    get: () => notConfigured(),
    forWorkspace: () => notConfigured(),
  },
  artifacts: {
    get: () => notConfigured(),
    forWorkspace: () => notConfigured(),
    forEngagement: () => notConfigured(),
    canonical: () => notConfigured(),
  },
  decisions: {
    get: () => notConfigured(),
    forWorkspace: () => notConfigured(),
    forEngagement: () => notConfigured(),
    byStatus: () => notConfigured(),
  },
  tasks: {
    forWorkspace: () => notConfigured(),
    forEngagement: () => notConfigured(),
  },
  signals: {
    forWorkspace: () => notConfigured(),
  },
  evidence: {
    get: () => notConfigured(),
    forWorkspace: () => notConfigured(),
    byIds: () => notConfigured(),
  },
  agents: {
    get: () => notConfigured(),
    forWorkspace: () => notConfigured(),
  },
  conversations: {
    forAgent: () => notConfigured(),
    forWorkspace: () => notConfigured(),
  },
  knowledge: {
    forWorkspace: () => notConfigured(),
    byShelf: () => notConfigured(),
  },
  metrics: {
    forWorkspace: () => notConfigured(),
    byKey: () => notConfigured(),
  },
  nextBestActions: {
    forWorkspace: () => notConfigured(),
  },
  auditLog: {
    forWorkspace: () => notConfigured(),
  },
};
