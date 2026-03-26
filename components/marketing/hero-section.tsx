import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Bot, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "40+",   label: "Agents Deployed" },
  { value: "10k+",  label: "Hours Automated" },
  { value: "98%",   label: "Client Retention" },
  { value: "3x",    label: "Avg. Productivity Gain" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[--mkt-bg] pt-14">
      {/* Background ambient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 65%)" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.04) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.06) 0%, transparent 70%)" }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center space-y-10">
        {/* Eyebrow pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[--accent-dim] border border-[--border-active]">
          <span className="h-1.5 w-1.5 rounded-full bg-[--accent-bright] animate-pulse-glow" />
          <span className="text-xs font-medium text-[--accent-vivid]">AI Agency & Agentic Development Studio</span>
          <ChevronRight className="h-3 w-3 text-[--accent-vivid]" />
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[--text-primary] leading-[1.06]">
            Autonomous agents that
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright) 0%, var(--info) 60%, var(--accent-vivid) 100%)" }}
            >
              work while you don&apos;t.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-[--text-secondary] leading-relaxed">
            We design, build, and deploy custom AI agents and agentic workflows that handle your most demanding work —
            faster, smarter, and around the clock. No hype. Just AI that ships.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="#contact">
            <Button variant="primary" size="lg" className="gap-2 shadow-[var(--shadow-accent)]">
              Schedule a Discovery Call
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#services">
            <Button variant="outline" size="lg" className="gap-2">
              <Bot className="h-4 w-4" />
              Explore Services
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center space-y-0.5">
              <p
                className="text-2xl font-bold text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, var(--accent-vivid), var(--info))" }}
              >
                {value}
              </p>
              <p className="text-xs text-[--text-muted]">{label}</p>
            </div>
          ))}
        </div>

        {/* Trust tags */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {[
            "Claude Sonnet & Opus",
            "OpenAI GPT-4o",
            "LangChain & LangGraph",
            "n8n & Make",
            "Vercel AI SDK",
          ].map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-[--mkt-card] border border-[--mkt-border] text-[--text-muted]"
            >
              <Zap className="h-2.5 w-2.5 text-[--accent-vivid]" />
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
