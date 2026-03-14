/**
 * Supabase client stub for App Chassis.
 *
 * TO ACTIVATE:
 * 1. Create a project at https://supabase.com
 * 2. Copy your project URL and anon key from Settings → API
 * 3. Add to .env.local:
 *      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 * 4. Enable Google OAuth in Supabase dashboard:
 *      Authentication → Providers → Google
 *      Add your Google Client ID + Secret (from console.cloud.google.com)
 * 5. Uncomment the real client below and remove the stub.
 *
 * CLOUDFLARE NOTE:
 * If using Cloudflare for DNS, point your domain to Vercel's IP.
 * Do NOT enable Cloudflare Proxy (orange cloud) on the Vercel CNAME —
 * it breaks Next.js server-side headers. Use DNS-only (grey cloud).
 * Cloudflare Workers/R2/Pages are separate and compose fine.
 */

// ── Real client (uncomment when env vars are set) ──────────
// import { createBrowserClient } from "@supabase/ssr";
//
// export const supabase = createBrowserClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// ── Stub client (used until Supabase is configured) ─────────
export const supabase = {
  auth: {
    signInWithOAuth: async ({ provider }: { provider: string }) => {
      console.warn(`[Auth stub] signInWithOAuth called with provider: ${provider}`);
      console.warn("Configure Supabase to enable real authentication.");
      return { error: { message: "Auth not configured — see lib/auth/supabase.ts" } };
    },
    signOut: async () => {
      console.warn("[Auth stub] signOut called");
      return { error: null };
    },
    getUser: async () => {
      return { data: { user: null }, error: null };
    },
    onAuthStateChange: (_cb: unknown) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
};

// ── Auth helpers ─────────────────────────────────────────────
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    // options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
