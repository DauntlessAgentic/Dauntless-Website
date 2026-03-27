import React from "react";
import Link from "next/link";
import { ArrowRight, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";

const theses = [
  {
    num: "I",
    title: "The Age Has Changed. The Rules Haven't Caught Up.",
    pullQuote: "The greatest risk in the age of AI isn't moving too fast. It's optimizing for a world that no longer exists.",
    body: "The organizations, professionals, and leaders who cling to the old rules don't just fall behind — they become irrelevant while still feeling productive. The spreadsheets are green. The dashboards look fine. The quarterly reviews check the boxes. But the ground has shifted beneath them.\n\nThis is a historic period. The relationship between humans and work, between knowledge and value, between effort and outcome — all of it is being rewritten. Not gradually. Not in some distant future. Right now.\n\nThe question isn't whether to adapt. The question is whether you have the mindset to adapt fast enough.",
  },
  {
    num: "II",
    title: "Authentic Over Optimized",
    pullQuote: "Authentic voice is the only moat AI cannot replicate. Lean into yours undaunted.",
    body: "Everyone has access to the same AI. Everyone can generate the same polished output. The playing field of production has been leveled. What hasn't been leveled — what can never be leveled — is style, courage, judgment.\n\nYour perspective. Your hard-won lessons. Your willingness to say what you actually think instead of what the algorithm rewards. Your ability to make a call when the data is ambiguous. These are the things that compound over a career. These are the things that earn trust.\n\nAuthenticity is not the opposite of strategy. It is strategy — the only strategy that compounds.",
  },
  {
    num: "III",
    title: "Augmented, Not Replaced",
    pullQuote: "AI doesn't replace human judgment. It gives human judgment a force multiplier it never had.",
    body: "The \"AI will take your job\" narrative is lazy. It's the story told by people who see humans as cost centers instead of capability multipliers.\n\nThe real story is augmentation — humans and AI, working together, producing outcomes that neither could achieve alone. Humans provide judgment, creativity, ethics, and context. The machine provides speed, scale, pattern recognition, and tireless execution.\n\nThe professional who learns to work with AI doesn't become obsolete. They become 10x. They become the person who can do the work of a team, with the quality of an expert, at the speed of a machine — while still bringing the human judgment that makes it all trustworthy.",
  },
  {
    num: "IV",
    title: "Adaptive by Design",
    pullQuote: "The only sustainable advantage is the architecture of adaptation itself.",
    body: "Stability is an illusion. The model that works today will be disrupted tomorrow. The tool that's cutting-edge this quarter will be commodity next quarter.\n\nThe only sustainable advantage is adaptability — the ability to sense change, process it, and respond with conviction before the market catches up.\n\nThis requires architecture, culture and systems, not agility theater. Real adaptability is designed into the system: feedback loops that learn, governance that enables speed, knowledge structures that compound, and decision frameworks that work under uncertainty.\n\nDon't design for the current answer. Design for the architecture of continuous answers.",
  },
  {
    num: "V",
    title: "The System Is the Strategy",
    pullQuote: "In the age of AI, the operating system is the strategy. Design it accordingly.",
    body: "Most organizations separate strategy from execution. Strategy is what happens in the boardroom. Execution is what happens everywhere else. The gap between them is where value goes to die.\n\nIn an agentic world, the system is the strategy. The way work flows, the way decisions get made, the way value compounds — these aren't operational details. They're strategic choices that determine whether you're building a flywheel or running a treadmill.\n\nWhen the system is the strategy, there's no gap to bridge. The operating architecture embodies the strategic intent. Every workflow is a strategic choice. Every decision gate is a strategic position. Every compounding cycle is a strategic advantage.",
  },
  {
    num: "VI",
    title: "Intelligence Is a Practice, Not a Product",
    pullQuote: "Intelligence compounds through practice, not purchase. Build the practice.",
    body: "The market wants to sell you \"AI solutions.\" Plug it in. Turn it on. Intelligence delivered.\n\nThat's not how intelligence works — artificial or otherwise.\n\nIntelligence is a practice. It's the discipline of sensing your environment, making sense of what you see, deciding how to act, acting with conviction, and learning from the outcome. Then doing it again. And again. Each cycle smarter than the last.\n\nThe organizations that build real AI capability aren't the ones that bought the best tools. They're the ones that built the practice of intelligence — the systems, habits, feedback loops, and knowledge architectures that turn experience into compound advantage.",
  },
  {
    num: "VII",
    title: "Judgment Scales. Tasks Don't.",
    pullQuote: "The highest-leverage human capability is judgment. Invest in it. Architect for it. Scale it.",
    body: "The industrial model valued task execution. The more tasks you could complete, the more value you created. But task execution has a ceiling — there are only so many hours in a day.\n\nJudgment is different. A single good judgment call can redirect an entire organization. A pattern recognized early can save millions. A decision made with conviction can create a market.\n\nIn the age of AI, tasks get automated. Judgment gets amplified. The professional who invests in judgment — who builds the systems, patterns, and architecture to make better decisions faster — doesn't just survive the AI revolution. They define it.\n\nStop trying to do more tasks. Start trying to make better judgments.",
  },
  {
    num: "VIII",
    title: "Build the Architecture of Conviction",
    pullQuote: "Build the architecture that makes boldness safe. Then move undaunted.",
    body: "Boldness gets a bad reputation because most people confuse it with recklessness. They see someone moving fast and assume they're being careless.\n\nBut the most effective leaders aren't cautious or reckless. They're convicted — they move with speed and certainty because they've built the architecture that makes boldness safe.\n\nDecision gates that catch mistakes before they become catastrophes. Knowledge systems that ensure decisions are informed by everything that came before. Governance frameworks that create explicit, structured trust. Agent architectures that handle the volume so humans can focus on the judgment.\n\nThis is the architecture of conviction. Not the absence of governance — the presence of governance so well-designed that it enables speed instead of preventing it.",
  },
  {
    num: "IX",
    title: "Elevate, Don't Optimize",
    pullQuote: "Don't build a faster horse. Build the thing that lets humans fly.",
    body: "Optimization is a trap disguised as progress. It takes what exists and makes it 10% better, 15% faster, 20% cheaper. It's comfortable. It's measurable. And it's the surest path to irrelevance.\n\nElevation is different. Elevation doesn't ask \"how do we do this faster?\" It asks \"what becomes possible that wasn't possible before?\"\n\nWhen you give a human AI augmentation, don't ask them to do their old job faster. Ask them what new work they can now do. When you build an agentic system, don't replicate the old workflow with robots. Design a new workflow that produces outcomes the old one couldn't touch.\n\nThis is the Massively Transformational Purpose: to elevate human potential by redesigning how people and organizations think, decide, and build in the age of AI.\n\nNot to optimize. To elevate.",
  },
];

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.16) 0%, transparent 65%)" }} />
        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">The Dauntless Manifesto</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            9 Theses for the Age of AI
          </h1>
          <p className="text-lg text-[--text-secondary] italic">A declaration for the undaunted — those who refuse to wait for permission to build the future.</p>
          <div className="bg-[--mkt-card] border border-[--border-active] rounded-[--radius-xl] p-6 text-left space-y-3">
            <blockquote className="text-base font-bold text-[--text-primary]">
              &ldquo;To elevate human potential by redesigning how people and organizations think, decide, and build in the age of AI.&rdquo;
            </blockquote>
            <p className="text-sm text-[--text-secondary]">
              This manifesto is not a business plan. It&apos;s a line in the sand. Nine theses that define how we see the world, how we choose to work within it, and what we believe is possible when humans stop settling for the way things have always been done.
            </p>
          </div>
        </div>
      </section>

      {/* Theses */}
      <section className="bg-[--mkt-section] py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {theses.map(({ num, title, pullQuote, body }) => (
            <div key={num} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-8 space-y-5 hover:border-[--border-active] transition-all duration-300">
              <div className="flex items-start gap-4">
                <span className="text-xs font-mono font-bold text-[--accent-vivid] bg-[--accent-dim] border border-[--border-active] px-2 py-1 rounded shrink-0">
                  Thesis {num}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[--text-primary]">{title}</h2>
              <div className="border-l-2 border-[--accent-bright] pl-4">
                <p className="text-base font-bold text-[--accent-vivid] italic">&ldquo;{pullQuote}&rdquo;</p>
              </div>
              <div className="space-y-3">
                {body.split("\n\n").map((para, i) => (
                  <p key={i} className="text-sm text-[--text-secondary] leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, var(--mkt-bg) 0%, rgba(124,58,237,0.08) 50%, var(--mkt-bg) 100%)" }}>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-semibold text-[--text-primary]">The Invitation</h2>
          <p className="text-[--text-secondary] leading-relaxed">
            This manifesto is an invitation to the undaunted — to anyone who sees this moment for what it is and refuses to play small. The age has changed. The rules haven't caught up. And the ones who rewrite them won't be the biggest, the richest, or the most cautious.
          </p>
          <p className="text-lg font-bold text-[--text-primary]">They'll be the ones who are <span className="text-[--accent-vivid]">Authentic. Augmented. Adaptive.</span></p>
          <p className="text-lg font-bold text-[--text-primary]">They'll be <span className="text-[--accent-vivid]">Dauntless.</span></p>
          <div className="flex items-center justify-center gap-3 flex-wrap pt-4">
            <Link href="/contact">
              <Button variant="primary" size="lg" className="gap-2">Start a Conversation <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <a href="https://linkedin.com/in/craigmarchand" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2"><Linkedin className="h-4 w-4" /> Follow on LinkedIn</Button>
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
