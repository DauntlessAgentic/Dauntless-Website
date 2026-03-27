import React from "react";

const threeAs = [
  {
    letter: "A",
    title: "Authentic",
    description:
      "In a world of AI-generated noise, genuine human signal is the scarcest resource. We lead with judgment, perspective, and conviction — not templates.",
  },
  {
    letter: "A",
    title: "Augmented",
    description:
      "AI doesn't replace human capability. It multiplies it. We design systems where humans and AI amplify each other — producing outcomes neither could achieve alone.",
  },
  {
    letter: "A",
    title: "Adaptive",
    description:
      "The only sustainable advantage is the architecture of adaptation itself. We design systems that learn, evolve, and compound — not systems that become obsolete.",
  },
];

export function HowItWorks() {
  return (
    <>
      {/* The Provocation */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <blockquote className="text-2xl md:text-3xl font-bold text-[--text-primary] leading-snug italic">
            &ldquo;The rules were built for a world that no longer exists. The organizations that
            cling to them don&apos;t just fall behind — they become irrelevant while still feeling
            productive.&rdquo;
          </blockquote>
          <p className="text-[--text-secondary] leading-relaxed">
            This is a historic period. The relationship between humans and work, between knowledge
            and value, between effort and outcome — all of it is being rewritten. The question
            isn&apos;t whether to adapt. The question is whether you have the{" "}
            <span className="text-[--text-primary] font-medium">architecture</span> to adapt fast
            enough.
          </p>
        </div>
      </section>

      {/* Three A's */}
      <section id="how-it-works" className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">
              Philosophy
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[--text-primary]">
              The Three A&apos;s
            </h2>
            <p className="text-[--text-secondary] max-w-xl mx-auto">
              Not a marketing framework. A personal operating system — a way of being in a world
              where the relationship between humans, work, and power is being fundamentally disrupted.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {threeAs.map(({ letter, title, description }) => (
              <div
                key={title}
                className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-8 space-y-4 text-center hover:border-[--border-active] transition-all duration-300"
              >
                <div
                  className="text-6xl font-extrabold text-transparent bg-clip-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))",
                  }}
                >
                  {letter}
                </div>
                <h3 className="text-xl font-bold text-[--text-primary]">{title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
