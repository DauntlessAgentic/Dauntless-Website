import React from "react";

const federalDepts = [
  "Environment Canada",
  "Health Canada",
  "Innovation, Science & Economic Development",
  "Elections Canada",
  "Treasury Board Secretariat",
  "Public Health Agency of Canada",
  "Employment & Social Development Canada",
  "National Defence",
  "Statistics Canada",
  "Transport Canada",
  "Fisheries & Oceans Canada",
  "Global Affairs Canada",
  "Immigration, Refugees & Citizenship Canada",
  "Public Services & Procurement Canada",
];

const privateSectors = [
  "Financial Services",
  "Mining & Resources",
  "International NGOs",
  "Healthcare & Pharma",
];

export function TrustedBy() {
  return (
    <section className="relative bg-[--mkt-section] py-10 px-6 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-bright-rgb),0.2), transparent)" }} />
      <div className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-bright-rgb),0.1), transparent)" }} />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Federal departments */}
        <div className="space-y-4">
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[--text-muted]">
            Federal Government Clients
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {federalDepts.map((dept) => (
              <span
                key={dept}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[--text-secondary] transition-colors"
                style={{ background: "rgba(var(--accent-bright-rgb),0.07)", border: "1px solid rgba(var(--accent-bright-rgb),0.14)" }}
              >
                {dept}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px max-w-xs mx-auto"
          style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-bright-rgb),0.2), transparent)" }} />

        {/* Private sector */}
        <div className="space-y-4">
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[--text-muted]">
            Private Sector & International
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {privateSectors.map((s) => (
              <span
                key={s}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[--text-muted]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
