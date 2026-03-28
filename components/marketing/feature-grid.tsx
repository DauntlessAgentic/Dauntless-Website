import React from "react";
import Link from "next/link";
import { BookOpen, Network, Cpu, ArrowRight } from "lucide-react";

interface MetaRow { label: string; value: string; }

interface Service {
  icon: React.ElementType;
  number: string;
  label: string;
  headline: string;
  description: string;
  meta?: string;
  metaRows?: MetaRow[];
  cta: string;
  href: string;
}

const services: Service[] = [
  {
    icon: BookOpen,
    number: "01",
    label: "AI Literacy Training",
    headline: "Transform how your people work with AI.",
    description: "Programs that build real capability — from half-day executive briefings to 10-day organizational transformations. Outcome-focused, flexible delivery tailored for your team.",
    metaRows: [
      { label: "Format",  value: "Immersive Professional Transformation" },
      { label: "Outcome", value: "Deep agentic capability with governance, leadership and compounding knowledge systems built in." },
    ],
    cta: "Explore Training",
    href: "/services/training",
  },
  {
    icon: Network,
    number: "02",
    label: "AI Ops Consulting",
    headline: "Operationalize AI — don't just pilot it.",
    description: "Design architecture, governance and operating models for human-machine collaboration that actually works inside real teams. Stop experimenting and start integrating.",
    meta: "Discover → Design → Build → Integrate → Iterate",
    cta: "Explore Consulting",
    href: "/services/consulting",
  },
  {
    icon: Cpu,
    number: "03",
    label: "Agentic Systems",
    headline: "AI that works while you sleep.",
    description: "Autonomous AI agent architectures with constitutional governance. Agents that sense, propose, execute, and learn — with humans at every decision point that matters.",
    meta: "Agent fleets · Decision architecture · Compounding intelligence",
    cta: "Explore Agentic",
    href: "/services/agentic-systems",
  },
];

export function FeatureGrid() {
  return (
    <section id="services" className="relative bg-[--mkt-section] py-16 px-6 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)" }} />
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">Services</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[--text-primary]">
            Three Services.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)" }}>
              One Compounding System.
            </span>
          </h2>
          <p className="max-w-xl mx-auto text-[--text-secondary] text-sm leading-relaxed">
            AI capability through three channels — immersive training, strategic consulting, and agentic systems. All three powered by the same compounding engine.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {services.map(({ icon: Icon, number, label, headline, description, meta, metaRows, cta, href }) => (
            <Link
              key={label}
              href={href}
              className="group relative flex flex-col bg-[--mkt-card] border border-[--mkt-border] rounded-2xl p-6 space-y-5 transition-all duration-300 hover:border-[rgba(139,92,246,0.35)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.12),0_20px_40px_-12px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute top-0 inset-x-0 h-[1.5px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, transparent 0%, #8b5cf6 40%, #a78bfa 60%, transparent 100%)" }} />
              <span className="absolute top-5 right-5 text-xs font-mono font-bold text-[--text-muted] opacity-30 select-none">{number}</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}>
                <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[--accent-vivid]">{label}</p>
                <h3 className="text-base font-semibold text-[--text-primary] leading-snug">{headline}</h3>
              </div>
              <p className="text-sm text-[--text-secondary] leading-relaxed flex-1">{description}</p>
              <div className="space-y-3 pt-1">
                <div className="border-t border-[--mkt-border] pt-3">
                  {metaRows ? (
                    <div className="space-y-1.5">
                      {metaRows.map(({ label: rowLabel, value }) => (
                        <div key={rowLabel} className="flex gap-2 text-xs font-mono">
                          <span className="text-[--accent-vivid] shrink-0">{rowLabel}</span>
                          <span className="text-[--text-muted]">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[--text-muted] font-mono">{meta}</p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[--accent-vivid] group-hover:text-[--accent-bright] transition-colors">
                  {cta} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
