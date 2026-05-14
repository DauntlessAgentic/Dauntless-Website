// ============================================================
// Membership gate (Phase 2)
//
// Pure functions that map (MembershipRole, action) → boolean.
// Pure so the same predicates can be used in:
//   - server components (deciding what UI to render)
//   - server actions (rejecting unauthorized mutations)
//   - client components (disabling controls)
//
// The portal role taxonomy:
//   owner      — Dauntless staff; full read + write + governance
//   executive  — Client decision-maker; can approve decisions, read everywhere
//   lead       — Client lead; can propose decisions, edit artifacts
//   viewer     — Read-only on most surfaces, no governance access
//   auditor    — Read everywhere + export audit log; cannot mutate artifacts
// ============================================================

import type { MembershipRole } from "@/lib/portal/types";

export type PortalSurface =
  | "command-center"
  | "engagements"
  | "deliverables"
  | "decisions"
  | "agents"
  | "knowledge"
  | "outcomes"
  | "governance";

export type PortalAction =
  | "approve-decision"
  | "defer-decision"
  | "reject-decision"
  | "edit-artifact"
  | "promote-knowledge"
  | "export-audit-log"
  | "grant-membership";

export function canRead(role: MembershipRole, surface: PortalSurface): boolean {
  if (role === "owner") return true;
  if (surface === "governance") {
    return role === "auditor" || role === "executive";
  }
  // All authenticated roles can read all other surfaces.
  return true;
}

export function canPerform(role: MembershipRole, action: PortalAction): boolean {
  switch (action) {
    case "approve-decision":
    case "defer-decision":
    case "reject-decision":
      // Owners can approve everything; executives approve client-facing
      // decisions; auditors cannot mutate.
      return role === "owner" || role === "executive";
    case "edit-artifact":
    case "promote-knowledge":
      return role === "owner" || role === "lead" || role === "executive";
    case "export-audit-log":
      return role === "owner" || role === "auditor" || role === "executive";
    case "grant-membership":
      return role === "owner";
    default:
      return false;
  }
}

export function describeRole(role: MembershipRole): string {
  switch (role) {
    case "owner": return "Dauntless · Engagement Owner";
    case "executive": return "Client · Executive Sponsor";
    case "lead": return "Client · Engagement Lead";
    case "viewer": return "Client · Read-only";
    case "auditor": return "Client · Audit & Compliance";
  }
}

/**
 * Plain-language label for a role, surfaced in UI chrome where the
 * full describeRole() string is too long. Use this in badges, dropdowns,
 * and short copy. The DB role taxonomy is unchanged — this is display
 * only. Advisory-board action #3.
 */
export function roleDisplayLabel(role: MembershipRole): string {
  switch (role) {
    case "owner": return "Owner";
    case "executive": return "Approver";
    case "lead": return "Manager";
    case "viewer": return "Read-only";
    case "auditor": return "Auditor";
  }
}

export function roleBadgeTone(
  role: MembershipRole,
): "accent" | "info" | "warning" | "success" | "default" {
  switch (role) {
    case "owner": return "accent";
    case "executive": return "success";
    case "lead": return "info";
    case "viewer": return "default";
    case "auditor": return "warning";
  }
}
