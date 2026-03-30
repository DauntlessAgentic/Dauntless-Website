import React from "react";
import { Fingerprint, Layers, TrendingUp } from "lucide-react";

const threeAs = [
  {
    icon: TrendingUp,
    title: "Adaptive",
    subtitle: "Architecture that compounds over time",
    description: "The only sustainable advantage is the architecture of adaptation itself. We design systems that learn, evolve, and compound — not systems that become obsolete.",
  },
  {
    icon: Layers,
    title: "Augmented",
    subtitle: "Human + AI = 10× capability",
    description: "AI doesn't replace human capability. It multiplies it. We design systems where humans and AI amplify each other — producing outcomes neither could achieve alone.",
  },
  {
    icon: Fingerprint,
    title: "Authentic",
    subtitle: "Genuine signal over generated noise",
    description: "In a world of AI-generated noise, genuine human signal is the scarcest resource. We lead with judgment, perspective, and conviction — not templates.",
  },
];

export function HowItWorks() {
  return (
    <>
      {/* The Provocation — premium blockquote card */}
      <section className="bg-[--mkt-bg] py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(var(--accent-rgb),0.07) 0%, transparent 65%)" }} />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div
            className="relative rounded-2xl p-10 md:p-14 overflow-hidden"
            style={{
              background: "var(--deep-card-bg)",
              border: "1px solid rgba(var(--accent-bright-rgb),0.2)",
              boxShadow: "var(--deep-card-shadow)",
            }}
          >
            {/* Decorative quote mark */}
            <div
              className="absolute top-6 left-8 text-[120px] leading-none font-bold select-none opacity-[0.06]"
              style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))", WebkitBackgroundClip: "text", color: "transparent" }}
            >
              &ldquo;
            </div>
            <div className="relative space-y-6 text-center">
              <blockquote className="text-xl md:text-2xl font-medium text-[--text-primary] leading-relaxed italic">
                &ldquo;The future of work feels daunting, paralysis by analysis is real, sitting on the fence feels safe. Compounding advantage is created by teams that adapt with clarity and conviction.&rdquo;
              </blockquote>
              <div className="h-px w-16 mx-auto" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-bright-rgb),0.6), transparent)" }} />
              <p className="text-[--text-secondary] text-sm leading-relaxed max-w-xl mx-auto">
                This is a historic period. The relationship between humans and work, between knowledge and value, between effort and outcome — all of it is being rewritten. The question isn't whether to adapt. The question is whether you have the{" "}
                <span className="text-[--text-primary] font-medium">architecture</span> to adapt fast enough.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three As */}
      <section id="how-it-works" className="relative bg-[--mkt-section] py-16 px-6 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-bright-rgb),0.2), transparent)" }} />
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">Philosophy</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-[--text-primary]">
              Triple A Vision for the Future of Work
            </h2>
            <p className="text-[--text-secondary] text-sm max-w-xl mx-auto leading-relaxed">
              Not a marketing framework. A personal operating system — a way of being in a world where the relationship between humans, work, and power is being fundamentally disrupted.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {threeAs.map(({ icon: Icon, title, subtitle, description }) => (
              <div
                key={title}
                className="group relative soft-card soft-card-lift p-7 space-y-5"
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(to bottom, var(--accent), var(--accent-vivid))" }}
                />
                {/* Icon */}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)", boxShadow: "0 3px 10px rgba(var(--accent-rgb),0.35)" }}
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[--text-primary]">{title}</h3>
                  <p className="text-xs font-medium text-[--accent-vivid] uppercase tracking-wider">{subtitle}</p>
                </div>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
