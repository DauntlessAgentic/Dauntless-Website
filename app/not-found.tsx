import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";

export default function NotFound() {
  const suggestions = [
    { label: "Our Work", href: "/work", desc: "150+ projects across government & industry" },
    { label: "Services", href: "/services", desc: "Training, consulting, and agentic systems" },
    { label: "The Method", href: "/method", desc: "How we approach every engagement" },
    { label: "Start a Conversation", href: "/contact", desc: "Tell us what you're trying to build" },
  ];

  return (
    <>
      <MarketingNav />
      <div className="min-h-screen bg-[--mkt-bg] flex flex-col items-center justify-center px-6 py-32 text-center space-y-12">
        <div className="space-y-4">
          <p
            className="text-[120px] font-bold leading-none text-transparent bg-clip-text select-none"
            style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
          >
            404
          </p>
          <h1 className="text-2xl font-semibold text-[--text-primary]">This page doesn&apos;t exist.</h1>
          <p className="text-[--text-secondary] max-w-sm mx-auto text-sm">
            You might have followed a broken link or typed the address incorrectly.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 max-w-lg w-full">
          {suggestions.map(({ label, href, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-1 p-4 bg-[--mkt-card] border border-[--mkt-border] rounded-xl text-left hover:border-[rgba(139,92,246,0.4)] hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <span className="text-sm font-semibold text-[--text-primary] flex items-center gap-1.5">
                {label}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <span className="text-xs text-[--text-muted]">{desc}</span>
            </Link>
          ))}
        </div>
      </div>
      <MarketingFooter />
    </>
  );
}
