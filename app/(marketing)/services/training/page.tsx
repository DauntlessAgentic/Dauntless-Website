import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, SlidersHorizontal, BookOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const tiers = [
  {
    name: "Executive Briefing",
    tag: "For C-suite, VPs, and senior leaders",
    duration: "Half Day (4 hours)",
    size: "8–20 participants",
    before: "Overwhelmed by AI noise. Unsure what's real, what's hype, and what it means for the organization.",
    after: "Aligned leadership with a strategic understanding of AI opportunity, risk, and the decision frameworks to act with confidence.",
    covers: ["The AI landscape — what's real, what's emerging, what matters for your industry", "Strategic implications — where AI creates genuine value vs. where it's a distraction", "Decision frameworks — how to evaluate AI investments, pilots, and vendor claims", "Governance essentials — the minimum viable framework to move safely and fast", "Roadmap discussion — prioritized next steps specific to your organization"],
    takeaways: ["Shared leadership vocabulary for AI decisions", "A prioritized opportunity map for your organization", "Clear criteria for evaluating AI initiatives", "Confidence to lead the conversation, not just follow it"],
  },
  {
    name: "AI Boot Camp",
    tag: "For teams ready to get hands-on with AI immediately",
    duration: "2 Days (intensive)",
    size: "12–25 participants",
    before: "Curious about AI but using it sporadically or not at all. Can't distinguish useful from gimmick.",
    after: "Confident, capable teams who can integrate AI into their daily work starting the day they leave the room.",
    covers: ["AI fundamentals — how it works, what it's good at, where it fails (no jargon)", "Hands-on practice — real work scenarios, not hypotheticals", "Prompt architecture — consistent, high-quality outputs from day one", "Workflow integration — identifying the 3–5 highest-leverage AI applications in your actual work", "Risk and responsibility — when to trust AI, when to verify, and when to say no"],
    takeaways: ["Team-wide AI fluency and a common operating vocabulary", "Working AI workflows participants can use immediately", "Reduced resistance and increased confidence across the team", "Foundation for deeper capability building"],
  },
  {
    name: "AI Practitioner Program",
    tag: "For knowledge workers and specialists building serious AI capability",
    duration: "5 Days (1 week or spread across 2–3 weeks)",
    size: "10–20 participants",
    before: "Can use AI for simple tasks. Doesn't know how to redesign workflows or build systematic AI integration.",
    after: "Practitioners who can design, implement, and optimize AI-augmented workflows in their domain — and teach others to do the same.",
    covers: ["Workflow analysis — mapping processes and identifying high-leverage AI intervention points", "Multi-step AI workflow design — chain-of-thought, decomposition, orchestration", "Domain-specific application labs — participants redesign their actual processes", "Prompt engineering at depth — system prompts, few-shot patterns, output shaping", "Team playbook development — participants build reusable AI playbooks for their teams"],
    takeaways: ["Measurable productivity improvements in key workflows", "Team-level AI playbooks ready for organizational scaling", "Internal AI champions who can coach and enable peers", "Documented ROI through workflow improvement metrics"],
  },
  {
    name: "AI Transformation",
    tag: "For organizations committed to comprehensive AI capability across all levels",
    duration: "10 Days (delivered across 4–6 weeks)",
    size: "Multi-cohort — leadership, practitioners, and front-line teams",
    before: "AI adoption is scattered, ungoverned, and not producing strategic value. No organizational capability framework.",
    after: "Organization-wide AI capability with governance frameworks, trained champions at every level, and compounding knowledge systems that get smarter with use.",
    covers: ["Executive stream — AI strategy, governance architecture, investment frameworks, change leadership", "Practitioner stream — Deep workflow redesign, advanced prompt architecture, domain application", "Team stream — AI fundamentals, practical application, responsible use, personal workflow development", "Governance design — Decision gates, risk tiers, human-in-the-loop patterns, audit frameworks", "Knowledge systems — Organizational AI playbooks, pattern libraries, compounding knowledge architecture"],
    takeaways: ["AI-capable workforce across all levels with role-appropriate depth", "Governance framework ready for production use", "Internal champion network that sustains momentum after we leave", "Organizational AI playbook that compounds with every use"],
  },
];

