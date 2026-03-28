import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageCTA } from "@/components/marketing/page-cta";

export const metadata: Metadata = {
  title: "Case Studies — Dauntless",
  description:
    "Deep dives into how Dauntless has helped government and enterprise organizations solve complex systems challenges. Real work, real outcomes.",
};

const caseStudies = [
  {
    slug: "esdc-process-redesign",
    client: "Employment & Social Development Canada",
    title: "Unifying Six Regional Offices Under a Single Process Architecture",
    category: "Process Design",
    duration: "8 weeks",
    image: "/images/work/ServiceCanada-InsuranceClaimsProcess.png",
    summary:
      "A major program delivery branch was operating across six regional offices with no standardized claim processing workflow. Inconsistency was driving errors, compliance risk, and staff frustration.",
    outcomes: ["Single standardized process adopted across all regions", "Estimated 30% reduction in processing variance", "Framework became the basis for the 2023 digital transformation initiative"],
  },
  {
    slug: "health-canada-foresight",
    client: "Health Canada",
    title: "Building a 10-Year Portfolio Foresight for a Regulatory Program",
    category: "Foresight & Program Architecture",
    duration: "12 weeks",
    image: "/images/work/HC-FORESIGHT.png",
    summary:
      "A regulatory program portfolio had grown organically over 20 years. Senior leadership needed to understand what the portfolio would need to look like in 10 years — and what decisions to make today.",
    outcomes: ["Portfolio review leading to restructuring of two program streams", "Systems model used as the decision framework for a major budget allocation process", "Three future-state scenarios with associated strategic implications"],
  },
  {
    slug: "tbs-performance-model",
    client: "Treasury Board Secretariat",
    title: "Designing a Performance-Based Regulatory Architecture",
    category: "Performance Design",
    duration: "6 weeks",
    image: "/images/work/TB-PerformanceBasedRegulatoryModel.png",
    summary:
      "A policy team needed a performance-based regulatory model that could apply across diverse regulated sectors. Existing frameworks were compliance-oriented, not outcome-oriented.",
    outcomes: ["Model adopted as reference architecture across three directorates", "Self-assessment tool embedded in the model for ongoing use", "Tiered performance measurement architecture applied to logic model methodology"],
  },
];

const categoryColor: Record<string, string> = {
  "Process Design": "#60a5fa",
  "Foresight & Program Architecture": "#fbbf24",
  "Performance Design": "#34d399",
};
const categoryBg: Record<string, string> = {
  "Process Design": "rgba(59,130,246,0.10)",
  "Foresight & Program Architecture": "rgba(245,158,11,0.10)",
  "Performance Design": "rgba(34,197,94,0.10)",
};
const categoryBorder: Record<string, string> = {
  "Process Design": "rgba(59,130,246,0.25)",
  "Foresight & Program Architecture": "rgba(245,158,11,0.22)",
  "Performance Design": "rgba(34,197,94,0.22)",
};

export default function CaseStudiesPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="bg-[--mkt-section] border-b border-[--mkt-border] py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Case Studies</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[--text-primary] leading-tight">
            The work, in depth.
          </h1>
          <p className="text-lg text-[--text-secondary] leading-relaxed max-w-2xl">
            Each project is a system problem with a human cost. Here's how we approached three of them — the challenge, the process, and the outcomes that lasted.
          </p>
        </div>
      </section>

      {/* Case study cards */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {caseStudies.map((cs) => (
            <Link
              key={cs.slug}
              href={`/case-studies/${cs.slug}`}
              className="group flex flex-col md:flex-row soft-card soft-card-lift overflow-hidden"
            >
              {/* Image */}
              <div className="relative w-full md:w-72 shrink-0 h-52 md:h-auto overflow-hidden bg-[--mkt-section]">
                <Image
                  src={cs.image}
                  alt={cs.title}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 288px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[--mkt-card] opacity-0 md:opacity-60" />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 p-6 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color: categoryColor[cs.category] ?? "#a78bfa",
                      background: categoryBg[cs.category] ?? "rgba(139,92,246,0.10)",
                      border: `1px solid ${categoryBorder[cs.category] ?? "rgba(139,92,246,0.22)"}`,
                    }}
                  >
                    {cs.category}
                  </span>
                  <span className="text-[10px] text-[--text-muted] font-medium">{cs.duration}</span>
                </div>

                <p className="text-xs font-semibold text-[--accent-vivid] uppercase tracking-wider">
                  {cs.client}
                </p>
                <h2 className="text-lg font-semibold text-[--text-primary] leading-snug group-hover:text-[--accent-bright] transition-colors">
                  {cs.title}
                </h2>
                <p className="text-sm text-[--text-secondary] leading-relaxed flex-1">{cs.summary}</p>

                <ul className="space-y-1.5 mt-1">
                  {cs.outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[--text-muted]">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[--accent-vivid] shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>

                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[--accent-vivid] group-hover:gap-2 transition-all">
                  Read the full case study <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Link to full portfolio */}
      <section className="bg-[--mkt-section] border-t border-[--mkt-border] py-10 px-6 text-center">
        <p className="text-sm text-[--text-secondary] mb-3">
          These are three of 150+ projects delivered across government and the private sector.
        </p>
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[--accent-vivid] hover:text-[--accent-bright] transition-colors"
        >
          Browse the full portfolio <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <PageCTA
        heading="Have a similar challenge? Let's talk."
        subtext="Every engagement starts with a single conversation — no pitch decks, no pressure."
        buttonLabel="Start a Conversation"
        buttonHref="/contact"
      />

      <MarketingFooter />
    </>
  );
}
