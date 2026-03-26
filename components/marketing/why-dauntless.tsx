import React from "react";
import { Zap, Code2, HeartHandshake, Target } from "lucide-react";

const differentiators = [
  {
    icon: Target,
    title: "We only build what will ship",
    description:
      "No feature creep. No scope inflation. We define success metrics before writing a line of code and hold ourselves accountable to them.",
  },
  {
    icon: Code2,
    title: "Real engineers, not prompt jockeys",
    description:
      "Our team builds production-grade agent systems — with proper architecture, error handling, observability, and deployment pipelines. Not just wrapped API calls.",
  },
  {
    icon: Zap,
    title: "Speed without sacrificing quality",
    description:
      "Two-week sprint cycles mean you see working software fast. We ship iteratively, gather feedback, and improve — instead of disappearing for months.",
  },
  {
    icon: HeartHandshake,
    title: "You own everything we build",
    description:
      "All code, prompts, pipelines, and documentation are yours. We design for handoff from day one — no vendor lock-in, no proprietary black boxes.",
  },
];

export function WhyDauntless() {
  return (
    <section id="about" className="bg-[--mkt-section] py-24 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-2xl space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[--accent-vivid]">Why Dauntless Agentic</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[--text-primary]">
            We&apos;ve seen what bad AI looks like.
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--info))" }}
            >
              We build the opposite.
            </span>
          </h2>
          <p className="text-sm text-[--text-secondary] leading-relaxed">
            Most AI projects fail because they were built by people who understood AI but not your business —
            or understood your business but not AI. We close that gap.
          </p>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-5 rounded-[--radius-xl] border border-[--mkt-border] bg-[--mkt-card] hover:border-[--border-default] transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[--radius-md] bg-[--accent-dim] border border-[--border-active]">
                <item.icon className="h-4 w-4 text-[--accent-vivid]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[--text-primary]">{item.title}</h3>
                <p className="text-xs text-[--text-muted] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
