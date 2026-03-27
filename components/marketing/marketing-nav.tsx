"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const navLinks = [
  { label: "Platform",  href: "/platform" },
  { label: "Services",  href: "/services" },
  { label: "Method",    href: "/method" },
  { label: "About",     href: "/about" },
  { label: "Insights",  href: "/insights" },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          ? "bg-[--mkt-bg]/95 backdrop-blur-md border-b border-[--mkt-border]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[--accent-dim] border border-[--border-active]">
            <Zap className="h-4 w-4 text-[--accent-vivid]" />
          </div>
          <span className="text-sm font-bold text-[--text-primary] tracking-tight">
            Dauntless <span className="text-[--accent-vivid]">Agentic</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-3 py-1.5 text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors rounded-[--radius-md] hover:bg-[--mkt-card]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/contact">
            <Button variant="primary" size="sm">Start a Conversation</Button>
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
        <div className="md:hidden bg-[--mkt-bg]/98 backdrop-blur-md border-b border-[--mkt-border] px-6 py-4 space-y-1">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-[--text-secondary] hover:text-[--text-primary] rounded-[--radius-md] hover:bg-[--mkt-card] transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3">
            <Link href="/contact" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="sm" className="w-full">
                Start a Conversation
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
