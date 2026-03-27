import React from "react";
import Link from "next/link";
import { GraduationCap, Building2, Bot, ArrowRight } from "lucide-react";

const services = [
  {
    icon: GraduationCap,
    label: "AI Literacy Training",
    headline: "Transform how your people work with AI.",
    description:
      "Programs that build real capability — from half-day executive briefings to 10-day organizational transformations. Practice-first. Outcome-tracked. Flexible delivery designed around your team's schedule.",
    meta: "Half day to 10 days · Groups of 8–25 · PRISM assessed",
    cta: "Explore Training",
    href: "/services/training",
  },
  {
    icon: Building2,
    label: "AI Ops Consulting",
    headline: "Operationalize AI — don't just pilot it.",
    description:
      "Strategic advisory that designs the architecture, governance, and operating model for AI that actually works inside real organizations. Stop experimenting. Start operating.",
    meta: "Discovery → Design → Build → Advisory",
    cta: "Explore Consulting",
    href: "/services/consulting",
  },
  {
    icon: Bot,
    label: "Agentic Systems",
    headline: "AI that works while you sleep.",
    description:
      "Autonomous AI agent architectures with constitutional governance. Agents that sense, propose, execute, and learn — with humans at every decision point that matters.",
    meta: "Agent fleets · Decision architecture · Compounding intelligence",
    cta: "Explore Agentic",
    href: "/services/agentic-systems",
  },
];

export function FeatureGrid() {
  return (
    <section id="services" className="bg-[--mkt-section] py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">
            Services
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[--text-primary]">
            Three Services. One Compounding System.
          </h2>
          <p className="max-w-2xl mx-auto text-[--text-secondary]">
            AI capability through three channels — immersive training, strategic consulting, and
            agentic systems. All three powered by the same compounding engine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {services.map(({ icon: Icon, label, headline, description, meta, cta, href }) => (
            <div
              key={label}
              className="group relative bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-6 space-y-4 hover:border-[--border-active] transition-all duration-300"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active]">
                <Icon className="h-5 w-5 text-[--accent-vivid]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">
                  {label}
                </p>
                <h3 className="text-lg font-bold text-[--text-primary]">{headline}</h3>
              </div>
              <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
              <p className="text-[11px] text-[--text-muted] font-mono">{meta}</p>
              <Link
                href={href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors"
              >
                {cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
