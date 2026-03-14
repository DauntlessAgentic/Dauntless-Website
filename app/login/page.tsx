"use client";
import React, { useState } from "react";
import { Cpu, Chrome } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signInWithGoogle } from "@/lib/auth/supabase";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, Supabase redirects to /auth/callback
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--app-bg] px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.10) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active]">
            <Cpu className="h-5 w-5 text-[--accent-vivid]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[--text-primary]">
              App <span className="text-[--accent-vivid]">Chassis</span>
            </h1>
            <p className="text-xs text-[--text-muted]">Sign in to your workspace</p>
          </div>
        </div>

        {/* Login card */}
        <div className="rounded-[--radius-xl] border border-[--border-default] bg-[--panel-bg] p-6 space-y-4">
          {/* Google OAuth */}
          <Button
            variant="secondary"
            size="md"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="h-4 w-4" />
            {loading ? "Redirecting…" : "Continue with Google"}
          </Button>

          {error && (
            <div className="rounded-[--radius-md] bg-[--danger-dim] border border-[--danger] px-3 py-2">
              <p className="text-xs text-[--danger]">{error}</p>
              {error.includes("not configured") && (
                <p className="text-[10px] text-[--text-muted] mt-1">
                  See <code className="font-mono">lib/auth/supabase.ts</code> to configure.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[10px] text-[--text-muted]">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email/password (placeholder — wire to Supabase email auth) */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" disabled={loading} />
            </div>
            <Button variant="primary" size="md" className="w-full" disabled>
              Sign in with email
              <span className="ml-2 text-[10px] opacity-60">(configure Supabase)</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-[10px] text-[--text-muted]">
            Auth powered by{" "}
            <a href="https://supabase.com" target="_blank" rel="noopener" className="text-[--text-secondary] hover:text-[--text-primary]">
              Supabase
            </a>
            {" "}+{" "}
            <a href="https://console.cloud.google.com" target="_blank" rel="noopener" className="text-[--text-secondary] hover:text-[--text-primary]">
              Google OAuth
            </a>
          </p>
          <Link href="/dashboard" className="text-[10px] text-[--text-muted] hover:text-[--text-secondary] transition-colors">
            Skip for now →
          </Link>
        </div>
      </div>
    </div>
  );
}
