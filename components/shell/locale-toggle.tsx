"use client";
import React, { useEffect, useState } from "react";
import { Languages } from "lucide-react";

import { LOCALE_COOKIE, type Locale } from "@/lib/portal/i18n/dictionary";

/**
 * Top-bar locale toggle EN ⇄ FR (advisory action #26).
 * Writes the cookie + sets `<html lang>` for accessibility.
 */
export function LocaleToggle() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const fromCookie = readCookie(LOCALE_COOKIE);
    const next: Locale = fromCookie === "fr" ? "fr" : "en";
    document.documentElement.lang = next;
    if (next !== locale) setLocale(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (next: Locale) => {
    setLocale(next);
    document.documentElement.lang = next;
    const expires = new Date(Date.now() + 365 * 86_400_000).toUTCString();
    document.cookie = `${LOCALE_COOKIE}=${next}; expires=${expires}; path=/; SameSite=Lax`;
  };

  return (
    <button
      type="button"
      onClick={() => apply(locale === "en" ? "fr" : "en")}
      className="flex items-center gap-1.5 h-7 px-2 rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] hover:border-[--border-default] transition-colors text-xs text-[--text-secondary]"
      aria-label={`Switch language to ${locale === "en" ? "French" : "English"}`}
      title={
        locale === "en"
          ? "Switch to French / Passer au français"
          : "Passer à l'anglais / Switch to English"
      }
    >
      <Languages className="h-3 w-3" />
      <span className="hidden md:inline uppercase tracking-widest">{locale}</span>
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
