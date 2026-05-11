// ============================================================
// Auth session (Phase 2)
//
// `getCurrentMembership(workspaceId)` returns the typed Membership
// context the portal UI should render against. Every server
// component that needs role-aware behaviour calls this.
//
// In Phase 2 the resolution is:
//   1. If dev-bypass is active (default), read the role-switcher
//      cookie. Fall back to "executive".
//   2. If real OAuth is wired (Phase 2.1+), resolve the session,
//      look up the membership by email.
//
// The returned context is a tagged union; consumers should branch
// on `status` rather than nil-check fields.
// ============================================================

import { cookies } from "next/headers";

import { getPortalRepository } from "@/lib/portal/repositories";
import type { Membership, MembershipRole } from "@/lib/portal/types";

import { getAuthRuntimeState } from "./runtime";

export type MembershipContextStatus =
  | "member"
  | "unmapped"
  | "unauthenticated"
  | "dev-bypass"
  | "auth-unavailable";

interface BaseMembershipContext<TStatus extends MembershipContextStatus> {
  status: TStatus;
  workspaceId: string;
  /** Resolved membership when the user is mapped onto one. */
  membership: Membership | null;
  /** Effective role for the UI to gate on. Defaults to "viewer" when unresolved. */
  role: MembershipRole;
  /** Human-readable display name. */
  displayName: string;
  /** Whether the role originates from a real auth handshake. */
  source: "oauth" | "dev-bypass" | "fallback";
}

export type MembershipContext =
  | BaseMembershipContext<"member">
  | BaseMembershipContext<"dev-bypass">
  | BaseMembershipContext<"unmapped">
  | BaseMembershipContext<"unauthenticated">
  | BaseMembershipContext<"auth-unavailable">;

const VALID_ROLES: MembershipRole[] = [
  "owner",
  "executive",
  "lead",
  "viewer",
  "auditor",
];

function parseRole(value: string | undefined): MembershipRole | null {
  if (!value) return null;
  return VALID_ROLES.find((role) => role === value) ?? null;
}

/**
 * Resolve the active membership for the given workspace.
 *
 * Server-only. Calls into `next/headers#cookies()` and must run in a
 * request scope (server component / route handler / server action).
 */
export async function getCurrentMembership(
  workspaceId: string,
): Promise<MembershipContext> {
  const auth = getAuthRuntimeState();
  const repository = getPortalRepository();
  const memberships = await repository.listMemberships(workspaceId);

  if (auth.mode === "auth-unavailable") {
    return {
      status: "auth-unavailable",
      workspaceId,
      membership: null,
      role: "viewer",
      displayName: "Anonymous",
      source: "fallback",
    };
  }

  // Read the role-switcher cookie (dev-bypass + Dauntless impersonation).
  const cookieStore = await cookies();
  const cookieRole = parseRole(cookieStore.get(auth.roleCookieName)?.value);

  if (auth.mode === "dev-bypass") {
    const fallbackMembership =
      memberships.find((m) => m.role === (cookieRole ?? "executive")) ??
      memberships.find((m) => m.role === "executive") ??
      memberships[0];

    const effectiveRole = cookieRole ?? fallbackMembership?.role ?? "executive";
    const displayName = fallbackMembership?.userName ?? "Dauntless (dev-bypass)";

    return {
      status: "dev-bypass",
      workspaceId,
      membership: fallbackMembership ?? null,
      role: effectiveRole,
      displayName,
      source: "dev-bypass",
    };
  }

  // Phase 2.1+: real OAuth resolution lands here.
  // For now, treat oauth-configured-but-not-yet-implemented as unauthenticated
  // unless a cookie is present.
  if (!cookieRole) {
    return {
      status: "unauthenticated",
      workspaceId,
      membership: null,
      role: "viewer",
      displayName: "Anonymous",
      source: "fallback",
    };
  }

  const matched = memberships.find((m) => m.role === cookieRole);
  if (!matched) {
    return {
      status: "unmapped",
      workspaceId,
      membership: null,
      role: cookieRole,
      displayName: "Unmapped session",
      source: "oauth",
    };
  }

  return {
    status: "member",
    workspaceId,
    membership: matched,
    role: matched.role,
    displayName: matched.userName,
    source: "oauth",
  };
}
