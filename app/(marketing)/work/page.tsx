"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { WorkCard, WorkCategory } from "@/components/ui/work-card";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { ClientRibbon } from "@/components/marketing/client-ribbon";

interface Project {
  department: string;
  project: string;
  category: WorkCategory;
  sector: "federal" | "private" | "international";
  image?: string;
}

const projects: Project[] = [
  { department: "SARA", project: "Species at Risk Act — Conceptual Framework", category: "Strategy Design", sector: "federal", image: "/images/work/SARA.png" },
  { department: "CMP", project: "Case Management Process Architecture", category: "Process Design", sector: "federal", image: "/images/work/CMP.png" },
  { department: "Fisheries & Oceans Canada", project: "Fisheries Act — Program Logic Model", category: "Program Architecture", sector: "federal", image: "/images/work/DFO.png" },
  { department: "CRTC", project: "Enforcement Process Map", category: "Process Design", sector: "federal", image: "/images/work/CRTC-ECE.png" },
  { department: "CSTD", project: "Committee on Science & Technology — Logic Model", category: "Program Architecture", sector: "federal", image: "/images/work/CSTD-Modernization.jpg" },
  { department: "Environment Canada", project: "Science & Technology Conceptual Model", category: "Strategy Design", sector: "federal", image: "/images/work/EC-SCI.jpg" },
  { department: "Health Canada", project: "Fitness To Work — Process Design", category: "Process Design", sector: "federal", image: "/images/work/FTW.jpg" },
  { department: "Health Canada", project: "Food Guide Redesign — Conceptual Model", category: "Strategy Design", sector: "federal", image: "/images/work/HC-FoodGuide.jpg" },
  { department: "Health Canada", project: "Program Review & Foresight", category: "Foresight", sector: "federal", image: "/images/work/HC-FORESIGHT.png" },
  { department: "Health Canada", project: "Qualitative Systems Model", category: "Systems Thinking", sector: "federal", image: "/images/work/MM-RMF.jpg" },
  { department: "Public Health Agency of Canada", project: "Outbreak Response Process Map", category: "Process Design", sector: "federal", image: "/images/work/PHAC-OUTBREAK.jpg" },
  { department: "Elections Canada", project: "Electoral Program Logic Model", category: "Program Architecture", sector: "federal", image: "/images/work/Polling-DMF.png" },
  { department: "Fisheries & Oceans Canada", project: "Aquaculture Framework — Conceptual Model", category: "Strategy Design", sector: "federal", image: "/images/work/AquacultureAct.jpg" },
  { department: "Environment Canada", project: "CBD — Conceptual Model", category: "Strategy Design", sector: "federal", image: "/images/work/Biodiversity.png" },
  { department: "CFIA", project: "Canadian Food Inspection — Conceptual Model", category: "Strategy Design", sector: "federal", image: "/images/work/CFIA-Continuum.png" },
  { department: "CFIA", project: "Planning & Reporting — Logic Model", category: "Program Architecture", sector: "federal", image: "/images/work/CFIA-P&R.png" },
  { department: "Health Canada", project: "CPSD — Logic & Functional Model", category: "Program Architecture", sector: "federal", image: "/images/work/CPSD-OperationalModel.png" },
  { department: "CFIA", project: "Regulatory Operations Conceptual Model", category: "Strategy Design", sector: "federal", image: "/images/work/DFO-Modernization.png" },
  { department: "Transport Canada", project: "FCRO — Conceptual Model", category: "Strategy Design", sector: "federal", image: "/images/work/FCRO-LeadershipFramework.png" },
  { department: "Environment Canada", project: "FCSAP — Conceptual & Logic Models", category: "Program Architecture", sector: "federal", image: "/images/work/FCSAP.png" },
  { department: "Health Canada", project: "Therapeutic Licensing — Program Architecture", category: "Strategy Design", sector: "federal", image: "/images/work/HC-TherapeuticLicensing.png" },
  { department: "Health Canada", project: "CPSD Operational Logic Model", category: "Program Architecture", sector: "federal", image: "/images/work/HECSB-HazardousProductsAct.png" },
  { department: "Innovation, Science & Economic Development", project: "Industry Systems Model", category: "Systems Thinking", sector: "federal", image: "/images/work/IC-ConsumerProtection.png" },
  { department: "Innovation, Science & Economic Development", project: "Sector Conceptual Model", category: "Strategy Design", sector: "federal", image: "/images/work/IC-RegionalPerspectives.png" },
  { department: "Library & Archives Canada", project: "Process Map — Knowledge Architecture", category: "Process Design", sector: "federal", image: "/images/work/LAC-Process.png" },
  { department: "NAN Panorama", project: "Historical Timeline — Knowledge Architecture", category: "Knowledge Architecture", sector: "federal", image: "/images/work/NAN-Panorama.jpg" },
  { department: "Natural Resources Canada", project: "Conceptual & Logic Models", category: "Program Architecture", sector: "federal", image: "/images/work/NRCAN-KM.png" },
  { department: "Natural Resources Canada", project: "Mining Sector — Systems Model", category: "Systems Thinking", sector: "private", image: "/images/work/NRCAN-Mining.png" },
  { department: "Public Safety Canada", project: "Logic Model — Program Architecture", category: "Program Architecture", sector: "federal", image: "/images/work/PSC-PublicSafetyPortfolio.png" },
  { department: "ESDC", project: "EI Claim Process Map", category: "Process Design", sector: "federal", image: "/images/work/ServiceCanada-InsuranceClaimsProcess.png" },
  { department: "Treasury Board Secretariat", project: "Performance Regulatory Model", category: "Performance Design", sector: "federal", image: "/images/work/TB-PerformanceBasedRegulatoryModel.png" },
  { department: "Wrapped Apps", project: "Business Model Design", category: "Business Design", sector: "private", image: "/images/work/WrappedApps.png" },
  { department: "Indigenous & Northern Affairs Canada", project: "Systems Model — Land & Resources", category: "Systems Thinking", sector: "federal", image: "/images/work/INAC-SD.png" },
  { department: "Elections Canada", project: "Spotlight — Strategy Design", category: "Strategy Design", sector: "federal", image: "/images/work/elections-spotlight.jpg" },
  { department: "Financial Consumer Agency of Canada", project: "Process Map", category: "Process Design", sector: "federal", image: "/images/work/FCAC-process.png" },
  { department: "Indigenous & Northern Affairs Canada", project: "Program Systems Model", category: "Systems Thinking", sector: "federal", image: "/images/work/INAC-SD.png" },
  { department: "ESDC / HRSDC", project: "Foresight Report — Future of Work", category: "Foresight", sector: "federal", image: "/images/work/hrsdc-foresight.png" },
  { department: "Indigenous & Northern Affairs Canada", project: "Governance Systems Model", category: "Systems Thinking", sector: "federal", image: "/images/work/INAC-SD.png" },
  { department: "OSC", project: "Organizational Logic Model", category: "Program Architecture", sector: "private", image: "/images/work/OCS-logic.png" },
];

