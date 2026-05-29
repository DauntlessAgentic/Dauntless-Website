// ============================================================
// Auth runtime (Phase 2)
//
// The portal does not ship its own production auth in Phase 2.
// It ships the *gate* — a typed `Membership` resolution layer that
// the UI uses to decide what to render, plus a dev-bypass escape
// hatch so the demo runs without OAuth configuration.
//
// Production never falls back to dev-bypass implicitly. A public demo
// must opt in with PORTAL_DEMO_MODE=true so launch deployments cannot
// accidentally expose owner/executive impersonation.
//
// When Phase 2.1 lands the real OAuth round-trip (NextAuth v5 or
// Supabase Auth), only this file needs to learn about the
// provider; the membership-gate downstream is provider-agnostic.
// ============================================================

export type AuthMode = "dev-bypass" | "demo" | "oauth-configured" | "auth-unavailable";

export interface AuthRuntimeState {
  mode: AuthMode;
  isConfigured: boolean;
  isDevBypassEnabled: boolean;
  isDemoMode: boolean;
  /** Member ID to impersonate when dev-bypass is on. */
  devBypassMemberId: string | null;
  /** Default cookie name for the role-switcher in dev-bypass mode. */
  roleCookieName: string;
}

const DEFAULT_ROLE_COOKIE = "portal-role";

let cachedState: AuthRuntimeState | null = null;

export function getAuthRuntimeState(
  env: NodeJS.ProcessEnv = process.env,
): AuthRuntimeState {
  if (cachedState && env === process.env) return cachedState;
  const state = computeState(env);
  if (env === process.env) cachedState = state;
  return state;
}

/** Test-only escape hatch. */
export function __resetAuthRuntimeState(): void {
  cachedState = null;
}

function computeState(env: NodeJS.ProcessEnv): AuthRuntimeState {
  const hasGoogleOAuth = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
  const hasSupabaseAuth = Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const hasOAuth = hasGoogleOAuth || hasSupabaseAuth;
  const isProduction = env.NODE_ENV === "production";
  const isDemoMode = env.PORTAL_DEMO_MODE === "true";

  const isDevBypassEnabled = isProduction
    ? isDemoMode
    : !hasOAuth || env.PORTAL_DEV_BYPASS === "true";

  const mode: AuthMode = hasOAuth && !isDevBypassEnabled
    ? "oauth-configured"
    : isDemoMode
      ? "demo"
      : isDevBypassEnabled
        ? "dev-bypass"
        : "auth-unavailable";

  return {
    mode,
    isConfigured: hasOAuth,
    isDevBypassEnabled,
    isDemoMode,
    devBypassMemberId: env.PORTAL_DEV_BYPASS_MEMBER_ID ?? null,
    roleCookieName: env.PORTAL_ROLE_COOKIE ?? DEFAULT_ROLE_COOKIE,
  };
}
