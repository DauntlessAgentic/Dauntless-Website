import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, Target, BookOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkCard } from "@/components/ui/work-card";
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
  { icon: Target, title: "PRISM Assessment", description: "Our proprietary framework measures actual capability development across five dimensions — not just quiz scores and completion rates, but demonstrated ability to apply AI effectively." },
  { icon: Users, title: "Cohort Community", description: "Learning happens in community. Participants work through challenges together, share discoveries, and hold each other accountable. The cohort becomes a permanent peer network." },
  { icon: BarChart3, title: "Outcome Tracking", description: "Every program produces measurable outcomes — capability assessments, workflow improvements, time savings, quality improvements. We don't guess at impact. We prove it." },
];


export const metadata: Metadata = {
  title: "AI Literacy Training — Dauntless",
  description: "Team-wide AI fluency in days, not months. Executive briefings to full practitioner programs — built for government and enterprise.",
};

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />
      <div className="max-w-6xl mx-auto px-6 pt-5 pb-1">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "AI Literacy Training" }]} />
      </div>

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">AI Literacy Training</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Your People Are the Strategy.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
              Train Them Like It.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            AI tools are everywhere. AI capability is rare. Our cohort-based training programs don't teach people how to use a tool. They transform how people work.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg" className="gap-2">Design Your Training Program <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-3xl font-semibold text-[--text-primary] text-center">Most AI Training Is a Waste of Time</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="soft-card-danger p-6 space-y-3">
              <p className="text-sm font-bold text-[--danger] uppercase tracking-wider">What Organizations Are Doing</p>
              {["One-off lunch-and-learns that create buzz but not capability", "Self-paced courses with 12% completion rates", "Tool-specific training that's obsolete in 6 months", "\"Prompt engineering\" workshops that miss the strategic picture", "Sending people to conferences and hoping knowledge transfers"].map(item => (
                <div key={item} className="flex items-start gap-2"><span className="text-[--danger] shrink-0">✕</span><p className="text-sm text-[--text-secondary]">{item}</p></div>
              ))}
            </div>
            <div className="soft-card-success p-6 space-y-3">
              <p className="text-sm font-bold text-[--success] uppercase tracking-wider">What Actually Builds Capability</p>
              {["Cohort-based programs with accountability and community", "Practice-first curriculum applied to real work problems", "Outcome-tracked progression from literacy to fluency to mastery", "Strategic framing: when to use AI, when not to, and how to govern it", "Encoded delivery patterns refined across every cohort"].map(item => (
                <div key={item} className="flex items-start gap-2"><span className="text-[--success] shrink-0">✓</span><p className="text-sm text-[--text-secondary]">{item}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FC5 Platform */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">The Platform</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Purpose-Built Training Delivery</h2>
            <p className="max-w-2xl mx-auto text-[--text-secondary]">Every training program runs on the FC5 Platform — a purpose-built delivery system that integrates curriculum, practice environments, assessment, and outcome tracking into a single cohesive experience.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fc5Features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="soft-card p-5 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim]"><Icon className="h-4 w-4 text-[--accent-vivid]" /></div>
                <h3 className="font-bold text-[--text-primary] text-sm">{title}</h3>
                <p className="text-xs text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Training Tiers</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Four Tiers. Choose Your Depth.</h2>
          </div>
          <div className="space-y-6">
            {tiers.map(({ name, tag, duration, size, before, after, covers, takeaways }) => (
              <div key={name} className="soft-card p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[--text-primary]">{name}</h3>
                    <p className="text-sm text-[--text-muted]">{tag}</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[--accent-dim] border border-[--border-active] text-xs font-medium text-[--accent-vivid]">{duration}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[--mkt-bg] border border-[--mkt-border] text-xs text-[--text-muted]">{size}</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[--mkt-bg] rounded-[--radius-lg] p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[--danger]">Before</p>
                    <p className="text-sm text-[--text-secondary]">{before}</p>
                  </div>
                  <div className="bg-[--mkt-bg] rounded-[--radius-lg] p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[--success]">After</p>
                    <p className="text-sm text-[--text-secondary]">{after}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[--text-muted]">What&apos;s Covered</p>
                    <ul className="space-y-1">{covers.map(c => (<li key={c} className="text-xs text-[--text-secondary] flex gap-1.5"><span className="text-[--accent-vivid] shrink-0">·</span>{c}</li>))}</ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[--text-muted]">What You Walk Away With</p>
                    <ul className="space-y-1">{takeaways.map(t => (<li key={t} className="text-xs text-[--text-secondary] flex gap-1.5"><span className="text-[--accent-vivid] shrink-0">✓</span>{t}</li>))}</ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flexible Delivery */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Delivery</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Designed Around Your Team&apos;s Reality</h2>
            <p className="text-[--text-secondary]">Your people can't always step away from their work for days at a time. Every program can be delivered in the format that works for your organization.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { format: "Intensive", desc: "Full consecutive days for teams that want maximum immersion and momentum." },
              { format: "Distributed", desc: "Spread across weeks (e.g., 2 half-days per week) so teams can apply learning in real time between sessions." },
              { format: "Blended", desc: "Combine live sessions with structured practice missions participants complete in their actual workflow." },
              { format: "Multi-cohort", desc: "Run multiple groups through the same program on staggered schedules to minimize operational disruption." },
            ].map(({ format, desc }) => (
              <div key={format} className="soft-card p-5 space-y-2">
                <p className="font-bold text-[--text-primary]">{format}</p>
                <p className="text-sm text-[--text-secondary]">{desc}</p>
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
            <h2 className="text-2xl md:text-3xl font-semibold text-[--text-primary]">Training in Practice</h2>
            <p className="max-w-xl mx-auto text-sm text-[--text-secondary] leading-relaxed">
              A sample of government engagements where this work created real, lasting change.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <WorkCard department="Employment & Social Development Canada" project="Stakeholder Engagement Process" category="Process Design" sector="federal" image="/images/work/ServiceCanada-InsuranceClaimsProcess.png" />
            <WorkCard department="Health Canada" project="Program Review & Foresight Workshop" category="Foresight" sector="federal" image="/images/work/HC-FORESIGHT.png" />
            <WorkCard department="Treasury Board Secretariat" project="Performance Management Design" category="Performance Design" sector="federal" image="/images/work/TB-PerformanceBasedRegulatoryModel.png" />
          </div>
          <div className="text-center">
            <Link href="/work" className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors">
              View all 150+ projects <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>


      {/* Also in Services */}
      <section className="bg-[--mkt-section] border-t border-[--mkt-border] py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Also in Services</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/services/consulting" className="flex flex-col gap-1.5 p-5 soft-card text-left group">
              <span className="text-sm font-semibold text-[--text-primary] flex items-center gap-1.5">AI Operations Consulting <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
              <span className="text-xs text-[--text-muted] leading-relaxed">We design the operating architecture, governance model, and workflow systems your organization needs to run AI at scale.</span>
            </Link>
            <Link href="/services/agentic-systems" className="flex flex-col gap-1.5 p-5 soft-card text-left group">
              <span className="text-sm font-semibold text-[--text-primary] flex items-center gap-1.5">Agentic Systems <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
              <span className="text-xs text-[--text-muted] leading-relaxed">Custom AI agent pipelines that connect your data, your processes, and your people. Built to run without constant maintenance.</span>
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
            <Link href="/contact"><Button variant="primary" size="lg" className="gap-2">Design Your Training Program <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/services"><Button variant="outline" size="lg">See All Services</Button></Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
