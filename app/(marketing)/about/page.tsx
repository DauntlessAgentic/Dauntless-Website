import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Linkedin, Mail, Globe } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageCTA } from "@/components/marketing/page-cta";

const credentials = [
  { value: "20+", label: "Years designing AI & systems architecture", note: "Before AI was a consulting trend" },
  { value: "180+", label: "AI-augmented workflows designed", note: "Most orgs have zero documented at project start" },
  { value: "5,000+", label: "Professionals served", note: "Across government and private sector" },
  { value: "$50M+", label: "In documented value delivered", note: "Measurable. Verified. Not estimated." },
  { value: "200+", label: "Encoded delivery patterns", note: "Refined over 20 years of real projects" },
  { value: "27+", label: "Interconnected operational databases", note: "Building the second brain before it had a name" },
];

const background = [
  "VP Innovation, BDO Canada",
  "FutureCraft Program Architect",
  "Systems Thinking practitioner",
  "Notion-native operating system designer",
  "AI agent fleet architect",
  "Public sector digital transformation specialist",
];

const threeAs = [
  {
    letter: "A",
    title: "Authentic",
    subtitle: "Be undeniably, unapologetically yourself.",
    description: "In a world flooding with AI-generated noise, authenticity isn't soft — it's strategic. Your judgment, your perspective, your hard-won pattern recognition. These are the things AI can't replicate. Lean into them without apology.",
  },
  {
    letter: "A",
    title: "Augmented",
    subtitle: "Amplify human capability with AI — don't replace it.",
    description: "The goal isn't automation. It's augmentation — using AI to make humans dramatically more capable, more informed, and more effective. The human stays at the center. The machine extends their reach.",
  },
  {
    letter: "A",
    title: "Adaptive",
    subtitle: "Design for change, not against it.",
    description: "The organizations that thrive in the AI era won't be the ones that find the right answer — they'll be the ones that build the architecture to find the next right answer, and the one after that. Adaptive by design.",
  },
];


