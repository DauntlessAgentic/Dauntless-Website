import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Network, Cpu } from "lucide-react";

const stats = [
  { value: "18+",    label: "Years of transformation" },
  { value: "180+",   label: "AI workflows designed" },
  { value: "5,000+", label: "Professionals served" },
];

const previewCards = [
  { icon: BookOpen, label: "AI Literacy Training", tag: "People" },
  { icon: Network,  label: "AI Ops Consulting",   tag: "Strategy" },
  { icon: Cpu,      label: "Agentic Systems",     tag: "Platform" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[--mkt-bg] pt-14">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.13) 0%, transparent 65%)" }}
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

      <div className="relative max-w-5xl mx-auto px-6 text-center space-y-12 py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse-glow" style={{ background: "#8b5cf6" }} />
          <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>
            Authentic · Augmented · Adaptive
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-5">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[--text-primary] leading-[1.05]">
            Elevate Human
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 60%, #a78bfa 100%)" }}
            >
              Potential.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-[--text-secondary] leading-relaxed">
            Redesign how people and organizations think, decide, and build in the age of AI. Training programs, strategic consulting, and agentic operating systems that don't just improve what exists — they raise the ceiling of what's possible.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px rgba(124,58,237,0.35)",
            }}
          >
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/about/manifesto"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-[--text-secondary] hover:text-[--text-primary] transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
          >
            Read the Manifesto
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap pt-2">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p
                className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)" }}
              >
                {value}
              </p>
              <p className="text-xs text-[--text-muted] mt-0.5">{label}</p>
            </div>
          ))}
          <div className="hidden md:block h-8 w-px" style={{ background: "rgba(139,92,246,0.2)" }} />
          <div className="text-center">
            <p
              className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)" }}
            >
              $50M+
            </p>
            <p className="text-xs text-[--text-muted] mt-0.5">Documented savings</p>
          </div>
        </div>

        {/* Mini bento service preview */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-4">
          {previewCards.map(({ icon: Icon, label, tag }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-2.5 rounded-xl p-4 text-center transition-all duration-200 hover:border-[rgba(139,92,246,0.3)]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)", boxShadow: "0 2px 8px rgba(124,58,237,0.4)" }}
              >
                <Icon className="h-4 w-4 text-white" strokeWidth={1.75} />
              </div>
              <span className="text-[10px] font-medium text-[--text-muted] leading-snug">{label}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(167,139,250,0.7)" }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
