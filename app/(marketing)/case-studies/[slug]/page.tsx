import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Tag, Quote } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { WorkCard } from "@/components/ui/work-card";
import { PageCTA } from "@/components/marketing/page-cta";

interface CaseStudy {
  slug: string;
  client: string;
  title: string;
  category: string;
  categoryTag: "Process Design" | "Foresight" | "Performance Design" | "Strategy Design" | "Program Architecture" | "Systems Thinking" | "Business Design" | "Knowledge Architecture";
  duration: string;
  image: string;
  challenge: string;
  approach: { phase: string; description: string }[];
  outcomes: { metric?: string; metricLabel?: string; points: string[] };
  quote?: { text: string; author: string; role: string };
  related: { department: string; project: string; category: "Process Design" | "Foresight" | "Performance Design" | "Strategy Design" | "Program Architecture" | "Systems Thinking" | "Business Design" | "Knowledge Architecture"; image?: string }[];
}

const caseStudies: Record<string, CaseStudy> = {
  "esdc-process-redesign": {
    slug: "esdc-process-redesign",
    client: "Employment & Social Development Canada",
    title: "Unifying Six Regional Offices Under a Single Process Architecture",
    category: "Process Design",
    categoryTag: "Process Design",
    duration: "8 weeks",
    image: "/images/work/ServiceCanada-InsuranceClaimsProcess.png",
    challenge:
      "A major program delivery branch was operating across six regional offices with no standardized claim processing workflow. Each region had developed its own informal procedures over years of independent operation, resulting in inconsistent decisions, compliance risk, and staff frustration. Leadership had tried to standardize before — but without a clear process map, every attempt stalled.",
    approach: [
      { phase: "Discovery & Mapping", description: "Structured interviews with staff across all six regions. Document analysis of existing SOPs, forms, and decision logs. Built a composite picture of how the process actually ran — not how it was supposed to run." },
      { phase: "Decision Point Analysis", description: "Identified 14 critical decision points in the process where logic diverged by region. For each, documented the variation range, the compliance implications, and the root cause of inconsistency." },
      { phase: "Process Model Design", description: "Designed a unified process model with a single logic path, embedded governance triggers at high-risk decision points, and explicit escalation protocols." },
      { phase: "Validation & Handoff", description: "Tested the model against 40 representative historical cases across all regions. Refined based on edge cases. Delivered with implementation guide and a facilitation kit for regional rollout sessions." },
    ],
    outcomes: {
      metric: "30%",
      metricLabel: "Estimated reduction in processing variance",
      points: [
        "Single standardized process adopted across all six regional offices",
        "14 decision points with inconsistent logic resolved and documented",
        "Framework became the reference architecture for the department's 2023 digital transformation initiative",
        "Regional managers reported improved staff confidence and reduced escalations within 90 days of rollout",
      ],
    },
    quote: {
      text: "The engagement process was extremely productive and impactful.",
      author: "Director, Program Operations Branch",
      role: "Employment & Social Development Canada",
    },
    related: [
      { department: "Service Canada", project: "Insurance Claims Process Redesign", category: "Process Design", image: "/images/work/ServiceCanada-InsuranceClaimsProcess.png" },
      { department: "CFIA", project: "Program & Regulatory Continuum", category: "Process Design", image: "/images/work/CFIA-Continuum.png" },
      { department: "LAC", project: "Records Management Process Architecture", category: "Process Design", image: "/images/work/LAC-Process.png" },
    ],
  },

  "health-canada-foresight": {
    slug: "health-canada-foresight",
    client: "Health Canada",
    title: "Building a 10-Year Portfolio Foresight for a Regulatory Program",
    category: "Foresight & Program Architecture",
    categoryTag: "Foresight",
    duration: "12 weeks",
    image: "/images/work/HC-FORESIGHT.png",
    challenge:
      "A regulatory program portfolio had grown organically over 20 years. Programs had been added, modified, and layered without a coordinated strategy — producing significant interdependencies that no one had mapped. Senior leadership needed to understand what the portfolio would need to look like in 10 years to remain effective, and what decisions to make today to get there.",
    approach: [
      { phase: "Stakeholder Engagement", description: "Facilitated 18 structured interviews and 4 cross-branch workshops with program managers, policy leads, and regulatory scientists. Surfaced the informal knowledge that never appears in org charts." },
      { phase: "Systems Modelling", description: "Built a qualitative systems model mapping program interdependencies, shared resource dependencies, and external driver pressures. The model made visible what people had sensed but couldn't articulate." },
      { phase: "Scenario Development", description: "Developed three distinct future-state scenarios for the portfolio based on different combinations of policy direction, resource reality, and regulatory environment. Each scenario came with a strategic implication map." },
      { phase: "Foresight Report & Decision Framework", description: "Synthesized findings into a foresight report with a decision framework that mapped near-term decisions to long-term portfolio consequences. Designed to support the department's upcoming budget cycle." },
    ],
    outcomes: {
      metric: "3",
      metricLabel: "Future-state scenarios with strategic implication maps",
      points: [
        "Portfolio review led to restructuring of two program streams previously identified as redundant",
        "Systems model used as the decision framework for a major budget allocation process",
        "Foresight report adopted as a reference document for departmental planning cycles",
        "Cross-branch relationships strengthened through facilitated engagement process",
      ],
    },
    related: [
      { department: "HRSDC", project: "Environmental Foresight Analysis", category: "Foresight", image: "/images/work/hrsdc-foresight.png" },
      { department: "Health Canada", project: "Food Guide — Program Architecture", category: "Program Architecture", image: "/images/work/HC-FoodGuide.jpg" },
      { department: "HECSB", project: "Hazardous Products Act — Logic Model", category: "Program Architecture", image: "/images/work/HECSB-HazardousProductsAct.png" },
    ],
  },

  "tbs-performance-model": {
    slug: "tbs-performance-model",
    client: "Treasury Board Secretariat",
    title: "Designing a Performance-Based Regulatory Architecture",
    category: "Performance Design",
    categoryTag: "Performance Design",
    duration: "6 weeks",
    image: "/images/work/TB-PerformanceBasedRegulatoryModel.png",
    challenge:
      "A policy team needed a performance-based regulatory model that could apply consistently across diverse regulated sectors — from food safety to financial services. Existing frameworks were compliance-oriented: they measured whether rules were followed, not whether regulations were achieving their intended outcomes. The team needed an architecture that could measure outcomes at scale without creating an impossible reporting burden.",
    approach: [
      { phase: "Framework Analysis", description: "Reviewed 12 existing regulatory performance models from Canadian federal and provincial governments, plus OECD and US regulatory frameworks. Identified the structural gap between compliance metrics and outcome metrics." },
      { phase: "Architecture Design", description: "Designed a tiered performance measurement architecture using logic model methodology. Three tiers: immediate outputs, intermediate outcomes, and long-term regulatory impact. Each tier with defined indicator types and data source requirements." },
      { phase: "Self-Assessment Tool", description: "Built a self-assessment tool embedded in the model — allowing regulated entities to assess their own performance against the outcome indicators without requiring external audits for routine reporting." },
      { phase: "Sector Testing & Refinement", description: "Tested the model against three regulated sectors: food safety, consumer product safety, and telecommunications. Refined the indicator language and tier definitions based on applicability testing." },
    ],
    outcomes: {
      metric: "3",
      metricLabel: "Directorates adopted the model as reference architecture",
      points: [
        "Model adopted as reference architecture for regulatory modernization across three directorates",
        "Self-assessment tool embedded in the model reduced external audit requirements for routine performance reporting",
        "Tiered architecture successfully mapped outcomes across three distinct regulated sectors",
        "Framework cited in subsequent Treasury Board guidance on regulatory performance measurement",
      ],
    },
    related: [
      { department: "Treasury Board", project: "Performance-Based Regulatory Model", category: "Performance Design", image: "/images/work/TB-PerformanceBasedRegulatoryModel.png" },
      { department: "OCS", project: "Logic Model & Performance Framework", category: "Performance Design", image: "/images/work/OCS-logic.png" },
      { department: "Elections Canada", project: "Performance Design Spotlight", category: "Performance Design", image: "/images/work/elections-spotlight.jpg" },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(caseStudies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cs = caseStudies[slug];
  if (!cs) return {};
  return {
    title: `${cs.title} — Case Study`,
    description: cs.challenge.slice(0, 155),
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = caseStudies[slug];
  if (!cs) notFound();

  const categoryColor: Record<string, string> = {
    "Process Design": "#60a5fa",
    "Foresight & Program Architecture": "#fbbf24",
    "Performance Design": "#34d399",
  };

  return (
    <>
      <MarketingNav />

      {/* Back nav */}
      <div className="bg-[--mkt-section] border-b border-[--mkt-border] py-3 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-1.5 text-xs text-[--text-muted] hover:text-[--text-secondary] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Case Studies
          </Link>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative w-full h-72 md:h-96 bg-[--mkt-section] overflow-hidden">
        <Image
          src={cs.image}
          alt={cs.title}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[--mkt-bg]" />
      </div>

      {/* Header */}
      <section className="bg-[--mkt-bg] px-6 pt-10 pb-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: categoryColor[cs.category] ?? "#a78bfa",
                background: "rgba(139,92,246,0.10)",
                border: "1px solid rgba(139,92,246,0.22)",
              }}
            >
              <Tag className="inline h-3 w-3 mr-1 -mt-0.5" />
              {cs.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[--text-muted]">
              <Clock className="h-3.5 w-3.5" /> {cs.duration}
            </span>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">{cs.client}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[--text-primary] leading-tight max-w-3xl">
            {cs.title}
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[--mkt-bg] px-6 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">

          {/* Main column */}
          <div className="md:col-span-2 space-y-12">

            {/* Challenge */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">The Challenge</h2>
              <p className="text-[--text-secondary] leading-relaxed">{cs.challenge}</p>
            </div>

            {/* Approach */}
            <div className="space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">The Approach</h2>
              <div className="space-y-4">
                {cs.approach.map((phase, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
                      >
                        {i + 1}
                      </div>
                      {i < cs.approach.length - 1 && (
                        <div className="w-px flex-1 bg-[--mkt-border] mt-1" />
                      )}
                    </div>
                    <div className="pb-4 space-y-1">
                      <p className="text-sm font-semibold text-[--text-primary]">{phase.phase}</p>
                      <p className="text-sm text-[--text-secondary] leading-relaxed">{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            {cs.quote && (
              <div
                className="rounded-xl p-6 space-y-3"
                style={{
                  background: "rgba(124,58,237,0.06)",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                <Quote className="h-6 w-6 text-[--accent-vivid] opacity-60" />
                <blockquote className="text-base font-medium text-[--text-primary] italic leading-relaxed">
                  &ldquo;{cs.quote.text}&rdquo;
                </blockquote>
                <div className="border-t border-[--mkt-border] pt-3">
                  <p className="text-sm font-semibold text-[--text-primary]">{cs.quote.author}</p>
                  <p className="text-xs text-[--text-muted]">{cs.quote.role}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metric callout */}
            <div
              className="rounded-xl p-5 text-center space-y-1"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(139,92,246,0.06))",
                border: "1px solid rgba(139,92,246,0.25)",
              }}
            >
              <p
                className="text-4xl font-bold"
                style={{ color: "#a78bfa" }}
              >
                {cs.outcomes.metric}
              </p>
              <p className="text-xs text-[--text-secondary] leading-snug">{cs.outcomes.metricLabel}</p>
            </div>

            {/* Outcomes */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Outcomes</h2>
              <ul className="space-y-2.5">
                {cs.outcomes.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[--text-secondary]">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[--accent-vivid] shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Engagement details */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "var(--mkt-section)", border: "1px solid var(--mkt-border)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Engagement</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[--text-muted]">Client</span>
                  <span className="text-[--text-secondary] font-medium text-right max-w-[60%]">{cs.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--text-muted]">Duration</span>
                  <span className="text-[--text-secondary] font-medium">{cs.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--text-muted]">Type</span>
                  <span className="text-[--text-secondary] font-medium">{cs.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related work */}
      <section className="bg-[--mkt-section] border-t border-[--mkt-border] py-14 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Related Work</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {cs.related.map((w, i) => (
              <WorkCard
                key={i}
                department={w.department}
                project={w.project}
                category={w.category}
                image={w.image}
              />
            ))}
          </div>
          <div className="pt-2">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[--accent-vivid] hover:text-[--accent-bright] transition-colors"
            >
              Browse all 150+ projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
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
