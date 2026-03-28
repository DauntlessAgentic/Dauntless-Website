import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Shield, Brain, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkCard } from "@/components/ui/work-card";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const layers = [
  {
    icon: Bot,
    num: "01",
    title: "Agent Fleet Design",
    subtitle: "Design the constellation of AI agents your organization needs.",
    description: "We don't build one monolithic AI. We design specialized agents organized into four archetypes.",
    items: [
      { name: "🧭 Strategists", desc: "Agents that route, orchestrate, and plan. They decide where work goes and how it moves through the system." },
      { name: "⚙️ Operators", desc: "Agents that do the work — research, draft, curate, produce. They write deliverables to canonical destinations." },
      { name: "🔍 Auditors", desc: "Agents that verify and enforce. Independent assurance layer — no agent checks its own work." },
      { name: "🎖️ Chief of Staff", desc: "The human-agent bridge. Mediates approvals, handles escalations, translates between human intent and system execution." },
    ],
    callout: "Separation of Powers: No agent routes and executes. No agent produces and audits. Constitutional governance for AI.",
  },
  {
    icon: Shield,
    num: "02",
    title: "Decision Architecture",
    subtitle: "Design the decision frameworks that determine when agents act autonomously.",
    description: "The principle: autonomous where safe, human-controlled where it matters. The governance enables speed — it doesn't prevent it.",
    items: [
      { name: "Risk Tiers", desc: "Every action classified by consequence level (Low / Medium / High)" },
      { name: "Decision Gates", desc: "Explicit checkpoints where human approval is required" },
      { name: "PROPOSE → APPROVE → COMMIT", desc: "The canonical flow for high-stakes decisions" },
      { name: "Confidence Scoring", desc: "Agents report their confidence level; low confidence triggers human review" },
    ],
    callout: null,
  },
  {
    icon: Brain,
    num: "03",
    title: "Knowledge Architecture",
    subtitle: "Design the knowledge systems that allow agents to learn from every action.",
    description: "The compounding effect: every agent action deposits knowledge. Every future action draws from that knowledge. The 1,000th decision is informed by the 999 that came before.",
    items: [
      { name: "Three Shelves Model", desc: "Operational surface (Desk), proven knowledge (Bookshelf), archives (Filing Cabinet)" },
      { name: "Memory Tiers", desc: "M0 through M4, from ephemeral context to permanent organizational knowledge" },
      { name: "Confidence Decay", desc: "Knowledge that isn't validated degrades over time, preventing stale intelligence" },
      { name: "Canonical Promotion", desc: "The best work gets promoted to reusable status, building the organizational brain" },
    ],
    callout: null,
  },
  {
    icon: BarChart3,
    num: "04",
    title: "Observability & Control",
    subtitle: "Build the dashboards, logs, and monitoring that let humans understand and control the system.",
    description: "The system should feel like a cockpit, not a black box. Every agent action is traceable. Every decision is auditable.",
    items: [
      { name: "Generative Decision Surface", desc: "Three-section dashboard: What needs my judgment? What changed? What's running safely?" },
      { name: "Workflow Logs", desc: "Complete audit trail of every agent action with input, output, and delta" },
      { name: "Health Monitoring", desc: "Real-time system health with early warning signals" },
      { name: "Three-Mode Interface", desc: "Dashboards to observe, Agents to work, Presentations to deliver" },
    ],
    callout: null,
  },
];

const useCases = [
  { icon: "📥", title: "Intelligent Intake & Routing", desc: "Automatic classification, prioritization, and routing of incoming work — emails, requests, tickets, signals — to the right person or process with the right context." },
  { icon: "📋", title: "Operations Orchestration", desc: "End-to-end management of complex operational workflows — from initiation through execution to outcome capture — with encoded patterns and quality assurance." },
  { icon: "📊", title: "Intelligence & Signal Processing", desc: "Continuous monitoring of market signals, competitive intelligence, regulatory changes, and opportunity indicators — triaged by urgency and routed to the right decision-maker." },
  { icon: "📝", title: "Content & Knowledge Operations", desc: "AI-assisted content creation, curation, and distribution — powered by real outcomes and institutional knowledge, not generic AI-generated filler." },
  { icon: "💰", title: "Revenue & Pipeline Operations", desc: "Full pipeline management from lead qualification through proposal generation to deal closing — with agents that draw from proven templates, success patterns, and organizational intelligence." },
  { icon: "🏗️", title: "Enterprise Operating Systems", desc: "Complete agentic operating systems that unify your organization's core workflows — connecting strategy, operations, delivery, and knowledge into a single intelligent architecture." },
];

