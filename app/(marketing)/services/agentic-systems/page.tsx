import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Shield, Brain, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const layers = [
  {
    icon: Bot,
    num: "01",
    title: "Agent Fleet Design",
    subtitle: "Design the constellation of AI agents your organization needs.",
    description: "We don't build one monolithic AI. We design specialized agents organized into four archetypes — each with a distinct role, clear scope, and explicit authority boundary.",
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
      { name: "Risk Tiers", desc: "Every action classified by consequence level — Low, Medium, or High." },
      { name: "Decision Gates", desc: "Explicit checkpoints where human approval is required before execution." },
      { name: "PROPOSE → APPROVE → COMMIT", desc: "The canonical flow for every high-stakes decision." },
      { name: "Confidence Scoring", desc: "Agents report confidence level; low confidence triggers human review automatically." },
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
      { name: "Three Shelves Model", desc: "Operational surface (Desk), proven knowledge (Bookshelf), archives (Filing Cabinet)." },
      { name: "Memory Tiers", desc: "M0 through M4 — from ephemeral context to permanent organizational knowledge." },
      { name: "Confidence Decay", desc: "Knowledge that isn't validated degrades over time, preventing stale intelligence." },
      { name: "Canonical Promotion", desc: "The best work gets promoted to reusable status, building the organizational brain." },
    ],
    callout: null,
  },
  {
    icon: BarChart3,
    num: "04",
    title: "Observability & Control",
    subtitle: "Build the dashboards, logs, and monitoring that let humans understand and control the system.",
    description: "The system should feel like a cockpit, not a black box. Every agent action is traceable. Every decision is auditable. Every anomaly is surfaced before it compounds.",
    items: [
      { name: "Generative Decision Surface", desc: "Three-section dashboard: What needs my judgment? What changed? What's running safely?" },
      { name: "Workflow Logs", desc: "Complete audit trail of every agent action with input, output, and delta." },
      { name: "Health Monitoring", desc: "Real-time system health with early warning signals before issues escalate." },
      { name: "Three-Mode Interface", desc: "Dashboards to observe, Agents to work, Presentations to deliver." },
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
  { phase: "Discovery", what: "Map your current operations, identify agentic opportunities, and assess organizational readiness across people, process, and technology.", duration: "2–4 weeks" },
  { phase: "Architecture", what: "Design the agent fleet, decision architecture, knowledge systems, and observability layer — the full blueprint before a line of code is written.", duration: "4–6 weeks" },
  { phase: "Build", what: "Implement the agentic system — agents, databases, workflows, governance, dashboards. Every component tested against the architecture spec.", duration: "8–16 weeks" },
  { phase: "Activate", what: "Launch with human-in-the-loop. Agents propose, humans approve. Calibrate confidence thresholds. Validate the system in real conditions.", duration: "2–4 weeks" },
  { phase: "Compound", what: "System learns from every action. Patterns refine. Knowledge compounds. Governance tightens. The system becomes more valuable every week.", duration: "Ongoing" },
];

export const metadata: Metadata = {
  title: "Agentic Systems",
  description: "Custom AI agent pipelines that connect your data, your processes, and your people. Built to run without constant maintenance.",
};

export default function AgenticSystemsPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />
      <div className="max-w-6xl mx-auto px-6 pt-[88px] pb-2">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Agentic Systems" }]} />
      </div>

      {/* Hero */}
      <section className="relative pt-10 pb-24 px-6 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(236,72,153,0.12) 0%, transparent 65%)" }}
        />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f472b6" }}>Agentic Systems</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Beyond Tools. Beyond Automation.{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #f472b6, #ec4899)" }}
            >
              Into Agentic.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            The next frontier isn&apos;t giving humans better AI tools. It&apos;s building AI agents — autonomous capabilities that sense, propose, execute, and learn within structured governance. Not science fiction. Operating architecture.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px rgba(124,58,237,0.35)",
            }}
          >
            Explore Agentic Architecture <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Tools vs Agents comparison */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#f472b6" }}>The Distinction</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">From Tools to Agents</h2>
            <p className="max-w-2xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              The key insight: agentic systems aren&apos;t about removing humans. They&apos;re about amplifying human judgment — letting AI handle the volume while humans handle the decisions that matter.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl"
            style={{ boxShadow: "0 0 0 1px rgba(236,72,153,0.12), 0 4px 20px rgba(0,0,0,0.4)" }}>
            <table className="w-full text-sm" style={{ background: "linear-gradient(150deg, rgba(236,72,153,0.05) 0%, #10101e 55%)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left py-4 px-5 text-xs font-bold uppercase tracking-widest text-[--text-muted] w-36"></th>
                  {["AI Tools", "AI Automation", "Agentic Systems"].map(h => (
                    <th
                      key={h}
                      className="text-left py-4 px-5 text-xs font-bold uppercase tracking-widest"
                      style={{ color: h === "Agentic Systems" ? "#f472b6" : "var(--text-muted)" }}
                    >
                      {h}
                    </th>
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
                ].map(({ label, vals }, rowIdx) => (
                  <tr
                    key={label}
                    style={{ borderBottom: rowIdx < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    <td className="py-3.5 px-5 font-bold text-[--text-muted] text-xs uppercase tracking-wide">{label}</td>
                    {vals.map((v, i) => (
                      <td
                        key={i}
                        className="py-3.5 px-5 text-sm leading-snug"
                        style={{ color: i === 2 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: i === 2 ? 500 : 400 }}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Architecture Stack */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#f472b6" }}>Architecture</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">The Agentic Architecture Stack</h2>
            <p className="max-w-2xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              Every agentic system we design follows a proven architecture — the same architecture that powers Dauntless Agentic, our own operating system.
            </p>
          </div>
          <div className="space-y-5">
            {layers.map(({ icon: Icon, num, title, subtitle, description, items, callout }, i) => {
              const barOpacity   = [0.35, 0.55, 0.75, 1.00][i];
              const glowStrength = [
                "0 0 0 1px rgba(255,255,255,0.04), 0 2px 16px rgba(0,0,0,0.4)",
                "0 0 0 1px rgba(236,72,153,0.14), 0 2px 16px rgba(0,0,0,0.4)",
                "0 0 0 1px rgba(236,72,153,0.24), 0 4px 24px rgba(236,72,153,0.06)",
                "0 0 0 1px rgba(236,72,153,0.40), 0 8px 40px rgba(236,72,153,0.10)",
              ][i];
              const isFlagship = i === 3;
              const cardBg = isFlagship
                ? "linear-gradient(160deg, rgba(236,72,153,0.09) 0%, #10101e 45%)"
                : "#10101e";

              return (
                <div key={title} className="relative rounded-2xl overflow-hidden" style={{ boxShadow: glowStrength }}>
                  {/* Top accent bar */}
                  <div
                    className="h-[3px] w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, rgba(244,114,182,${barOpacity * 0.6}) 15%, #ec4899 50%, rgba(244,114,182,${barOpacity * 0.6}) 85%, transparent 100%)`,
                    }}
                  />
                  <div className="relative p-7 md:p-8 space-y-6" style={{ background: cardBg }}>

                    {/* Watermark */}
                    <span
                      className="absolute bottom-4 right-6 text-[88px] font-black leading-none select-none pointer-events-none tabular-nums"
                      style={{ color: `rgba(236,72,153,${[0.04, 0.06, 0.09, 0.13][i]})` }}
                      aria-hidden="true"
                    >
                      {num}
                    </span>

                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                        style={{
                          background: `rgba(236,72,153,${[0.10, 0.13, 0.16, 0.20][i]})`,
                          border: `1px solid rgba(244,114,182,${[0.20, 0.26, 0.32, 0.40][i]})`,
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: "#f472b6" }} />
                      </div>
                      <div className="space-y-1">
                        <span
                          className="text-xs font-bold tracking-[0.18em] uppercase"
                          style={{ color: `rgba(244,114,182,${[0.55, 0.70, 0.85, 1.0][i]})` }}
                        >
                          Layer {num}
                        </span>
                        <h3 className="text-xl font-bold text-[--text-primary] leading-tight">{title}</h3>
                        <p className="text-sm text-[--text-muted] leading-relaxed">{subtitle}</p>
                      </div>
                    </div>

                    <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>

                    {/* Items grid */}
                    <div className="grid md:grid-cols-2 gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.25rem" }}>
                      {items.map(({ name, desc }) => (
                        <div
                          key={name}
                          className="rounded-xl p-4 space-y-1"
                          style={{
                            background: `rgba(236,72,153,${[0.03, 0.04, 0.05, 0.06][i]})`,
                            border: `1px solid rgba(244,114,182,${[0.08, 0.10, 0.13, 0.16][i]})`,
                          }}
                        >
                          <p className="text-sm font-semibold text-[--text-primary]">{name}</p>
                          <p className="text-sm text-[--text-secondary] leading-snug">{desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Callout */}
                    {callout && (
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background: "rgba(236,72,153,0.07)",
                          border: "1px solid rgba(244,114,182,0.22)",
                        }}
                      >
                        <p className="text-sm font-medium leading-relaxed" style={{ color: "#f472b6" }}>{callout}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#f472b6" }}>Use Cases</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Where Agentic Systems Create the Most Value</h2>
            <p className="max-w-xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              Six high-leverage domains where autonomous agent architectures consistently outperform human-only or tool-only approaches.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="relative rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 0 0 1px rgba(236,72,153,0.14), 0 4px 20px rgba(0,0,0,0.4)" }}
              >
                <div
                  className="h-[3px] w-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(244,114,182,0.5) 25%, #ec4899 50%, rgba(244,114,182,0.5) 75%, transparent)" }}
                />
                <div className="p-6 space-y-4" style={{ background: "linear-gradient(150deg, rgba(236,72,153,0.06) 0%, #10101e 55%)" }}>
                  <span className="text-2xl" aria-hidden="true">{icon}</span>
                  <h3 className="text-base font-bold text-[--text-primary]">{title}</h3>
                  <p className="text-sm text-[--text-secondary] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Phases */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#f472b6" }}>Engagement</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">How an Agentic Engagement Works</h2>
            <p className="max-w-xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              Five phases from first conversation to compounding system. Each phase builds on the last — nothing is throwaway, nothing is repeated.
            </p>
          </div>

          {/* Credibility callout */}
          <div
            className="rounded-2xl p-7 text-center space-y-3"
            style={{
              background: "linear-gradient(150deg, rgba(236,72,153,0.08) 0%, #10101e 55%)",
              border: "1px solid rgba(244,114,182,0.18)",
              boxShadow: "0 0 0 1px rgba(236,72,153,0.08), 0 6px 24px rgba(0,0,0,0.4)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#f472b6" }}>Our Credibility</p>
            <h3 className="text-lg font-semibold text-[--text-primary]">We Don&apos;t Just Design Agentic Systems. We Run One.</h3>
            <p className="text-sm text-[--text-secondary] leading-relaxed max-w-2xl mx-auto">
              Every architecture we design for clients is informed by the agentic operating system we built and operate ourselves — daily. This isn&apos;t theory drawn from whitepapers. It&apos;s practice forged through real operational use. We&apos;ve encountered the edge cases, solved the governance problems, and refined the patterns so you don&apos;t have to.
            </p>
          </div>

          <div className="space-y-3">
            {engagementPhases.map(({ phase, what, duration }, i) => {
              const phaseNum = String(i + 1).padStart(2, "0");
              const intensity = [0.45, 0.55, 0.65, 0.80, 1.00][i];
              return (
                <div
                  key={phase}
                  className="relative rounded-2xl overflow-hidden pl-7 pr-6 py-6 flex gap-5 items-start"
                  style={{
                    background: "linear-gradient(150deg, rgba(236,72,153,0.04) 0%, #10101e 60%)",
                    boxShadow: `0 0 0 1px rgba(236,72,153,${[0.10, 0.13, 0.16, 0.20, 0.26][i]}), 0 2px 12px rgba(0,0,0,0.3)`,
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                    style={{ background: `linear-gradient(to bottom, rgba(244,114,182,${intensity}), rgba(236,72,153,0.08))` }}
                  />
                  {/* Phase number badge */}
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0"
                    style={{
                      background: `rgba(236,72,153,${[0.10, 0.13, 0.16, 0.20, 0.26][i]})`,
                      border: `1px solid rgba(244,114,182,${[0.20, 0.26, 0.32, 0.40, 0.50][i]})`,
                      color: "#f472b6",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-[--text-muted]">Phase {phaseNum}</span>
                      <span className="hidden md:inline text-xs text-[--text-muted]">·</span>
                      <span
                        className="hidden md:inline text-xs font-mono font-semibold"
                        style={{ color: `rgba(244,114,182,${intensity})` }}
                      >
                        {duration}
                      </span>
                    </div>
                    <p className="text-base font-bold text-[--text-primary]">{phase}</p>
                    <p className="text-sm text-[--text-secondary] leading-relaxed">{what}</p>
                  </div>
                  <span
                    className="shrink-0 text-xs font-mono font-semibold md:hidden"
                    style={{ color: `rgba(244,114,182,${intensity})` }}
                  >
                    {duration}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Client Voices */}
      <section className="bg-[--mkt-section] py-16 px-6 border-t border-[--mkt-border]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#f472b6" }}>Client Voices</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-[--text-primary]">In Their Words</h2>
            <p className="max-w-xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              From knowledge management architects to systems directors — what clients say after engaging with our agentic design work.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">

            {/* NRCan */}
            <div
              className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
              style={{
                background: "linear-gradient(150deg, rgba(236,72,153,0.08) 0%, #10101e 55%)",
                border: "1px solid rgba(244,114,182,0.16)",
                boxShadow: "0 0 0 1px rgba(236,72,153,0.08), 0 6px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div
                className="text-5xl leading-none font-black select-none opacity-20"
                style={{ backgroundImage: "linear-gradient(135deg, #ec4899, #f472b6)", WebkitBackgroundClip: "text", color: "transparent" }}
                aria-hidden="true"
              >&ldquo;</div>
              <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
                &ldquo;The knowledge architecture they designed changed how we think about institutional memory. We used to lose everything at turnover. Now it compounds.&rdquo;
              </blockquote>
              <div className="border-t pt-4 space-y-0.5" style={{ borderColor: "rgba(244,114,182,0.15)" }}>
                <p className="text-sm font-semibold text-[--text-primary]">Director, Knowledge Management</p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#f472b6" }}>Government of Canada</p>
                <p className="text-xs text-[--text-muted]">Natural Resources Canada</p>
              </div>
            </div>

            {/* ISED */}
            <div
              className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
              style={{
                background: "linear-gradient(150deg, rgba(236,72,153,0.09) 0%, #10101e 55%)",
                border: "1px solid rgba(244,114,182,0.18)",
                boxShadow: "0 0 0 1px rgba(236,72,153,0.10), 0 6px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div
                className="text-5xl leading-none font-black select-none opacity-20"
                style={{ backgroundImage: "linear-gradient(135deg, #ec4899, #f472b6)", WebkitBackgroundClip: "text", color: "transparent" }}
                aria-hidden="true"
              >&ldquo;</div>
              <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
                &ldquo;The systems model they built gave us a way to see our industry ecosystem as a whole. Three years of decisions have referenced that work.&rdquo;
              </blockquote>
              <div className="border-t pt-4 space-y-0.5" style={{ borderColor: "rgba(244,114,182,0.15)" }}>
                <p className="text-sm font-semibold text-[--text-primary]">Executive Director, Industry Systems</p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#f472b6" }}>Government of Canada</p>
                <p className="text-xs text-[--text-muted]">Innovation, Science &amp; Economic Development</p>
              </div>
            </div>

            {/* INAC */}
            <div
              className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
              style={{
                background: "linear-gradient(150deg, rgba(236,72,153,0.10) 0%, #10101e 55%)",
                border: "1px solid rgba(244,114,182,0.20)",
                boxShadow: "0 0 0 1px rgba(236,72,153,0.12), 0 6px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div
                className="text-5xl leading-none font-black select-none opacity-20"
                style={{ backgroundImage: "linear-gradient(135deg, #ec4899, #f472b6)", WebkitBackgroundClip: "text", color: "transparent" }}
                aria-hidden="true"
              >&ldquo;</div>
              <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
                &ldquo;The governance architecture wasn&apos;t just a framework — it was a decision system. It changed how we structure authority across complex multi-stakeholder processes.&rdquo;
              </blockquote>
              <div className="border-t pt-4 space-y-0.5" style={{ borderColor: "rgba(244,114,182,0.15)" }}>
                <p className="text-sm font-semibold text-[--text-primary]">Director, Governance &amp; Systems Architecture</p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#f472b6" }}>Government of Canada</p>
                <p className="text-xs text-[--text-muted]">Crown-Indigenous Relations</p>
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
            <Link
              href="/services/training"
              className="relative flex flex-col gap-0 rounded-2xl overflow-hidden group text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(150deg, rgba(16,185,129,0.08) 0%, #10101e 55%)", boxShadow: "0 0 0 1px rgba(16,185,129,0.16), 0 4px 20px rgba(0,0,0,0.4)" }}
            >
              <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.6) 25%, #10b981 50%, rgba(16,185,129,0.6) 75%, transparent)" }} />
              <div className="p-5 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#10b981" }}>AI Literacy Training</p>
                <p className="text-base font-semibold text-[--text-primary] flex items-center gap-1.5">
                  Transform team capability <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-sm text-[--text-secondary] leading-relaxed">Team-wide AI fluency in days, not months. Executive briefings to full practitioner programs built for government and enterprise.</p>
              </div>
            </Link>
            <Link
              href="/services/consulting"
              className="relative flex flex-col gap-0 rounded-2xl overflow-hidden group text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(150deg, rgba(37,99,235,0.08) 0%, #10101e 55%)", boxShadow: "0 0 0 1px rgba(37,99,235,0.16), 0 4px 20px rgba(0,0,0,0.4)" }}
            >
              <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.6) 25%, #3b82f6 50%, rgba(59,130,246,0.6) 75%, transparent)" }} />
              <div className="p-5 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3b82f6" }}>AI Ops Consulting</p>
                <p className="text-base font-semibold text-[--text-primary] flex items-center gap-1.5">
                  Operationalize AI at scale <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-sm text-[--text-secondary] leading-relaxed">We design the operating architecture, governance model, and workflow systems your organization needs to run AI at scale.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[--mkt-section] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold text-[--text-primary]">Ready to Build Your Agentic Architecture?</h2>
          <p className="text-sm text-[--text-secondary] leading-relaxed">
            Agentic systems are the next frontier. Let&apos;s explore whether your organization is ready — and design the architecture that gets you there.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
                boxShadow: "0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px rgba(124,58,237,0.35)",
              }}
            >
              Explore Agentic Architecture <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/services"><Button variant="outline" size="lg">See All Services</Button></Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
