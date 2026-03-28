"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

const navLinks = [
  { label: "Services",      href: "/services" },
  { label: "Platform",      href: "/platform" },
  { label: "Method",        href: "/method" },
  { label: "Work",          href: "/work" },
  { label: "Pricing",       href: "/pricing" },
  { label: "About",         href: "/about" },
];

function LogoMark() {
  const [imgError, setImgError] = React.useState(false);
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div
        className="relative flex h-8 w-8 items-center justify-center rounded-[7px] shrink-0 overflow-hidden"
        style={{
          background: "linear-gradient(var(--mkt-bg), var(--mkt-bg)) padding-box, linear-gradient(135deg, #8b5cf6, #a78bfa) border-box",
          border: "1.5px solid transparent",
        }}
      >
        {!imgError ? (
          <Image
            src="/images/logo-icon.png"
            alt="Dauntless"
            fill
            unoptimized
            className="object-contain p-0.5"
            onError={() => setImgError(true)}
            sizes="32px"
          />
        ) : (
          <span
            className="text-[15px] font-bold text-transparent bg-clip-text leading-none"
            style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #c4b5fd)" }}
          >
            D
          </span>
        )}
      </div>
      <span className="text-sm font-semibold tracking-tight text-[--text-primary]">
        Dauntless{" "}
        <span className="text-transparent bg-clip-text"
          style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #a78bfa)" }}>
          Agentic
        </span>
      </span>
    </Link>
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
      <div className="max-w-6xl mx-auto px-6 flex h-14 items-center justify-between">
        <LogoMark />

        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={label} href={href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-[--radius-md] transition-colors duration-150",
                  isActive
                    ? "text-[--accent-vivid] bg-[rgba(124,58,237,0.1)]"
                    : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/[0.04]"
                )}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center">
          <Link href="/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[--radius-lg] text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.4), 0 4px 16px rgba(124,58,237,0.3)",
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
                    : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/[0.04]"
                )}>
                {label}
              </Link>
            );
          })}
          <div className="pt-3">
            <Link href="/contact" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-[--radius-lg] text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)" }}>
              Start a Conversation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
