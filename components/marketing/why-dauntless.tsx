import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "18+",    label: "Years in public sector transformation" },
  { value: "180+",   label: "AI-augmented workflows designed" },
  { value: "5,000+", label: "Professionals served" },
  { value: "$4M+",   label: "In documented productivity savings" },
];

export function WhyDauntless() {
  return (
    <section className="bg-[--mkt-bg] py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">
            Credentials
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[--text-primary]">
            The Track Record.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="text-center space-y-2 bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-6 hover:border-[--border-active] transition-all duration-300"
            >
              <p
                className="text-3xl font-semibold text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))",
                }}
              >
                {value}
              </p>
              <p className="text-xs text-[--text-muted]">{label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center space-y-4">
          <p className="text-[--text-secondary] leading-relaxed">
            Founded by{" "}
            <span className="text-[--text-primary] font-medium">Craig Marchand</span> — former VP
            Innovation at BDO Canada, FutureCraft program architect, systems thinker, and builder of
            operating architectures at the intersection of AI, human capability, and organizational
            design.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors"
          >
            About Craig <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
