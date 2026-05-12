// ============================================================
// Portal server-side data loader (Phase 2)
//
// Every portal server-component page calls `loadPortalContext()`
// to get the typed snapshot + membership context for the active
// workspace. Centralizing this keeps page wrappers thin and gives
// us a single place to layer caching, telemetry, and (eventually)
// per-engagement scoping.
// ============================================================

import "server-only";

import { getCurrentMembership, type MembershipContext } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";
import type { PortalSnapshot } from "@/lib/portal/types";

export interface PortalContext {
  snapshot: PortalSnapshot;
  membership: MembershipContext;
}

export async function loadPortalContext(): Promise<PortalContext> {
  const repository = getPortalRepository();
  const workspace = await repository.getDefaultWorkspace();
  const [snapshot, membership] = await Promise.all([
    repository.getSnapshot(workspace.id),
    getCurrentMembership(workspace.id),
  ]);
  return { snapshot, membership };
}
