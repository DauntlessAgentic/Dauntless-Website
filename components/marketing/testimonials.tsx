import React from "react";

const testimonials = [
  {
    quote:
      "The agent Dauntless Agentic built replaced 3 days of manual data processing per week. The ROI was obvious in the first month — and it keeps improving as they optimize the prompts.",
    name: "Sarah K.",
    title: "Head of Operations",
    company: "Series B SaaS Co.",
    initial: "S",
    accent: "var(--accent-bright)",
  },
  {
    quote:
      "I'd talked to two other AI shops before reaching out to Dauntless. Night and day difference — they actually understood our workflow instead of trying to fit us into their template.",
    name: "Marcus T.",
    title: "VP Engineering",
    company: "Enterprise FinTech",
    initial: "M",
    accent: "var(--info)",
  },
  {
    quote:
      "We were skeptical about autonomous agents in our compliance-heavy environment. They built in the exact guardrails and audit trails we needed. Our legal team actually signed off.",
    name: "Priya A.",
    title: "Director of Product",
    company: "Healthcare Platform",
    initial: "P",
    accent: "var(--success)",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[--mkt-bg] py-24 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[--accent-vivid]">Client results</p>
          <h2 className="text-3xl font-bold text-[--text-primary]">What teams say after going live.</h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between p-6 rounded-[--radius-xl] border border-[--mkt-border] bg-[--mkt-card] space-y-5 hover:border-[--border-default] transition-colors"
            >
              {/* Quote mark */}
              <div>
                <div
                  className="text-4xl font-black leading-none mb-3"
                  style={{ color: t.accent, opacity: 0.4 }}
                >
                  &ldquo;
                </div>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{t.quote}</p>
              </div>

              {/* Attribution */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: `color-mix(in srgb, ${t.accent} 20%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${t.accent} 40%, transparent)`,
                    color: t.accent,
                  }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[--text-primary]">{t.name}</p>
                  <p className="text-[10px] text-[--text-muted]">{t.title} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