export const metadata: Metadata = {
  title: "About — Craig Marchand",
  description: "20+ years designing AI and systems architecture for government and enterprise. The story behind Dauntless and why we build the way we do.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(var(--accent-rgb),0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">About</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Built by Someone Who&apos;s{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
              Done the Work.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            Dauntless Agentic wasn't designed in a strategy retreat. It was forged in 20+ years of public sector transformation, 180+ automated workflows, 5,000+ professionals served, and millions in documented savings.
          </p>
        </div>
      </section>

      {/* Craig Bio */}
      <section className="bg-[--mkt-section] py-14 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="soft-card p-8 space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-[--text-primary]">Craig Marchand</h2>
              <p className="text-sm text-[--accent-vivid] mt-1">Founder, Dauntless Agentic · Systems Architect · AI Strategist · Builder</p>
            </div>
            <p className="text-[--text-secondary] leading-relaxed">
              Craig is a systems thinker who builds operating architectures at the intersection of AI, human capability, and organizational design.
            </p>
            <p className="text-[--text-secondary] leading-relaxed">
              As <span className="text-[--text-primary] font-medium">VP Innovation at BDO Canada</span>, he architected the FutureCraft program — designing 180+ AI-augmented workflows that served 5,000+ professionals and generated $4M+ in documented productivity savings. He didn't just introduce AI tools. He redesigned how an entire professional services firm thought about work.
            </p>
            <p className="text-[--text-secondary] leading-relaxed">
              Before that, 20+ years in public sector innovation — designing systems that actually work inside complex organizations with real constraints, real politics, and real consequences.
            </p>
            <p className="text-[--text-secondary] leading-relaxed">
              Now, through Dauntless Agentic, he's building the practice he always wished existed: one where the system compounds, the work gets better, and the architecture is the advantage.
            </p>
            <div className="flex gap-3 flex-wrap pt-2">
              <a href="https://linkedin.com/in/craigmarchand" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[--radius-md] text-sm font-medium text-[--accent-vivid] transition-all"
                style={{ background: "rgba(var(--accent-rgb),0.12)", border: "1px solid rgba(var(--accent-rgb),0.3)" }}>
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a href="mailto:craig@dauntlessagentic.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[--mkt-bg] border border-[--mkt-border] rounded-[--radius-md] text-sm font-medium text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-active] transition-all">
                <Mail className="h-4 w-4" /> Email Craig
              </a>
              <a href="https://craigmarchand.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[--mkt-bg] border border-[--mkt-border] rounded-[--radius-md] text-sm font-medium text-[--text-secondary] hover:text-[--text-primary] hover:border-[--border-active] transition-all">
                <Globe className="h-4 w-4" /> Personal Site
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Three A's */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Philosophy</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Authentic. Augmented. Adaptive.</h2>
            <p className="max-w-2xl mx-auto text-[--text-secondary]">Not a marketing framework. A personal operating system — a way of being in a world where the relationship between humans, work, trade, and power is being fundamentally disrupted.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {threeAs.map(({ letter, title, subtitle, description }) => (
              <div key={title} className="soft-card p-6 space-y-4">
                <div className="text-5xl font-bold text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
                  {letter}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[--text-primary]">{title}</h3>
                  <p className="text-sm font-medium text-[--accent-vivid] mt-0.5">{subtitle}</p>
                </div>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MTP */}
      <section className="py-12 px-6" style={{ background: "linear-gradient(135deg, var(--mkt-section) 0%, rgba(var(--accent-rgb),0.08) 50%, var(--mkt-section) 100%)" }}>
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Massively Transformative Purpose</p>
          <blockquote className="text-2xl md:text-3xl font-semibold text-[--text-primary] italic leading-snug">
            &ldquo;To elevate human potential by redesigning how people and organizations think, decide, and build in the age of AI.&rdquo;
          </blockquote>
          <p className="text-[--text-secondary]">This isn't a mission statement for a company. It's a mission statement for a life's work. Every engagement, every training cohort, every system we design is in service of this purpose.</p>
        </div>
      </section>

      {/* Why This Matters Now */}
      <section className="bg-[--mkt-section] py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Why Now</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">2026 Is the Wrong Time to Get This Wrong</h2>
          </div>
          <div className="soft-card-accent p-8 space-y-4">
            <p className="text-[--text-secondary] leading-relaxed">
              The window for AI adoption is compressing. Organizations that build their AI operating architecture now will compound advantages for years. Those that don&apos;t will spend the next decade catching up — again.
            </p>
            <p className="text-[--text-secondary] leading-relaxed">
              This isn&apos;t hyperbole. It&apos;s what we saw with digital transformation in 2010–2015, repeated at three times the speed. The organizations that moved first — with architecture, not just tools — built durable advantages. The ones that waited bought someone else&apos;s solution five years later and called it transformation.
            </p>
            <p className="text-[--text-primary] font-medium leading-relaxed">
              The question isn&apos;t whether your organization will adopt AI. It&apos;s whether you&apos;ll design the operating architecture to make that adoption compound — or scramble to recover from an implementation that didn&apos;t stick.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="bg-[--mkt-bg] py-12 px-6 border-t border-[--mkt-border]">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Origin</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">The Name Says Everything</h2>
          </div>
          <div className="soft-card p-6 space-y-4">
            <div className="space-y-2">
              <p className="font-bold text-[--text-primary]"><span className="text-[--accent-vivid]">Dauntless</span> — fearless, bold, undeterred by complexity.</p>
              <p className="text-sm text-[--text-secondary] leading-relaxed">The consulting industry is full of firms that mistake caution for rigor, slowness for thoughtfulness, and committee-driven consensus for quality. Dauntless was born from the conviction that there's a better way. A practice that moves with conviction — not recklessness, but the disciplined confidence that comes from having the architecture to be bold safely.</p>
            </div>
            <div className="space-y-2 pt-2">
              <p className="font-bold text-[--text-primary]"><span className="text-[--accent-vivid]">Agentic</span> — agent-powered, autonomous, self-directed.</p>
              <p className="text-sm text-[--text-secondary] leading-relaxed">Because the future isn't just about AI tools. It's about AI agents — autonomous capabilities that propose, execute, and learn within structured governance. That's not science fiction. That's how we operate right now.</p>
            </div>
            <div className="rounded-[--radius-lg] p-3 mt-2" style={{ background: "rgba(var(--accent-rgb),0.12)", border: "1px solid rgba(var(--accent-rgb),0.3)" }}>
              <p className="text-sm font-bold text-[--text-primary]">Together: Fearlessly autonomous intelligence systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">By the Numbers</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">The Credentials</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {credentials.map(({ value, label, note }) => (
              <div key={label} className="text-center space-y-2 soft-card p-5">
                <p className="text-3xl font-bold text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>{value}</p>
                <p className="text-sm text-[--text-secondary] leading-tight font-medium">{label}</p>
                {note && <p className="text-xs text-[--text-muted] leading-tight italic">{note}</p>}
              </div>
            ))}
          </div>
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted] mb-3 text-center">Background</p>
            <div className="grid md:grid-cols-2 gap-2">
              {background.map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-[--text-secondary]">
                  <span className="text-[--accent-vivid] shrink-0">·</span>{b}
                </div>
              ))}
            </div>
          </div>

          {/* Memberships & Affiliations */}
          <div className="max-w-3xl mx-auto pt-4 border-t border-[--mkt-border]">
            <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted] mb-4 text-center">Memberships & Affiliations</p>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                {
                  badge: "Founding Member",
                  org: "Canada AI Alliance",
                  note: "Helping shape Canada's national AI strategy and ecosystem",
                  color: "var(--accent-vivid)",
                  bg: "rgba(var(--accent-bright-rgb),0.10)",
                  border: "rgba(var(--accent-bright-rgb),0.25)",
                },
                {
                  badge: "Former Board Member",
                  org: "Canadian Public Sector Excellence Network",
                  note: "Governance and excellence in public sector delivery",
                  color: "var(--svc-consulting-bright)",
                  bg: "rgba(var(--svc-consulting-rgb),0.08)",
                  border: "rgba(var(--svc-consulting-rgb),0.20)",
                },
                {
                  badge: "Former Member",
                  org: "Canadian Public Sector Quality Association",
                  note: "Quality management and continuous improvement in government",
                  color: "var(--svc-training-bright)",
                  bg: "rgba(var(--svc-training-rgb),0.08)",
                  border: "rgba(var(--svc-training-rgb),0.20)",
                },
              ].map(({ badge, org, note, color, bg, border }) => (
                <div
                  key={org}
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{ color, background: "rgba(0,0,0,0.2)", border: `1px solid ${border}` }}
                  >
                    {badge}
                  </span>
                  <p className="text-sm font-semibold text-[--text-primary] leading-snug">{org}</p>
                  <p className="text-sm text-[--text-muted] leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto Preview */}
      <section className="bg-[--mkt-bg] py-14 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">The Manifesto</p>
          <h2 className="text-3xl font-semibold text-[--text-primary]">9 Theses for the Age of AI</h2>
          <p className="text-[--text-secondary]">The Dauntless Manifesto is a declaration — nine theses that define how we think about work, intelligence, and human potential in an era of profound disruption.</p>
          <blockquote className="text-lg font-bold text-[--text-primary] italic">
            &ldquo;The rules were built for a world that no longer exists. The organizations, professionals, and leaders who cling to them don't just fall behind — they become irrelevant while still feeling productive.&rdquo;
          </blockquote>
          <Link
            href="/about/manifesto"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)",
              boxShadow: "0 0 0 1px rgba(var(--accent-bright-rgb),0.5), 0 8px 32px rgba(var(--accent-rgb),0.35)",
            }}
          >
            Read the Full Manifesto <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>


      <PageCTA
        heading="You've read the story. Let's talk about yours."
      subtext="One conversation is all it takes to figure out if there's a fit."
      />
      <MarketingFooter />
    </div>
  );
}
