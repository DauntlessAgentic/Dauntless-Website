import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "18+",    label: "Years in transformation" },
  { value: "180+",   label: "AI workflows designed" },
  { value: "5,000+", label: "Professionals served" },
  { value: "$4M+",   label: "Documented savings" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[--mkt-bg] pt-14">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.16) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[--accent-dim] border border-[--border-active]">
          <span className="h-1.5 w-1.5 rounded-full bg-[--accent-bright] animate-pulse-glow" />
          <span className="text-xs font-medium text-[--accent-vivid]">
            Authentic · Augmented · Adaptive
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[--text-primary] leading-[1.05]">
            Elevate Human
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--accent-bright) 0%, var(--accent-vivid) 100%)",
              }}
            >
              Potential.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-[--text-secondary] leading-relaxed">
            Redesign how people and organizations think, decide, and build in the age of AI.
            We build AI training programs, strategic consulting engagements, and agentic operating
            systems that don&apos;t just improve what exists — they raise the ceiling of what&apos;s possible.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/contact">
            <Button variant="primary" size="lg" className="gap-2 shadow-[var(--shadow-accent)]">
              Start a Conversation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about/manifesto">
            <Button variant="outline" size="lg">
              Read the Manifesto
            </Button>
          </Link>
        </div>

        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center space-y-1">
              <p
                className="text-2xl font-bold text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--accent-vivid), var(--text-primary))",
                }}
              >
                {value}
              </p>
              <p className="text-xs text-[--text-muted]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
