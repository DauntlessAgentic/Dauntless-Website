"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "./theme-wrapper";

const navLinks = [
  { label: "Services",      href: "/services" },
  { label: "Platform",      href: "/platform" },
  { label: "Method",        href: "/method" },
  { label: "Work",          href: "/work" },
  { label: "Pricing",       href: "/pricing" },
  { label: "About",         href: "/about" },
];

function LogoMark() {
  return (
    <Link href="/" className="flex items-center group">
      <span className="text-base font-semibold tracking-tight text-[--text-primary]">
        Dauntless{" "}
        <span className="text-transparent bg-clip-text"
          style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
          Agentic
        </span>
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 text-[--text-muted] hover:text-[--text-primary] hover:bg-[rgba(0,0,0,0.05)]"
    >
      {theme === "dark"
        ? <Sun className="h-4 w-4" />
        : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[--mkt-bg]/90 backdrop-blur-xl border-b border-[--mkt-border] shadow-[0_1px_0_0_rgba(139,92,246,0.08)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 flex h-[72px] items-center justify-between">
        <LogoMark />

        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={label} href={href}
                className={cn(
                  "px-4 py-2 text-sm rounded-[--radius-md] transition-colors duration-150",
                  isActive
                    ? "text-[--accent-vivid] bg-[rgba(124,58,237,0.1)]"
                    : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[rgba(0,0,0,0.04)]"
                )}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-lg] text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)",
              boxShadow: "0 0 0 1px rgba(var(--accent-bright-rgb),0.4), 0 4px 16px rgba(var(--accent-rgb),0.3)",
            }}>
            Start a Conversation
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          className="md:hidden text-[--text-muted] hover:text-[--text-primary] transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[--mkt-bg]/98 backdrop-blur-xl border-b border-[--mkt-border] px-6 py-4 space-y-1">
          {navLinks.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={label} href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2.5 text-sm rounded-[--radius-md] transition-colors",
                  isActive
                    ? "text-[--accent-vivid] bg-[rgba(124,58,237,0.1)]"
                    : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[rgba(0,0,0,0.04)]"
                )}>
                {label}
              </Link>
            );
          })}
          <div className="flex items-center justify-between pt-2 pb-1">
            <span className="text-xs text-[--text-muted] uppercase tracking-widest font-bold">Appearance</span>
            <ThemeToggle />
          </div>
          <div className="pt-1">
            <Link href="/contact" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-[--radius-lg] text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)" }}>
              Start a Conversation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
