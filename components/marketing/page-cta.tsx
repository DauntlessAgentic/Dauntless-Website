import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PageCTAProps {
  heading?: string;
  subtext?: string;
  buttonLabel?: string;
  buttonHref?: string;
  variant?: "default" | "dark";
}

export function PageCTA({
  heading = "Ready to apply this to your organization?",
  subtext = "Every engagement starts with a single conversation — no pitch decks, no pressure.",
  buttonLabel = "Start a Conversation",
  buttonHref = "/contact",
  variant = "default",
}: PageCTAProps) {
  const bg = variant === "dark" ? "bg-[--mkt-bg]" : "bg-[--mkt-section]";
  return (
    <section className={`${bg} py-20 px-6`}>
      <div className="max-w-3xl mx-auto text-center space-y-5">
        <h2 className="text-2xl md:text-3xl font-semibold text-[--text-primary]">{heading}</h2>
        <p className="text-[--text-secondary] text-base leading-relaxed">{subtext}</p>
        <Link href={buttonHref}>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
              boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            }}
          >
            {buttonLabel} <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </section>
  );
}
