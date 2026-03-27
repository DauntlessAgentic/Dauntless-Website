import React from "react";

const sectors = [
  "Federal Government",
  "Provincial Government",
  "Healthcare",
  "Financial Services",
  "Professional Services",
  "Higher Education",
  "Crown Corporations",
  "Non-Profit",
];

export function TrustedBy() {
  return (
    <section className="relative bg-[--mkt-section] py-12 px-6 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)" }} />
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.1), transparent)" }} />
      <div className="max-w-6xl mx-auto space-y-6">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[--text-muted]">
          Built for organizations in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {sectors.map((sector) => (
            <span
              key={sector}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[--text-muted] transition-colors"
              style={{
                background: "rgba(139,92,246,0.07)",
                border: "1px solid rgba(139,92,246,0.14)",
              }}
            >
              {sector}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
