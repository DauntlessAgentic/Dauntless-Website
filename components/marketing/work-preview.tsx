import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WorkCard } from "@/components/ui/work-card";

const featured = [
  {
    department: "ESDC",
    project: "EI Claim Process Map",
    category: "Process Design" as const,
    sector: "federal" as const,
    image: "/images/work/ServiceCanada-InsuranceClaimsProcess.png",
  },
  {
    department: "Health Canada",
    project: "Program Review & Foresight",
    category: "Foresight" as const,
    sector: "federal" as const,
    image: "/images/work/HC-FORESIGHT.png",
  },
  {
    department: "Treasury Board Secretariat",
    project: "Performance Regulatory Model",
    category: "Performance Design" as const,
    sector: "federal" as const,
    image: "/images/work/TB-PerformanceBasedRegulatoryModel.png",
  },
  {
    department: "Elections Canada",
    project: "Electoral Program Logic Model",
    category: "Program Architecture" as const,
    sector: "federal" as const,
    image: "/images/work/Polling-DMF.png",
  },
  {
    department: "Indigenous & Northern Affairs Canada",
    project: "Systems Model — Land & Resources",
    category: "Systems Thinking" as const,
    sector: "federal" as const,
    image: "/images/work/INAC-SD.png",
  },
  {
    department: "Natural Resources Canada",
    project: "Conceptual & Logic Models",
    category: "Program Architecture" as const,
    sector: "federal" as const,
    image: "/images/work/NRCAN-KM.png",
  },
];

export function WorkPreview() {
  return (
    <section className="bg-[--mkt-section] py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Selected Work</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Proof over promises.</h2>
            <p className="max-w-xl text-sm text-[--text-secondary] leading-relaxed">
              A small selection of work delivered across Canadian government, private sector, and international organizations.
            </p>
          </div>
          <Link href="/work" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors whitespace-nowrap">
            View all 150+ projects <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((p, i) => (
            <WorkCard key={i} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
