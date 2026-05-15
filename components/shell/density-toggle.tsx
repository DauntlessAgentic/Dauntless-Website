"use client";
import React, { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import { DENSITY_COOKIE, defaultDensity, isDensityMode, type DensityMode } from "@/lib/portal/density";

/**
 * Top-bar density toggle. Writes to the `dauntless-density` cookie
 * (1y) and updates `<html data-density="…">` so any consumer can
 * adjust spacing or font-size via CSS. Advisory-board action #21.
 */
export function DensityToggle() {
  const [mode, setMode] = useState<DensityMode>(defaultDensity());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fromCookie = readCookie(DENSITY_COOKIE);
    const next: DensityMode = isDensityMode(fromCookie) ? fromCookie : defaultDensity();
    document.documentElement.setAttribute("data-density", next);
    if (next !== mode) setMode(next);
    setHydrated(true);
    // mode is intentionally not in deps — this runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) {
    // SSR pass: render a placeholder so layout doesn't shift on hydration.
  }

  const apply = (next: DensityMode) => {
    setMode(next);
    document.documentElement.setAttribute("data-density", next);
    writeCookie(DENSITY_COOKIE, next, 365);
  };

  return (
    <button
      type="button"
      onClick={() => apply(mode === "compact" ? "comfortable" : "compact")}
      className="flex items-center gap-1.5 h-7 px-2 rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] hover:border-[--border-default] transition-colors text-xs text-[--text-secondary]"
      // Audit-3 §L5: announce the current state alongside the target.
      aria-label={`Density: ${mode}. Activate to switch to ${mode === "compact" ? "comfortable" : "compact"}.`}
      aria-pressed={mode === "comfortable"}
      title={
        mode === "compact"
          ? "Comfortable density — more breathing room. Better for reading sessions."
          : "Compact density — fits more on screen. Better for triage."
      }
    >
      {mode === "compact" ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
      <span className="hidden md:inline">{mode === "compact" ? "Compact" : "Comfortable"}</span>
    </button>
  );
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const all = document.cookie.split(";").map((s) => s.trim());
  for (const pair of all) {
    const [k, v] = pair.split("=");
    if (k === name) return decodeURIComponent(v ?? "");
  }
  return null;
}

function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}