const engagementPhases = [
  { phase: "Discovery", what: "Map your current operations, identify agentic opportunities, assess readiness", duration: "2–4 weeks" },
  { phase: "Architecture", what: "Design the agent fleet, decision architecture, knowledge systems, and observability layer", duration: "4–6 weeks" },
  { phase: "Build", what: "Implement the agentic system — agents, databases, workflows, governance, dashboards", duration: "8–16 weeks" },
  { phase: "Activate", what: "Launch with human-in-the-loop. Agents propose, humans approve. Calibrate confidence thresholds.", duration: "2–4 weeks" },
  { phase: "Compound", what: "System learns from every action. Patterns refine. Knowledge compounds. Governance tightens.", duration: "Ongoing" },
];


export const metadata: Metadata = {
  title: "Agentic Systems — Dauntless",
  description: "Custom AI agent pipelines that connect your data, your processes, and your people. Built to run without constant maintenance.",
};

export default function AgenticSystemsPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />
      <div className="max-w-6xl mx-auto px-6 pt-5 pb-1">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Agentic Systems" }]} />
      </div>

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Agentic Systems</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Beyond Tools. Beyond Automation.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
              Into Agentic.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            The next frontier isn't giving humans better AI tools. It's building AI agents — autonomous capabilities that sense, propose, execute, and learn within structured governance. Not science fiction. Operating architecture.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg" className="gap-2">Explore Agentic Architecture <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      {/* Tools vs Agents comparison */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-[--text-primary]">From Tools to Agents</h2>
            <p className="text-[--text-muted] max-w-2xl mx-auto">The key insight: agentic systems aren't about removing humans. They're about amplifying human judgment — letting AI handle the volume while humans handle the decisions that matter.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--mkt-border]">
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-[--text-muted] w-36"></th>
                  {["AI Tools", "AI Automation", "Agentic Systems"].map(h => (
                    <th key={h} className={`text-left py-3 px-4 text-xs font-bold uppercase tracking-widest ${h === "Agentic Systems" ? "text-[--accent-vivid]" : "text-[--text-muted]"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "How it works", vals: ["Human prompts, AI responds", "Predefined triggers execute predefined actions", "AI agents sense context, propose actions, execute within guardrails"] },
                  { label: "Who decides", vals: ["Human decides everything", "Nobody — it's hardcoded", "Agents propose, humans approve high-stakes decisions"] },
                  { label: "Learning", vals: ["None — every interaction starts fresh", "None — same rules forever", "Continuous — every action enriches future decisions"] },
                  { label: "Scale", vals: ["Limited by human attention", "Limited by rule complexity", "Scales with governance, not headcount"] },
                  { label: "Governance", vals: ["Trust the user", "Trust the developer", "Explicit decision gates, risk tiers, audit trails"] },
                ].map(({ label, vals }) => (
                  <tr key={label} className="border-b border-[--mkt-border] hover:bg-[--mkt-card] transition-colors">
                    <td className="py-3 px-4 font-bold text-[--text-muted] text-xs">{label}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`py-3 px-4 text-sm ${i === 2 ? "text-[--text-primary] font-medium" : "text-[--text-secondary]"}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Architecture Stack */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Architecture</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">The Agentic Architecture Stack</h2>
            <p className="max-w-2xl mx-auto text-[--text-secondary]">Every agentic system we design follows a proven architecture — the same architecture that powers Dauntless Agentic, our own operating system.</p>
          </div>
          <div className="space-y-6">
            {layers.map(({ icon: Icon, num, title, subtitle, description, items, callout }) => (
              <div key={title} className="soft-card p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active] shrink-0">
                    <Icon className="h-5 w-5 text-[--accent-vivid]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[--accent-vivid]">Layer {num}</span>
                    </div>
                    <h3 className="font-bold text-[--text-primary] text-lg">{title}</h3>
                    <p className="text-sm text-[--text-muted]">{subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-[--text-secondary]">{description}</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {items.map(({ name, desc }) => (
                    <div key={name} className="bg-[--mkt-bg] rounded-[--radius-md] p-3 space-y-1">
                      <p className="text-xs font-bold text-[--text-primary]">{name}</p>
                      <p className="text-xs text-[--text-muted]">{desc}</p>
                    </div>
                  ))}
                </div>
                {callout && (
                  <div className="bg-[--accent-dim] border border-[--border-active] rounded-[--radius-lg] p-3">
                    <p className="text-xs font-medium text-[--accent-vivid]">{callout}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Use Cases</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Where Agentic Systems Create the Most Value</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map(({ icon, title, desc }) => (
              <div key={title} className="soft-card p-5 space-y-3">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-bold text-[--text-primary]">{title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built From Experience */}
      <section className="bg-[--mkt-bg] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4 soft-card-accent p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Our Credibility</p>
          <h2 className="text-2xl font-semibold text-[--text-primary]">We Don't Just Design Agentic Systems. We Run One.</h2>
          <p className="text-[--text-secondary]">Every architecture we design for clients is informed by an agentic operating system we built and operate ourselves — daily. This isn't theory drawn from whitepapers. It's practice forged through real operational use. We've encountered the edge cases, solved the governance problems, and refined the patterns — so you don't have to.</p>
        </div>
      </section>

      {/* Engagement Phases */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Engagement</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">How an Agentic Engagement Works</h2>
          </div>
          <div className="space-y-3">
            {engagementPhases.map(({ phase, what, duration }, i) => (
              <div key={phase} className="soft-card p-5 flex gap-4 items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[--accent-dim] border border-[--border-active] text-xs font-bold text-[--accent-vivid] shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <p className="font-bold text-[--text-primary]">{phase}</p>
                  <p className="text-sm text-[--text-secondary] mt-1">{what}</p>
                </div>
                <span className="text-xs font-mono text-[--accent-vivid] shrink-0 hidden md:block">{duration}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* In Practice */}
      <section className="bg-[--mkt-bg] py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">Selected Work</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-[--text-primary]">Systems in Practice</h2>
            <p className="max-w-xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              A sample of government engagements where this work created real, lasting change.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <WorkCard department="Innovation, Science & Economic Development" project="Industry Systems Model" category="Systems Thinking" sector="federal" image="/images/work/IC-ConsumerProtection.png" />
            <WorkCard department="Indigenous & Northern Affairs Canada" project="Governance Systems Architecture" category="Systems Thinking" sector="federal" image="/images/work/INAC-SD.png" />
            <WorkCard department="Natural Resources Canada" project="Knowledge Management Architecture" category="Program Architecture" sector="federal" image="/images/work/NRCAN-KM.png" />
          </div>
          <div className="text-center">
            <Link href="/work" className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors">
              View all 150+ projects <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[--mkt-bg] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold text-[--text-primary]">Ready to Build Your Agentic Architecture?</h2>
          <p className="text-[--text-secondary]">Agentic systems are the next frontier. Let's explore whether your organization is ready — and design the architecture that gets you there.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact"><Button variant="primary" size="lg" className="gap-2">Explore Agentic Architecture <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/services"><Button variant="outline" size="lg">See All Services</Button></Link>
          </div>
        </div>
      </section>


      {/* Also in Services */}
      <section className="bg-[--mkt-section] border-t border-[--mkt-border] py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Also in Services</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/services/training" className="flex flex-col gap-1.5 p-5 soft-card text-left group">
              <span className="text-sm font-semibold text-[--text-primary] flex items-center gap-1.5">AI Literacy Training <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
              <span className="text-xs text-[--text-muted] leading-relaxed">Team-wide AI fluency in days, not months. Executive briefings to full practitioner programs built for government and enterprise.</span>
            </Link>
            <Link href="/services/consulting" className="flex flex-col gap-1.5 p-5 soft-card text-left group">
              <span className="text-sm font-semibold text-[--text-primary] flex items-center gap-1.5">AI Operations Consulting <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
              <span className="text-xs text-[--text-muted] leading-relaxed">We design the operating architecture, governance model, and workflow systems your organization needs to run AI at scale.</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
