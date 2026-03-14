import React from "react";
import Link from "next/link";
import { ArrowRight, Cpu, LayoutGrid, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[--mkt-bg] pt-14">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)" }}
        />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.05) 0%, transparent 70%)" }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center space-y-8">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[--accent-dim] border border-[--border-active]">
          <span className="h-1.5 w-1.5 rounded-full bg-[--accent-bright] animate-pulse-glow" />
          <span className="text-xs font-medium text-[--accent-vivid]">Production-ready starter chassis</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[--text-primary] leading-[1.08]">
            The internal tool
            <br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--info))" }}>
              command surface
            </span>
            <br />
            you deserve.
          </h1>
          <p className="max-w-xl mx-auto text-base text-[--text-secondary] leading-relaxed">
            App Chassis is a premium, opinionated starter for internal tools, AI workspaces, and
            decision-support surfaces. Dark-first. Agent-ready. Modular by design.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="gap-2">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/agents">
            <Button variant="outline" size="lg" className="gap-2">
              <Bot className="h-4 w-4" />
              Agent Workspace
            </Button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {[
            "Draggable card workspace",
            "Multi-agent ready",
            "Deep ultraviolet design system",
            "Next.js 16 + TypeScript",
            "TanStack + Recharts",
          ].map((pill) => (
            <span key={pill} className="text-[11px] px-2.5 py-1 rounded-full bg-[--mkt-card] border border-[--mkt-border] text-[--text-muted]">
              {pill}
            </span>
          ))}
        </div>

        {/* Mini app preview hint */}
        <div className="mt-4 inline-flex items-center gap-6 px-6 py-3 rounded-[--radius-xl] bg-[--mkt-card] border border-[--mkt-border]">
          {[
            { icon: LayoutGrid, label: "8 Starter Pages" },
            { icon: Cpu,        label: "50+ Components" },
            { icon: Bot,        label: "Agent Patterns" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-[--text-secondary]">
              <Icon className="h-3.5 w-3.5 text-[--accent-vivid]" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