const fc5Features = [
  { icon: BookOpen, title: "Structured Curriculum", description: "Modular learning paths built from proven components — Seminars for knowledge, Missions for practice, Sprints for application. Each module maps to specific capability outcomes." },
  { icon: SlidersHorizontal, title: "Personalization", description: "No two organizations are the same. Curriculum, pacing, examples, and role-specific application labs are tailored to your industry, your team's existing capability, and the learning styles present in the room." },
  { icon: Users, title: "Cohort Community", description: "Learning happens in community. Participants work through challenges together, share discoveries, and hold each other accountable. The cohort becomes a permanent peer network." },
  { icon: BarChart3, title: "Outcome Tracking", description: "Every program produces measurable outcomes — capability assessments, workflow improvements, time savings, quality improvements. We don't guess at impact. We prove it." },
];


export const metadata: Metadata = {
  title: "AI Literacy Training",
  description: "Team-wide AI fluency in days, not months. Executive briefings to full practitioner programs — built for government and enterprise.",
};

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />
      <div className="max-w-6xl mx-auto px-6 pt-[88px] pb-2">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "AI Literacy Training" }]} />
      </div>

      <section className="relative pt-10 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#10b981" }}>AI Literacy Training</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Your People Are the Strategy.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #34d399, #10b981)" }}>
              Empower Them Accordingly.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            AI tools are everywhere, real AI capability is rare. Our training programs don't just teach people how to use tools — they transform the way people think, organize and build together.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg" className="gap-2">Design Your Training Program <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold text-[--text-primary]">Most AI Training Is a Waste of Time</h2>
            <p className="text-sm text-[--text-secondary] max-w-xl mx-auto leading-relaxed">The pattern is familiar. Here&apos;s what separates activity from actual capability.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">

            {/* What's broken */}
            <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 0 1px rgba(239,68,68,0.14), 0 4px 20px rgba(0,0,0,0.4)" }}>
              <div className="h-[3px]" style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.5) 25%, #ef4444 50%, rgba(239,68,68,0.5) 75%, transparent)" }} />
              <div className="p-6 space-y-5" style={{ background: "linear-gradient(150deg, rgba(239,68,68,0.06) 0%, #10101e 55%)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.22)" }}>
                    <span className="text-xs font-black leading-none" style={{ color: "#f87171" }}>✕</span>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: "#f87171" }}>What Organizations Are Doing</p>
                </div>
                <ul className="space-y-3">
                  {["One-off lunch-and-learns that create buzz but not capability", "Self-paced courses with 12% completion rates", "Tool-specific training that's obsolete in 6 months", "\"Prompt engineering\" workshops that miss the strategic picture", "Sending people to conferences and hoping knowledge transfers"].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="shrink-0 h-5 w-5 rounded-md flex items-center justify-center mt-0.5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.14)" }}>
                        <span className="text-[9px] font-black leading-none" style={{ color: "#f87171" }}>✕</span>
                      </span>
                      <p className="text-sm text-[--text-secondary] leading-snug">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What works */}
            <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 0 1px rgba(16,185,129,0.20), 0 4px 20px rgba(0,0,0,0.4)" }}>
              <div className="h-[3px]" style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.6) 25%, #10b981 50%, rgba(16,185,129,0.6) 75%, transparent)" }} />
              <div className="p-6 space-y-5" style={{ background: "linear-gradient(150deg, rgba(16,185,129,0.07) 0%, #10101e 55%)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.26)" }}>
                    <span className="text-xs font-black leading-none" style={{ color: "#34d399" }}>✓</span>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: "#34d399" }}>What Actually Builds Capability</p>
                </div>
                <ul className="space-y-3">
                  {["Cohort-based programs with accountability and community", "Practice-first curriculum applied to real work problems", "Outcome-tracked progression from literacy to fluency to mastery", "Strategic framing: when to use AI, when not to, and how to govern it", "Encoded delivery patterns refined across every cohort"].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="shrink-0 rounded-full mt-[7px]" style={{ width: "6px", height: "6px", minWidth: "6px", background: "rgba(16,185,129,0.75)" }} />
                      <p className="text-sm text-[--text-secondary] leading-snug">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FC5 Platform */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">The Platform</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Purpose-Built Training Delivery</h2>
            <p className="max-w-2xl mx-auto text-[--text-secondary]">Every training program runs on the FC5 Platform — a purpose-built delivery system that integrates curriculum, practice environments, assessment, and outcome tracking into a single cohesive experience.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fc5Features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="soft-card p-5 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-lg]" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}><Icon className="h-4 w-4" style={{ color: "#10b981" }} /></div>
                <h3 className="font-semibold text-[--text-primary] text-base">{title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Training Tiers</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Four Tiers. Choose Your Depth.</h2>
            <p className="max-w-xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              Every tier is a complete program. The deeper you go, the more your organization compounds.
            </p>
          </div>
          <div className="space-y-5">
            {tiers.map(({ name, tag, duration, size, before, after, covers, takeaways }, i) => {
              const tierNum = String(i + 1).padStart(2, "0");
              const isFlagship = i === 3;
              // Emerald accent intensifies per tier
              const barOpacity   = [0.35, 0.55, 0.75, 1.00][i];
              const glowStrength = [
                "0 0 0 1px rgba(255,255,255,0.04), 0 2px 16px rgba(0,0,0,0.4)",
                "0 0 0 1px rgba(16,185,129,0.12), 0 2px 16px rgba(0,0,0,0.4)",
                "0 0 0 1px rgba(16,185,129,0.22), 0 4px 24px rgba(16,185,129,0.06)",
                "0 0 0 1px rgba(16,185,129,0.40), 0 8px 40px rgba(16,185,129,0.12)",
              ][i];
              const cardBg = isFlagship
                ? "linear-gradient(160deg, rgba(16,185,129,0.07) 0%, #10101e 45%)"
                : "#10101e";

              return (
                <div
                  key={name}
                  className="relative rounded-2xl overflow-hidden"
                  style={{ boxShadow: glowStrength }}
                >
                  {/* Top accent bar — intensity grows with tier depth */}
                  <div
                    className="h-[3px] w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, rgba(16,185,129,${barOpacity * 0.6}) 15%, #10b981 50%, rgba(16,185,129,${barOpacity * 0.6}) 85%, transparent 100%)`,
                    }}
                  />

                  <div className="relative p-7 md:p-8 space-y-7" style={{ background: cardBg }}>

                    {/* Watermark tier number */}
                    <span
                      className="absolute bottom-4 right-6 text-[88px] font-black leading-none select-none pointer-events-none tabular-nums"
                      style={{ color: `rgba(16,185,129,${[0.04, 0.06, 0.09, 0.13][i]})` }}
                      aria-hidden="true"
                    >
                      {tierNum}
                    </span>

                    {/* ── Header ── */}
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className="text-xs font-bold tracking-[0.18em] uppercase"
                            style={{ color: `rgba(52,211,153,${[0.5, 0.65, 0.8, 1.0][i]})` }}
                          >
                            Tier {tierNum}
                          </span>
                          {isFlagship && (
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{
                                background: "rgba(16,185,129,0.12)",
                                color: "#10b981",
                                border: "1px solid rgba(16,185,129,0.30)",
                              }}
                            >
                              Flagship Program
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-[--text-primary] leading-tight">{name}</h3>
                        <p className="text-sm text-[--text-muted] leading-relaxed">{tag}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <span
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{
                            background: `rgba(16,185,129,${[0.08, 0.11, 0.14, 0.18][i]})`,
                            color: "#34d399",
                            border: `1px solid rgba(16,185,129,${[0.18, 0.24, 0.30, 0.40][i]})`,
                          }}
                        >
                          {duration}
                        </span>
                        <span
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-[--text-muted]"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          {size}
                        </span>
                      </div>
                    </div>

                    {/* ── Transformation: Before → After ── */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div
                        className="rounded-xl p-4 space-y-2"
                        style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.13)" }}
                      >
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f87171" }}>Before</p>
                        <p className="text-sm text-[--text-secondary] leading-relaxed">{before}</p>
                      </div>
                      <div
                        className="rounded-xl p-4 space-y-2"
                        style={{
                          background: `rgba(16,185,129,${[0.04, 0.05, 0.06, 0.08][i]})`,
                          border: `1px solid rgba(16,185,129,${[0.13, 0.17, 0.22, 0.28][i]})`,
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#34d399" }}>After</p>
                        <p className="text-sm text-[--text-secondary] leading-relaxed">{after}</p>
                      </div>
                    </div>

                    {/* ── Covers + Takeaways ── */}
                    <div
                      className="grid md:grid-cols-2 gap-6 pt-6"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[--text-muted]">What&apos;s Covered</p>
                        <ul className="space-y-2">
                          {covers.map(c => (
                            <li key={c} className="flex items-start gap-2.5 text-sm text-[--text-secondary] leading-snug">
                              <span
                                className="shrink-0 rounded-full mt-[5px]"
                                style={{
                                  width: "6px", height: "6px",
                                  background: `rgba(16,185,129,${[0.45, 0.55, 0.70, 0.90][i]})`,
                                  boxShadow: isFlagship ? "0 0 6px rgba(16,185,129,0.4)" : "none",
                                }}
                              />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[--text-muted]">What You Walk Away With</p>
                        <ul className="space-y-2">
                          {takeaways.map(t => (
                            <li key={t} className="flex items-start gap-2.5 text-sm text-[--text-secondary] leading-snug">
                              <span
                                className="shrink-0 font-bold text-sm leading-none mt-0.5"
                                style={{ color: `rgba(52,211,153,${[0.6, 0.7, 0.85, 1.0][i]})` }}
                              >
                                ✓
                              </span>
                              {t}
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

      {/* Flexible Delivery */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Delivery</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Designed Around Your Team&apos;s Reality</h2>
            <p className="text-sm text-[--text-secondary] max-w-xl mx-auto leading-relaxed">Your people can&apos;t always step away from their work for days at a time. Every program can be delivered in the format that works for your organization.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { format: "Intensive",    desc: "Full consecutive days for teams that want maximum immersion and momentum." },
              { format: "Distributed",  desc: "Spread across weeks (e.g., 2 half-days per week) so teams can apply learning in real time between sessions." },
              { format: "Blended",      desc: "Combine live sessions with structured practice missions participants complete in their actual workflow." },
              { format: "Multi-cohort", desc: "Run multiple groups through the same program on staggered schedules to minimize operational disruption." },
            ].map(({ format, desc }, idx) => (
              <div
                key={format}
                className="relative rounded-2xl overflow-hidden group"
                style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 2px 14px rgba(0,0,0,0.35)" }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to bottom, rgba(16,185,129,${[0.4, 0.55, 0.7, 0.9][idx]}), rgba(16,185,129,0.05))`,
                  }}
                />
                <div className="pl-7 pr-6 py-6 space-y-3" style={{ background: "#10101e" }}>
                  <span
                    className="text-xs font-mono font-bold tracking-[0.2em]"
                    style={{ color: `rgba(52,211,153,${[0.4, 0.55, 0.7, 0.85][idx]})` }}
                  >
                    0{idx + 1}
                  </span>
                  <h3 className="text-xl font-bold text-[--text-primary]">{format}</h3>
                  <p className="text-sm text-[--text-secondary] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Participant Voices */}
      <section className="bg-[--mkt-bg] py-16 px-6 border-t border-[--mkt-border]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#34d399" }}>Participant Voices</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-[--text-primary]">In Their Words</h2>
            <p className="max-w-xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              From legal professionals to technologists — what participants say after completing the program.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">

            {/* Legal Professional */}
            <div
              className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
              style={{
                background: "linear-gradient(150deg, rgba(16,185,129,0.08) 0%, #10101e 55%)",
                border: "1px solid rgba(16,185,129,0.16)",
                boxShadow: "0 0 0 1px rgba(16,185,129,0.08), 0 6px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div className="text-5xl leading-none font-black select-none opacity-20" style={{ backgroundImage: "linear-gradient(135deg, #10b981, #34d399)", WebkitBackgroundClip: "text", color: "transparent" }} aria-hidden="true">&ldquo;</div>
              <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
                &ldquo;The Program struck the perfect balance between strategic experimentation and responsible innovation. I now use AI in my daily practice to accelerate research, streamline routine tasks, and explore new ways of delivering value to clients — without compromising on ethics, quality, human touch or judgment.&rdquo;
              </blockquote>
              <div className="border-t pt-4 space-y-0.5" style={{ borderColor: "rgba(16,185,129,0.15)" }}>
                <p className="text-sm font-semibold text-[--text-primary]">Program Participant</p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#34d399" }}>Legal Professional</p>
                <p className="text-xs text-[--text-muted]">AI Literacy Program</p>
              </div>
            </div>

            {/* IT Professional */}
            <div
              className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
              style={{
                background: "linear-gradient(150deg, rgba(16,185,129,0.09) 0%, #10101e 55%)",
                border: "1px solid rgba(16,185,129,0.18)",
                boxShadow: "0 0 0 1px rgba(16,185,129,0.10), 0 6px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div className="text-5xl leading-none font-black select-none opacity-20" style={{ backgroundImage: "linear-gradient(135deg, #10b981, #34d399)", WebkitBackgroundClip: "text", color: "transparent" }} aria-hidden="true">&ldquo;</div>
              <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
                &ldquo;The Program didn&apos;t just teach me something, it rewired me. It flipped a switch I didn&apos;t know existed and showed me what our organization could become if we stopped whispering innovation and started shouting it. The Program was the first experience that made me feel like an innovator, not a passenger. AI is not a tool, it&apos;s a superpower.&rdquo;
              </blockquote>
              <div className="border-t pt-4 space-y-0.5" style={{ borderColor: "rgba(16,185,129,0.15)" }}>
                <p className="text-sm font-semibold text-[--text-primary]">Program Participant</p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#34d399" }}>IT Professional</p>
                <p className="text-xs text-[--text-muted]">AI Literacy Program</p>
              </div>
            </div>

            {/* Learning & Development Professional */}
            <div
              className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
              style={{
                background: "linear-gradient(150deg, rgba(16,185,129,0.10) 0%, #10101e 55%)",
                border: "1px solid rgba(16,185,129,0.20)",
                boxShadow: "0 0 0 1px rgba(16,185,129,0.12), 0 6px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div className="text-5xl leading-none font-black select-none opacity-20" style={{ backgroundImage: "linear-gradient(135deg, #10b981, #34d399)", WebkitBackgroundClip: "text", color: "transparent" }} aria-hidden="true">&ldquo;</div>
              <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
                &ldquo;I gained new ways of thinking — especially systems thinking and design thinking — and learned how to use them to identify AI-integration opportunities across an entire workflow. I&apos;m walking away feeling far more prepared to lead my practice group and drive impact that extends well beyond my immediate team.&rdquo;
              </blockquote>
              <div className="border-t pt-4 space-y-0.5" style={{ borderColor: "rgba(16,185,129,0.15)" }}>
                <p className="text-sm font-semibold text-[--text-primary]">Program Participant</p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#34d399" }}>Learning &amp; Development Professional</p>
                <p className="text-xs text-[--text-muted]">AI Literacy Program</p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Also in Services */}
      <section className="bg-[--mkt-section] border-t border-[--mkt-border] py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Also in Services</p>
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Consulting — Electric Blue */}
            <Link
              href="/services/consulting"
              className="group relative rounded-2xl overflow-hidden flex flex-col gap-4 p-6 transition-all duration-300"
              style={{
                background: "linear-gradient(150deg, rgba(37,99,235,0.08) 0%, #10101e 55%)",
                boxShadow: "0 0 0 1px rgba(37,99,235,0.16), 0 2px 14px rgba(0,0,0,0.35)",
              }}
            >
              <div className="absolute top-0 inset-x-0 h-[3px]" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5) 25%, #3b82f6 50%, rgba(59,130,246,0.5) 75%, transparent)" }} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#60a5fa" }}>AI Ops Consulting</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" style={{ color: "#3b82f6" }} />
              </div>
              <p className="text-base font-semibold text-[--text-primary] leading-snug">Operationalize AI — don&apos;t just pilot it.</p>
              <p className="text-sm text-[--text-secondary] leading-relaxed">Design architecture, governance and operating models for human-machine collaboration that actually works inside real teams. Stop experimenting and start integrating.</p>
            </Link>

            {/* Agentic Systems — Hot Pink */}
            <Link
              href="/services/agentic-systems"
              className="group relative rounded-2xl overflow-hidden flex flex-col gap-4 p-6 transition-all duration-300"
              style={{
                background: "linear-gradient(150deg, rgba(236,72,153,0.08) 0%, #10101e 55%)",
                boxShadow: "0 0 0 1px rgba(236,72,153,0.16), 0 2px 14px rgba(0,0,0,0.35)",
              }}
            >
              <div className="absolute top-0 inset-x-0 h-[3px]" style={{ background: "linear-gradient(90deg, transparent, rgba(236,72,153,0.5) 25%, #ec4899 50%, rgba(236,72,153,0.5) 75%, transparent)" }} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#f472b6" }}>Agentic Systems</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" style={{ color: "#ec4899" }} />
              </div>
              <p className="text-base font-semibold text-[--text-primary] leading-snug">AI that works while you sleep.</p>
              <p className="text-sm text-[--text-secondary] leading-relaxed">Autonomous AI agent architectures with constitutional governance. Agents that sense, propose, execute, and learn — with humans at every decision point that matters.</p>
            </Link>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[--mkt-section] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold text-[--text-primary]">Ready to Build Real AI Capability?</h2>
          <p className="text-[--text-secondary]">Every training program starts with a conversation about your people, your challenges, and your goals. We'll design the right program for your organization.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
                boxShadow: "0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px rgba(124,58,237,0.35)",
              }}
            >
              Design Your Training Program <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/services"><Button variant="outline" size="lg">See All Services</Button></Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
