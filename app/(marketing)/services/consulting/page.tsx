import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, Layers, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const whatWeDo = [
  { icon: Layers,    title: "Operating Model Design",   description: "How should your organization actually work with AI? We design the roles, workflows, decision gates, and governance that turn AI from a tool into an operating capability." },
  { icon: Search,    title: "Governance Architecture",  description: "AI without governance is a liability. We build the decision frameworks, risk tiers, approval flows, and audit trails that make AI safe to scale — governance that enables speed, not bureaucracy that prevents it." },
  { icon: Zap,       title: "Workflow Architecture",    description: "Where does AI add the most value in your actual work? We map your processes and data flows, identify high-leverage intervention points, and design AI-augmented workflows that produce measurable improvements." },
  { icon: RefreshCw, title: "Knowledge Systems",        description: "The real value of AI isn't automation — it's compounding. We design knowledge systems where every AI-assisted output enriches future work. Your organization gets smarter with every project." },
];

const engagementModels = [
  {
    name: "Discovery Sprint",
    duration: "2–4 weeks",
    best: "Organizations at the beginning of their AI journey, or stuck after failed pilots",
    what: ["Current state assessment — where you are, what's working, what isn't", "Opportunity mapping — where AI adds the most value in your specific context", "Readiness audit — people, process, technology, data and governance gaps", "Strategic roadmap — prioritized path forward with clear milestones"],
    get: ["AI Opportunity Map with prioritized use cases", "Organizational Readiness Assessment", "Strategic Roadmap with phases, dependencies, and investment estimates", "Governance Framework draft", "Executive briefing with board-ready narrative"],
  },
  {
    name: "Design Sprint",
    duration: "4–8 weeks",
    best: "Organizations ready to architect a specific AI initiative",
    what: ["Deep-dive into the target domain — processes, data, people, pain points", "Operating model design — roles, workflows, decision gates, human-AI interaction patterns", "Governance architecture — risk tiers, approval flows, audit trails", "Knowledge system design — how the work compounds over time", "Implementation planning — phases, resources, success criteria"],
    get: ["Complete Operating Architecture document", "Workflow specifications with AI integration points", "Governance Framework with decision gates and risk management", "Implementation Plan with phases, milestones, and resource requirements", "Change Management playbook"],
  },
  {
    name: "Build Sprint",
    duration: "8–16 weeks",
    best: "Organizations ready to implement and operationalize",
    what: ["Implementation of the designed architecture", "Workflow and data pipeline build-out with real AI integration", "Team training integrated with AI Literacy programs", "Pattern encoding — documenting what works so it's repeatable", "Governance activation — decision gates, monitoring, feedback loops"],
    get: ["Operational AI system — live, working, in production", "Trained team capable of operating and evolving the system", "Encoded delivery patterns for consistent quality", "Active governance framework with monitoring", "30-day post-launch support"],
  },
  {
    name: "Advisory Retainer",
    duration: "Quarterly (ongoing)",
    best: "Organizations with operating AI systems that need strategic steering",
    what: ["Quarterly strategic reviews — what's working, what's evolving, what's next", "Pattern refinement — continuously improving delivery patterns based on outcomes", "Architecture evolution — adapting the operating model as AI capabilities advance", "On-demand strategic guidance for emerging challenges and opportunities"],
    get: ["Continuous optimization of your AI operating architecture", "Early access to emerging patterns and frameworks", "Strategic steering as the AI landscape evolves", "Quarterly outcome reports with compounding metrics"],
  },
];

const differentiators = [
  { title: "Outcome-Based, Not Activity-Based",    desc: "We define success as a measurable state change — not hours logged or deliverables produced. Every engagement has clear before/after criteria." },
  { title: "Compounding Knowledge Transfer",       desc: "We don't create dependency. We encode capability into your organization's systems. You keep getting smarter after we leave." },
  { title: "Trust Engineered, Not Promised",       desc: "Every engagement includes explicit trust mechanisms — process transparency, artifact proof, reversibility, accountability hooks. Trust isn't a feeling. It's architecture." },
  { title: "200+ Encoded Delivery Patterns",       desc: "We're not figuring it out as we go. 200+ delivery patterns across strategy, design, and execution — refined through real engagements." },
];

