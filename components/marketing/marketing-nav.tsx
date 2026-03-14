"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cpu, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const navLinks = [
  { label: "Features",   href: "#features" },
  { label: "Showcase",   href: "/showcase" },
  { label: "Docs",       href: "#docs" },
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
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-[--mkt-bg]/95 backdrop-blur-md border-b border-[--mkt-border]"
        : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-6 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[--accent-dim] border border-[--border-active]">
            <Cpu className="h-4 w-4 text-[--accent-vivid]" />
          </div>
          <span className="text-sm font-bold text-[--text-primary] tracking-tight">
            App <span className="text-[--accent-vivid]">Chassis</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label} href={href}
              className="px-3 py-1.5 text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors rounded-[--radius-md] hover:bg-[--mkt-card]"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Open App</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[--text-muted] hover:text-[--text-primary] transition-colors"
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
