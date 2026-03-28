"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "18+",    label: "Years of transformation" },
  { value: "200+",   label: "Proven agentic integrations" },
  { value: "5,000+", label: "Professionals served" },
  { value: "$50M+",  label: "Enterprise value delivered" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[--mkt-bg] min-h-[80vh] flex items-center">

      {/* Background — radial glow + subtle grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-6 text-center pt-28 pb-16 flex flex-col items-center gap-8">

        {/* Eyebrow — category signal */}
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "#a78bfa" }}
        >
          AI Training, Strategy &amp; Systems &nbsp;·&nbsp; Built for Any Scale
        </p>

        {/* H1 */}
        <div className="space-y-3">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[--text-primary] leading-[1.05]"
            style={{ letterSpacing: "-0.025em" }}
          >
            Elevate Human
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 60%, #a78bfa 100%)" }}
            >
              Potential.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[--text-secondary] leading-relaxed">
            Redesign how people and teams think, decide, and build in the age of AI.
            Whether you're a solopreneur, a growing team, or a national institution, we offer
            training programs, strategic consulting, and AI systems that redefine what's possible.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            href="/contact"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px rgba(124,58,237,0.35)",
            }}
          >
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/work"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium text-[--text-secondary] hover:text-[--text-primary] transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
          >
            See Our Work
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 w-full max-w-2xl pt-4 border-t border-[rgba(139,92,246,0.12)]">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p
                className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)" }}
              >
                {value}
              </p>
              <p className="text-xs text-[--text-muted] mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
