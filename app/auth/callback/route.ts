/**
 * Supabase OAuth callback handler.
 *
 * Supabase redirects here after Google OAuth completes.
 * Exchange the code for a session, then redirect to the app.
 *
 * TO ACTIVATE:
 * 1. Install: npm install @supabase/ssr
 * 2. Uncomment the real implementation below
 * 3. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  // ── Real implementation (uncomment when Supabase is configured) ──
  // import { createServerClient } from "@supabase/ssr";
  // import { cookies } from "next/headers";
  //
  // const cookieStore = await cookies();
  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  // );
  // const { error } = await supabase.auth.exchangeCodeForSession(code);
  // if (!error) return NextResponse.redirect(`${origin}${next}`);

  // Stub: just redirect to dashboard
  console.warn("[Auth stub] OAuth callback hit — configure Supabase to handle real auth");
  return NextResponse.redirect(`${origin}/dashboard`);
}
