import React from "react";
import { Search, Hammer, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discovery & Strategy",
    description:
      "We start with a focused session to understand your workflow, your team's pain points, and where autonomous AI agents would deliver the fastest, highest-value impact. You walk away with a concrete agent architecture plan — before any code is written.",
    duration: "Week 1–2",
    accent: "var(--accent-bright)",
  },
  {
    number: "02",
    icon: Hammer,
    title: "Build & Deploy",
    description:
      "Our engineers build your agents in structured sprints — testing at every step. We integrate with your existing systems, establish guardrails and monitoring, and get you to a working production deployment with minimal disruption.",
    duration: "Week 3–6",
    accent: "var(--info)",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Optimize & Scale",
    description:
      "Once live, we monitor performance, iterate on prompts and logic, and help you identify the next automation opportunities. Most clients expand from one agent to a full fleet within 90 days.",
    duration: "Ongoing",
    accent: "var(--success)",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[--mkt-bg] py-24 px-6">
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[--accent-vivid]">Our process</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[--text-primary]">
            From idea to deployed agent in weeks.
          </h2>
          <p className="text-sm text-[--text-secondary] max-w-md mx-auto">
            A proven sprint process built around speed, quality, and knowledge transfer — not endless consulting cycles.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden md:block absolute top-8 left-[calc(16.66%)] right-[calc(16.66%)] h-px"
            style={{ background: "linear-gradient(90deg, var(--accent-bright), var(--info), var(--success))", opacity: 0.3 }}
          />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center space-y-4">
              {/* Number badge */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[--mkt-card] border border-[--mkt-border] z-10"
                style={{ boxShadow: `0 0 24px color-mix(in srgb, ${step.accent} 20%, transparent)` }}
              >
                <step.icon className="h-6 w-6" style={{ color: step.accent }} />
                <span
                  className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{
                    background: step.accent,
                    color: "var(--mkt-bg)",
                  }}
                >
                  {step.number}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-base font-bold text-[--text-primary]">{step.title}</h3>
                </div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: step.accent }}
                >
                  {step.duration}
                </p>
                <p className="text-xs text-[--text-muted] leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
