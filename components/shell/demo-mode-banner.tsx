"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles, X } from "lucide-react";

const STORAGE_KEY = "portal-demo-banner-dismissed";

/**
 * Demo-mode banner. Renders on /portal/* when the URL carries `?demo=1`
 * (the link from the marketing site's hero). Once dismissed, the banner
 * stays dismissed for the session. Framing is honest:
 *
 *   - the portal is running on the deterministic in-memory repository,
 *   - actions persist for the lifetime of the dev server,
 *   - the role switcher in the TopBar walks the membership gating, and
 *   - /portal/help is the five-minute guided tour.
 *
 * URL is the only activation source — keeps the component free of
 * effects and side-effect-in-effect lint complaints. Once the user
 * navigates to another portal route the banner disappears (its job
 * was the "welcome to the demo" framing on entry).
 */
export function DemoModeBanner() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;
  if (!pathname?.startsWith("/portal")) return null;
  if (search.get("demo") !== "1") return null;

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <div
      role="status"
      className="flex items-center gap-3 px-3 py-2 border-b border-[--border-subtle]"
      style={{
        background:
          "linear-gradient(90deg, rgba(var(--accent-rgb),0.12) 0%, rgba(var(--accent-bright-rgb),0.06) 100%)",
      }}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full shrink-0"
        style={{
          background: "rgba(var(--accent-rgb),0.18)",
          border: "1px solid rgba(var(--accent-bright-rgb),0.40)",
        }}
      >
        <Sparkles className="h-3.5 w-3.5 text-[--accent-vivid]" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[--text-primary]">
          You&apos;re inside the live portal demo.
        </p>
        <p className="text-xs text-[--text-secondary] leading-snug">
          Pre-seeded with one realistic government engagement. Mutations persist for the lifetime of this session.
          Use the TopBar role switcher to walk the membership gating. The five-minute guided tour is at{" "}
          <Link href="/portal/help" className="text-[--accent-vivid] hover:underline">/portal/help</Link>.
        </p>
      </div>
      <Link
        href="/portal/help"
        className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[--accent-vivid] hover:underline shrink-0"
      >
        Start the tour
      </Link>
      <button
        type="button"
        aria-label="Dismiss demo banner"
        onClick={handleDismiss}
        className="flex h-6 w-6 items-center justify-center rounded-[--radius-sm] text-[--text-muted] hover:text-[--text-primary] hover:bg-[--elevated] shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
