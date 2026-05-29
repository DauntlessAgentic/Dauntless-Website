"use server";

// ============================================================
// Auth server actions (Phase 2)
//
// Role switching is a server action so the cookie write is
// auditable and runs through the same gate as any other mutation.
// ============================================================

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getAuthRuntimeState } from "./runtime";
import type { MembershipRole } from "@/lib/portal/types";

const VALID_ROLES: MembershipRole[] = [
  "owner",
  "executive",
  "lead",
  "viewer",
  "auditor",
];

export async function switchRole(role: string): Promise<void> {
  const auth = getAuthRuntimeState();
  if (!auth.isDevBypassEnabled) {
    throw new Error("Role switching is only available in dev-bypass or demo mode.");
  }
  const parsed = VALID_ROLES.find((r) => r === role);
  if (!parsed) {
    throw new Error(`Unknown role: ${role}`);
  }
  const store = await cookies();
  // Server-only read path (lib/auth/session.ts). Client JS never needs
  // direct access, so httpOnly + secure are safe. (Audit §3.1.B)
  store.set(auth.roleCookieName, parsed, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/portal", "layout");
}