export const metadata: Metadata = {
  title: "AI Operations Consulting",
  description: "We design the operating architecture, governance model, and workflow systems your organization needs to run AI at scale.",
};

export default function ConsultingPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />
      <div className="max-w-6xl mx-auto px-6 pt-[88px] pb-2">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "AI Operations Consulting" }]} />
      </div>

      {/* Hero */}
      <section className="relative pt-10 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(var(--svc-consulting-rgb),0.12) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--svc-consulting-bright)" }}>AI Ops Consulting</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Stop Piloting.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--svc-consulting-bright), var(--svc-consulting))" }}>
              Start Operating.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            Your organization doesn&apos;t have an AI tool problem. It has an AI operations problem. The gap between &ldquo;we tried ChatGPT&rdquo; and &ldquo;AI is embedded in how we work&rdquo; is an architecture gap — and architecture is what we build.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)",
              boxShadow: "0 0 0 1px rgba(var(--accent-bright-rgb),0.5), 0 8px 32px rgba(var(--accent-rgb),0.35)",
            }}
          >
            Book a Discovery Call <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Pilot Graveyard */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">The Problem</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">The Pilot Graveyard</h2>
            <p className="text-sm text-[--text-secondary] max-w-xl mx-auto leading-relaxed">Most organizations are stuck in an endless cycle of AI experimentation that never becomes capability.</p>
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            {[
              { num: "1", label: "Excitement",  desc: "\"AI will change everything!\"" },
              { num: "2", label: "Pilot",        desc: "Build a proof of concept with one team" },
              { num: "3", label: "Success",      desc: "\"It works! Let's scale!\"" },
              { num: "4", label: "Reality",      desc: "No governance, no integration, no change management" },
              { num: "5", label: "Stall",        desc: "Pilot dies. Organization returns to status quo." },
              { num: "6", label: "Repeat",       desc: "New tool, new pilot, same outcome." },
            ].map(({ num, label, desc }) => (
              <div key={num} className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ background: "var(--mkt-card)", boxShadow: "0 0 0 1px rgba(255,255,255,0.04)" }}>
                <span className="text-xs font-bold w-5 shrink-0" style={{ color: "var(--svc-consulting-bright)" }}>{num}.</span>
                <span className="text-base font-semibold text-[--text-primary] w-28 shrink-0">{label}</span>
                <span className="text-sm text-[--text-secondary]">{desc}</span>
              </div>
            ))}
          </div>
          <div
            className="max-w-2xl mx-auto rounded-2xl p-6 text-center space-y-2"
            style={{
              background: "linear-gradient(150deg, rgba(var(--svc-consulting-rgb),0.08) 0%, var(--mkt-card) 55%)",
              border: "1px solid rgba(var(--svc-consulting-mid-rgb),0.20)",
              boxShadow: "0 0 0 1px rgba(var(--svc-consulting-rgb),0.08), 0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <p className="text-base font-bold text-[--text-primary]">The hard truth:</p>
            <p className="text-sm text-[--text-secondary] leading-relaxed">The pilot worked. Your organization didn&apos;t. You don&apos;t need another demo. You need an operating architecture.</p>
          </div>
        </div>
      </section>

      {/* What We Actually Do */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">What We Do</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Architecture Over Tools. Systems Over Experiments.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {whatWeDo.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="relative rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 0 0 1px rgba(var(--svc-consulting-rgb),0.16), 0 4px 20px rgba(0,0,0,0.4)" }}
              >
                <div className="h-[3px]" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--svc-consulting-mid-rgb),0.5) 25%, var(--svc-consulting-mid) 50%, rgba(var(--svc-consulting-mid-rgb),0.5) 75%, transparent)" }} />
                <div className="p-6 space-y-4" style={{ background: "linear-gradient(150deg, rgba(var(--svc-consulting-rgb),0.07) 0%, var(--mkt-card) 55%)" }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "rgba(var(--svc-consulting-rgb),0.12)", border: "1px solid rgba(var(--svc-consulting-mid-rgb),0.22)" }}>
                    <Icon className="h-5 w-5" style={{ color: "var(--svc-consulting-bright)" }} />
                  </div>
                  <h3 className="text-xl font-bold text-[--text-primary]">{title}</h3>
                  <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Models */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Engagement Models</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Four Ways to Work Together</h2>
            <p className="max-w-xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              Every engagement is scoped to where you are. Start with Discovery, go as deep as you need.
            </p>
          </div>
          <div className="space-y-5">
            {engagementModels.map(({ name, duration, best, what, get }, i) => {
              const modelNum = String(i + 1).padStart(2, "0");
              const isFlagship = i === 3;
              const barOpacity   = [0.35, 0.55, 0.75, 1.00][i];
              const glowStrength = [
                "0 0 0 1px rgba(255,255,255,0.04), 0 2px 16px rgba(0,0,0,0.4)",
                "0 0 0 1px rgba(var(--svc-consulting-rgb),0.14), 0 2px 16px rgba(0,0,0,0.4)",
                "0 0 0 1px rgba(var(--svc-consulting-rgb),0.24), 0 4px 24px rgba(var(--svc-consulting-rgb),0.06)",
                "0 0 0 1px rgba(var(--svc-consulting-rgb),0.40), 0 8px 40px rgba(var(--svc-consulting-rgb),0.10)",
              ][i];
              const cardBg = isFlagship
                ? "linear-gradient(160deg, rgba(var(--svc-consulting-rgb),0.09) 0%, var(--mkt-card) 45%)"
                : "var(--mkt-card)";

              return (
                <div key={name} className="relative rounded-2xl overflow-hidden" style={{ boxShadow: glowStrength }}>
                  {/* Top accent bar */}
                  <div className="h-[3px] w-full" style={{
                    background: `linear-gradient(90deg, transparent 0%, rgba(var(--svc-consulting-mid-rgb),${barOpacity * 0.6}) 15%, var(--svc-consulting-mid) 50%, rgba(var(--svc-consulting-mid-rgb),${barOpacity * 0.6}) 85%, transparent 100%)`,
                  }} />

                  <div className="relative p-7 md:p-8 space-y-7" style={{ background: cardBg }}>

                    {/* Watermark */}
                    <span
                      className="absolute bottom-4 right-6 text-[88px] font-black leading-none select-none pointer-events-none tabular-nums"
                      style={{ color: `rgba(var(--svc-consulting-mid-rgb),${[0.04, 0.06, 0.09, 0.13][i]})` }}
                      aria-hidden="true"
                    >
                      {modelNum}
                    </span>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className="text-xs font-bold tracking-[0.18em] uppercase"
                            style={{ color: `rgba(var(--svc-consulting-bright-rgb),${[0.5, 0.65, 0.8, 1.0][i]})` }}
                          >
                            Model {modelNum}
                          </span>
                          {isFlagship && (
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(var(--svc-consulting-rgb),0.12)", color: "var(--svc-consulting-bright)", border: "1px solid rgba(var(--svc-consulting-mid-rgb),0.30)" }}
                            >
                              Ongoing Partnership
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-[--text-primary] leading-tight">{name}</h3>
                        <p className="text-sm text-[--text-muted] leading-relaxed">Best for: {best}</p>
                      </div>
                      <span
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
                        style={{
                          background: `rgba(var(--svc-consulting-rgb),${[0.08, 0.11, 0.14, 0.18][i]})`,
                          color: "var(--svc-consulting-bright)",
                          border: `1px solid rgba(var(--svc-consulting-mid-rgb),${[0.18, 0.24, 0.30, 0.40][i]})`,
                        }}
                      >
                        {duration}
                      </span>
                    </div>

                    {/* What Happens / What You Get */}
                    <div className="grid md:grid-cols-2 gap-6 pt-6 pr-20 pb-20" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[--text-muted]">What Happens</p>
                        <ul className="space-y-2">
                          {what.map(w => (
                            <li key={w} className="flex items-start gap-2.5 text-sm text-[--text-secondary] leading-snug">
                              <span className="shrink-0 rounded-full mt-[7px]"
                                style={{ width: "6px", height: "6px", minWidth: "6px", background: `rgba(var(--svc-consulting-mid-rgb),${[0.45, 0.55, 0.70, 0.90][i]})` }} />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[--text-muted]">What You Get</p>
                        <ul className="space-y-2">
                          {get.map(g => (
                            <li key={g} className="flex items-start gap-2.5 text-sm text-[--text-secondary] leading-snug">
                              <span className="shrink-0 font-bold text-sm leading-none mt-0.5"
                                style={{ color: `rgba(var(--svc-consulting-bright-rgb),${[0.6, 0.7, 0.85, 1.0][i]})` }}>✓</span>
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Our Approach</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">What Makes This Different</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {differentiators.map(({ title, desc }) => (
              <div
                key={title}
                className="relative rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 0 0 1px rgba(var(--svc-consulting-rgb),0.14), 0 2px 16px rgba(0,0,0,0.4)" }}
              >
                <div className="h-[3px]" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--svc-consulting-mid-rgb),0.4) 25%, var(--svc-consulting-mid) 50%, rgba(var(--svc-consulting-mid-rgb),0.4) 75%, transparent)" }} />
                <div className="p-6 space-y-3" style={{ background: "linear-gradient(150deg, rgba(var(--svc-consulting-rgb),0.06) 0%, var(--mkt-card) 55%)" }}>
                  <h3 className="text-xl font-bold text-[--text-primary]">{title}</h3>
                  <p className="text-sm text-[--text-secondary] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Voices */}
      <section className="bg-[--mkt-section] py-16 px-6 border-t border-[--mkt-border]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--svc-consulting-bright)" }}>Client Voices</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-[--text-primary]">In Their Words</h2>
            <p className="max-w-xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              From federal directors to program executives — what clients say after working with us.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">

            {/* ESDC */}
            <div className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
              style={{
                background: "linear-gradient(150deg, rgba(var(--svc-consulting-rgb),0.08) 0%, var(--mkt-card) 55%)",
                border: "1px solid rgba(var(--svc-consulting-mid-rgb),0.16)",
                boxShadow: "0 0 0 1px rgba(var(--svc-consulting-rgb),0.08), 0 6px 24px rgba(0,0,0,0.4)",
              }}>
              <div className="text-5xl leading-none font-black select-none opacity-20"
                style={{ backgroundImage: "linear-gradient(135deg, var(--svc-consulting-mid), var(--svc-consulting-bright))", WebkitBackgroundClip: "text", color: "transparent" }}
                aria-hidden="true">&ldquo;</div>
              <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
                &ldquo;The input I have seen is great and helpful for me to open up discussions with my DG. The engagement process was extremely productive and impactful.&rdquo;
              </blockquote>
              <div className="border-t pt-4 space-y-0.5" style={{ borderColor: "rgba(var(--svc-consulting-mid-rgb),0.15)" }}>
                <p className="text-sm font-semibold text-[--text-primary]">Director, Program Operations Branch</p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--svc-consulting-bright)" }}>Government of Canada</p>
                <p className="text-xs text-[--text-muted]">Employment &amp; Social Development Canada</p>
              </div>
            </div>

            {/* Environment Canada */}
            <div className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
              style={{
                background: "linear-gradient(150deg, rgba(var(--svc-consulting-rgb),0.09) 0%, var(--mkt-card) 55%)",
                border: "1px solid rgba(var(--svc-consulting-mid-rgb),0.18)",
                boxShadow: "0 0 0 1px rgba(var(--svc-consulting-rgb),0.10), 0 6px 24px rgba(0,0,0,0.4)",
              }}>
              <div className="text-5xl leading-none font-black select-none opacity-20"
                style={{ backgroundImage: "linear-gradient(135deg, var(--svc-consulting-mid), var(--svc-consulting-bright))", WebkitBackgroundClip: "text", color: "transparent" }}
                aria-hidden="true">&ldquo;</div>
              <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
                &ldquo;The foresight work gave us a vocabulary for decisions we didn&apos;t know how to frame. That clarity was the most valuable deliverable.&rdquo;
              </blockquote>
              <div className="border-t pt-4 space-y-0.5" style={{ borderColor: "rgba(var(--svc-consulting-mid-rgb),0.15)" }}>
                <p className="text-sm font-semibold text-[--text-primary]">Executive Director, Strategic Planning</p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--svc-consulting-bright)" }}>Government of Canada</p>
                <p className="text-xs text-[--text-muted]">Environment &amp; Climate Change Canada</p>
              </div>
            </div>

            {/* TBS */}
            <div className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
              style={{
                background: "linear-gradient(150deg, rgba(var(--svc-consulting-rgb),0.10) 0%, var(--mkt-card) 55%)",
                border: "1px solid rgba(var(--svc-consulting-mid-rgb),0.20)",
                boxShadow: "0 0 0 1px rgba(var(--svc-consulting-rgb),0.12), 0 6px 24px rgba(0,0,0,0.4)",
              }}>
              <div className="text-5xl leading-none font-black select-none opacity-20"
                style={{ backgroundImage: "linear-gradient(135deg, var(--svc-consulting-mid), var(--svc-consulting-bright))", WebkitBackgroundClip: "text", color: "transparent" }}
                aria-hidden="true">&ldquo;</div>
              <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
                &ldquo;Working with Craig&apos;s team changed how our team thinks about planning and process. Using rich visual process maps and layering in detail really helped us to understand where there are high leverage opportunities for improvement and automation.&rdquo;
              </blockquote>
              <div className="border-t pt-4 space-y-0.5" style={{ borderColor: "rgba(var(--svc-consulting-mid-rgb),0.15)" }}>
                <p className="text-sm font-semibold text-[--text-primary]">Project Executive, Benefits Modernization</p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--svc-consulting-bright)" }}>Government of Canada</p>
                <p className="text-xs text-[--text-muted]">Employment &amp; Social Development Canada</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Also in Services */}
      <section className="bg-[--mkt-bg] border-t border-[--mkt-border] py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">Also in Services</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/services/training" className="relative flex flex-col gap-0 rounded-2xl overflow-hidden group text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(150deg, rgba(var(--svc-training-rgb),0.08) 0%, var(--mkt-card) 55%)", boxShadow: "0 0 0 1px rgba(var(--svc-training-rgb),0.16), 0 4px 20px rgba(0,0,0,0.4)" }}>
              <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--svc-training-rgb),0.6) 25%, var(--svc-training) 50%, rgba(var(--svc-training-rgb),0.6) 75%, transparent)" }} />
              <div className="p-5 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--svc-training)" }}>AI Literacy Training</p>
                <p className="text-base font-semibold text-[--text-primary] flex items-center gap-1.5">Transform team capability <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                <p className="text-sm text-[--text-secondary] leading-relaxed">Team-wide AI fluency in days, not months. Executive briefings to full practitioner programs built for government and enterprise.</p>
              </div>
            </Link>
            <Link href="/services/agentic-systems" className="relative flex flex-col gap-0 rounded-2xl overflow-hidden group text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(150deg, rgba(var(--svc-agentic-rgb),0.08) 0%, var(--mkt-card) 55%)", boxShadow: "0 0 0 1px rgba(var(--svc-agentic-rgb),0.16), 0 4px 20px rgba(0,0,0,0.4)" }}>
              <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--svc-agentic-rgb),0.6) 25%, var(--svc-agentic) 50%, rgba(var(--svc-agentic-rgb),0.6) 75%, transparent)" }} />
              <div className="p-5 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--svc-agentic)" }}>Agentic Systems</p>
                <p className="text-base font-semibold text-[--text-primary] flex items-center gap-1.5">Build autonomous intelligence <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                <p className="text-sm text-[--text-secondary] leading-relaxed">Custom AI agent pipelines that connect your data, your processes, and your people. Built to run without constant maintenance.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[--mkt-section] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold text-[--text-primary]">Ready to Move Beyond Pilots?</h2>
          <p className="text-sm text-[--text-secondary] leading-relaxed">Every consulting engagement starts with a Discovery conversation. We&apos;ll assess where you are, identify the highest-leverage opportunities, and design the path forward.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)",
                boxShadow: "0 0 0 1px rgba(var(--accent-bright-rgb),0.5), 0 8px 32px rgba(var(--accent-rgb),0.35)",
              }}
            >
              Book a Discovery Call <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/services"><Button variant="outline" size="lg">See All Services</Button></Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
