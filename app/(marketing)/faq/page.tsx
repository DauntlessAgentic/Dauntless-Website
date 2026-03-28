import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageCTA } from "@/components/marketing/page-cta";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Everything you need to know before working with Dauntless — who we work with, how engagements work, pricing, procurement, and what happens after.",
};

const categories = [
  {
    title: "Who Is This For?",
    questions: [
      {
        q: "Is Dauntless just for government clients?",
        a: "No — though government work is a significant part of our portfolio. We work with federal departments, Crown corporations, and private sector organizations where complexity is high and getting it wrong has real consequences. The common denominator is organizational complexity, not sector.",
      },
      {
        q: "What size organization do you typically work with?",
        a: "Federal government programs ranging from 50 to 5,000+ people, and private sector organizations in the 100 to 2,000 person range. We're not a good fit for early-stage startups or organizations looking for off-the-shelf software — our work is about operating architecture, not tooling.",
      },
      {
        q: "Do you work with teams that have no AI experience?",
        a: "Yes — and it's often the better starting position. Organizations without entrenched AI habits tend to be easier to design for. Our training programs are built to meet people where they are, from executives who've never used a language model to practitioners ready to build serious workflows.",
      },
    ],
  },
  {
    title: "The Engagement",
    questions: [
      {
        q: "How long does a typical project take?",
        a: "Discovery Sprints run 2–4 weeks. Full Engagements typically run 8–16 weeks depending on scope. Advisory Retainers are ongoing by design. We don't do year-long projects — if it takes that long, the scope wasn't defined well enough.",
      },
      {
        q: "What do we need to bring to a Discovery Sprint?",
        a: "Honestly — a problem and the willingness to hear an honest assessment of it. Access to 4–6 people who live inside the challenge is helpful. You don't need to have your story straight before we start; that's part of what Discovery is for.",
      },
      {
        q: "How much time does our team need to commit?",
        a: "For Discovery Sprints: 6–10 hours across the engagement, mostly in structured interviews. For Full Engagements: 2–4 hours per week from key stakeholders, with more intensive periods at the design and validation stages. We don't need your team to go heads-down — we do the heavy lifting.",
      },
      {
        q: "What happens after the engagement ends?",
        a: "You own everything we build — all documentation, process models, governance frameworks, and tools. Platform access continues through the engagement window. Advisory Retainers are available for ongoing support. We design engagements to create organizational capability, not dependency on us.",
      },
    ],
  },
  {
    title: "The Work",
    questions: [
      {
        q: "What does 'agentic system' actually mean?",
        a: "An agentic system is an AI-powered workflow that can perform multi-step tasks autonomously — it doesn't need a human to click through each step. Think of it as an AI that can read a document, extract the key information, route it to the right place, generate a first draft response, and flag it for review. All without human intervention until the final check.",
      },
      {
        q: "How is this different from hiring a developer to build AI tools?",
        a: "A developer will build what you specify. We figure out what you should specify — the workflow design, the governance layer, the human-in-the-loop checkpoints, the training your team needs to actually use it. We often work alongside technical teams; we're not replacing them, we're designing the system they build.",
      },
      {
        q: "Do you deliver documentation or just recommendations?",
        a: "Both — but documentation that's designed to be used, not filed. Every engagement delivers working process models, governance frameworks, and implementation guides. Where we build agentic systems, we document the architecture in a way your team can maintain and extend.",
      },
      {
        q: "Who owns the IP?",
        a: "You do. All deliverables — frameworks, process models, agentic workflows, documentation — are yours. We retain the right to describe the nature of the engagement (without client-identifying details) for our own portfolio. That's it.",
      },
    ],
  },
  {
    title: "Logistics",
    questions: [
      {
        q: "How does government procurement work with you?",
        a: "We work through Standing Offer arrangements and custom Statement of Work processes. We're familiar with the ProServices and Task and Solutions Professional Services (TSPS) streams. If you're unsure which vehicle applies, just ask — we've navigated this many times.",
      },
      {
        q: "Do you work remotely or on-site?",
        a: "Primarily remote, with on-site for specific workshops and sessions where face-to-face adds material value. We're based in Ottawa, which makes on-site work practical for NCR-based clients. For out-of-region engagements, we build travel into the scope as needed.",
      },
      {
        q: "What does pricing look like?",
        a: "Discovery Sprints are fixed-fee from $12,000–$18,000 CAD. Full Engagements range from $45,000–$85,000 depending on scope. Advisory Retainers start at $5,000/month. See our Investment page for full details and what's included at each level.",
      },
      {
        q: "How do we get started?",
        a: "Start a conversation using the form on our Contact page, or book a 30-minute discovery call directly. We'll respond within 24 hours. No pitch deck, no obligation — just a real conversation about whether there's a fit.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="bg-[--mkt-section] border-b border-[--mkt-border] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">FAQ</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[--text-primary] leading-tight">
            Everything you want to know before reaching out.
          </h1>
          <p className="text-lg text-[--text-secondary] leading-relaxed">
            Real questions, honest answers. No marketing speak.
          </p>
        </div>
      </section>

      {/* FAQ body */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-14">
          {categories.map((cat) => (
            <div key={cat.title} className="space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid] pb-2 border-b border-[--mkt-border]">
                {cat.title}
              </h2>
              <div className="space-y-4">
                {cat.questions.map((faq, i) => (
                  <details
                    key={i}
                    className="group soft-card overflow-hidden"
                  >
                    <summary className="flex items-start justify-between gap-3 px-5 py-4 cursor-pointer list-none">
                      <span className="text-sm font-semibold text-[--text-primary] group-hover:text-[--accent-bright] transition-colors">
                        {faq.q}
                      </span>
                      <svg
                        className="h-4 w-4 shrink-0 mt-0.5 text-[--text-muted] transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-4">
                      <p className="text-sm text-[--text-secondary] leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="bg-[--mkt-section] border-t border-[--mkt-border] py-12 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-sm font-semibold text-[--text-primary]">Still have questions?</p>
          <p className="text-xs text-[--text-secondary]">
            The fastest way to get a real answer is a direct conversation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
              >
                Start a Conversation <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors"
            >
              See pricing details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PageCTA
        heading="Not ready to reach out yet? That's okay."
        subtext="Read about our method, browse the work, or explore what an engagement actually looks like."
        buttonLabel="Explore the Work"
        buttonHref="/work"
      />

      <MarketingFooter />
    </>
  );
}
