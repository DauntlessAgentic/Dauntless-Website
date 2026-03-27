import React from "react";
import { Fingerprint, Layers, TrendingUp } from "lucide-react";

const threeAs = [
  {
    icon: Fingerprint,
    title: "Authentic",
    subtitle: "Genuine signal over generated noise",
    description: "In a world of AI-generated noise, genuine human signal is the scarcest resource. We lead with judgment, perspective, and conviction — not templates.",
  },
  {
    icon: Layers,
    title: "Augmented",
    subtitle: "Human + AI = 10× capability",
    description: "AI doesn't replace human capability. It multiplies it. We design systems where humans and AI amplify each other — producing outcomes neither could achieve alone.",
  },
  {
    icon: TrendingUp,
    title: "Adaptive",
    subtitle: "Architecture that compounds over time",
    description: "The only sustainable advantage is the architecture of adaptation itself. We design systems that learn, evolve, and compound — not systems that become obsolete.",
  },
];

export function HowItWorks() {
  return (
    <>
      {/* The Provocation — premium blockquote card */}
      <section className="bg-[--mkt-bg] py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.07) 0%, transparent 65%)" }} />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div
            className="relative rounded-2xl p-10 md:p-14 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(16,16,30,0.9) 50%, rgba(109,40,217,0.08) 100%)",
              border: "1px solid rgba(139,92,246,0.2)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            {/* Decorative quote mark */}
            <div
              className="absolute top-6 left-8 text-[120px] leading-none font-bold select-none opacity-[0.06]"
              style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #a78bfa)", WebkitBackgroundClip: "text", color: "transparent" }}
            >
              &ldquo;
            </div>
            <div className="relative space-y-6 text-center">
              <blockquote className="text-xl md:text-2xl font-medium text-[--text-primary] leading-relaxed italic">
                &ldquo;The rules were built for a world that no longer exists. The organizations that cling to them don't just fall behind — they become irrelevant while still feeling productive.&rdquo;
              </blockquote>
              <div className="h-px w-16 mx-auto" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)" }} />
              <p className="text-[--text-secondary] text-sm leading-relaxed max-w-xl mx-auto">
                This is a historic period. The relationship between humans and work, between knowledge and value, between effort and outcome — all of it is being rewritten. The question isn't whether to adapt. The question is whether you have the{" "}
                <span className="text-[--text-primary] font-medium">architecture</span> to adapt fast enough.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three As */}
      <section id="how-it-works" className="relative bg-[--mkt-section] py-28 px-6 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)" }} />
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">Philosophy</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-[--text-primary]">
              The Three A's
            </h2>
            <p className="text-[--text-secondary] text-sm max-w-xl mx-auto leading-relaxed">
              Not a marketing framework. A personal operating system — a way of being in a world where the relationship between humans, work, and power is being fundamentally disrupted.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {threeAs.map(({ icon: Icon, title, subtitle, description }) => (
              <div
                key={title}
                className="group relative bg-[--mkt-card] border border-[--mkt-border] rounded-2xl p-7 space-y-5 transition-all duration-300 hover:border-[rgba(139,92,246,0.3)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1),0_16px_32px_-8px_rgba(0,0,0,0.5)]"
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(to bottom, #7c3aed, #a78bfa)" }}
                />
                {/* Icon */}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)", boxShadow: "0 3px 10px rgba(124,58,237,0.35)" }}
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[--text-primary]">{title}</h3>
                  <p className="text-[11px] font-medium text-[--accent-vivid] uppercase tracking-wider">{subtitle}</p>
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