const CATEGORIES: ("All" | WorkCategory)[] = [
  "All",
  "Strategy Design",
  "Program Architecture",
  "Process Design",
  "Systems Thinking",
  "Foresight",
  "Performance Design",
  "Business Design",
  "Knowledge Architecture",
];

const federalDepts = [
  "Environment Canada", "Health Canada", "Innovation, Science & Economic Development",
  "Elections Canada", "Treasury Board Secretariat", "Public Health Agency of Canada",
  "ESDC", "National Defence", "Statistics Canada", "Transport Canada",
  "Fisheries & Oceans Canada", "Global Affairs Canada", "Immigration, Refugees & Citizenship Canada",
  "Public Services & Procurement Canada",
];


export default function WorkPage() {
  const [active, setActive] = useState<"All" | WorkCategory>("All");

  const filtered = active === "All"
    ? projects
    : projects.filter(p => p.category === active);

  return (
    <>
    <MarketingNav />
    <div className="min-h-screen bg-[--mkt-bg]">

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Portfolio</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Decades of Work.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
              150+ Projects.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            Strategy, systems, and design work delivered across Canadian government, private sector, and international organizations.
          </p>
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 pt-2 flex-wrap">
            {[
              { value: "150+", label: "Projects" },
              { value: "50+", label: "Client Organizations" },
              { value: "20+", label: "Years" },
              { value: "$50M+", label: "Value Delivered" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-[--text-primary]">{value}</p>
                <p className="text-xs text-[--text-muted] uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client ribbon */}
      <section className="bg-[--mkt-section] border-y border-[--mkt-border]">
        <div className="max-w-6xl mx-auto px-6 pt-5 pb-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted] mb-3 text-center">Trusted by 50+ organizations</p>
        </div>
        <ClientRibbon />
      </section>

      {/* Filter bar */}
      <section className="bg-[--mkt-section] py-4 px-6 sticky top-16 z-10 border-b border-[--mkt-border]">
        <div className="max-w-6xl mx-auto">
          {/* Mobile: dropdown */}
          <div className="flex items-center gap-3 md:hidden">
            <select
              value={active}
              onChange={(e) => setActive(e.target.value as typeof active)}
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-[--mkt-card] border border-[--mkt-border] text-[--text-primary] focus:outline-none focus:border-[--accent-vivid]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="text-xs text-[--text-muted] shrink-0">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          {/* Desktop: button row */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    active === cat
                      ? "bg-[--accent-vivid] text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                      : "bg-[--mkt-card] border border-[--mkt-border] text-[--text-secondary] hover:border-[--accent-vivid] hover:text-[--text-primary]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-[--text-muted] shrink-0 pl-2">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Portfolio grid */}
      <section className="bg-[--mkt-bg] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-[--text-muted] mb-6">{filtered.length} projects</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p, i) => (
              <WorkCard
                key={i}
                department={p.department}
                project={p.project}
                category={p.category}
                sector={p.sector}
                image={p.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Client strip */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Clients</p>
            <h2 className="text-2xl font-semibold text-[--text-primary]">Trusted Across Government & Industry</h2>
          </div>
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted] text-center">Federal Government</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {federalDepts.map(d => (
                <span key={d} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.18)] text-[--text-secondary]">
                  {d}
                </span>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted] text-center pt-2">Private Sector & International</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Financial Services", "Mining & Resources", "International NGOs", "Healthcare & Pharma"].map(d => (
                <span key={d} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(255,255,255,0.03)] border border-[--mkt-border] text-[--text-secondary]">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[--mkt-bg] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold text-[--text-primary]">Ready to Add Your Project to This List?</h2>
          <p className="text-[--text-secondary]">Every engagement starts with a conversation — no pitch decks, no pressure, just a real discussion about your challenges.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px rgba(124,58,237,0.35)",
            }}
          >
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
    <MarketingFooter />
    </>
  );
}
