import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageCTA } from "@/components/marketing/page-cta";

export const metadata: Metadata = {
  title: "Investment — Pricing & Engagement Models",
  description:
    "Transparent pricing for Dauntless engagements. Discovery Sprints from $12K, Full Engagements from $45K, Advisory Retainers from $5K/month. All pricing in CAD.",
};

const tiers = [
  {
    name: "Discovery Sprint",
    tag: "Best for organizations who want clarity before committing",
    duration: "2–4 weeks",
    price: "$12,000–$18,000",
    priceNote: "Fixed-fee. No surprises.",
    highlight: false,
    includes: [
      "Current state mapping — where you actually are",
      "Problem definition — the real challenge, not the stated one",
      "Opportunity architecture — where leverage is highest",
      "Roadmap & recommendations — a prioritized path forward",
      "Final briefing — delivered to your senior leadership",
    ],
    ideal:
      "Organizations that have a sense something isn't working but aren't sure what it is — or where to start.",
  },
  {
    name: "Full Engagement",
    tag: "Most popular — the complete operating architecture",
    duration: "8–16 weeks",
    price: "$45,000–$85,000",
    priceNote: "Scoped fixed-fee or milestone-based.",
    highlight: true,
    includes: [
      "Everything in Discovery Sprint",
      "Full design and delivery of the operating system",
      "Governance model built and documented",
      "Team capability transfer — your people can run it",
      "Platform access included for the engagement duration",
      "Post-delivery support window (30 days)",
    ],
    ideal:
      "Organizations ready to move from problem identification to a working system — with the governance to sustain it.",
  },
  {
    name: "Advisory Retainer",
    tag: "For organizations post-engagement or building ongoing capability",
    duration: "Monthly, ongoing",
    price: "$5,000–$12,000 / month",
    priceNote: "3-month minimum. Cancel anytime after.",
    highlight: false,
    includes: [
      "Monthly strategy sessions (2–4 hours)",
      "AI operations review and guidance",
      "Team support access (async, within 24h)",
      "Platform access included",
      "Priority availability for urgent questions",
    ],
    ideal:
      "Organizations post-engagement who want ongoing strategic support, or who are actively building AI capability and need a senior thought partner.",
  },
];

const faqs = [
  {
    q: "Do you work with government procurement?",
    a: "Yes. We work through standard Standing Offer arrangements and Statement of Work processes. If you're in the federal government, we're familiar with the procurement landscape and can help you find the right vehicle.",
  },
  {
    q: "Can we start with just the Discovery Sprint?",
    a: "Absolutely — that's why it exists. Many clients start with a Discovery Sprint and choose to proceed to a Full Engagement based on what we find. There's no obligation to continue, and the Sprint deliverables are yours regardless.",
  },
  {
    q: "What's included in Platform access?",
    a: "The Dauntless Client Intelligence Portal gives you a living workspace for your engagement — queryable deliverables, knowledge capture, and ongoing access to the outputs of our work together. It's included at no extra cost in Full Engagements and Retainers.",
  },
  {
    q: "Do you offer fixed-price engagements?",
    a: "Discovery Sprints are always fixed-fee. Full Engagements are typically fixed-fee within a scoped range, with milestone-based payment schedules available. We don't do open-ended time-and-materials billing.",
  },
  {
    q: "What size organizations do you typically work with?",
    a: "We work with federal government departments (50–5,000+ person programs), Crown corporations, and private sector organizations in the 100–2,000 person range. The common thread is complexity — organizations where the challenge isn't just technical.",
  },
];

export default function PricingPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden bg-[--mkt-section] border-b border-[--mkt-border]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 65%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Investment</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[--text-primary] leading-tight">
            What it costs to work with Dauntless.
          </h1>
          <p className="text-lg text-[--text-secondary] leading-relaxed max-w-2xl mx-auto">
            We believe transparency builds better engagements. Here's what different types of work typically cost — so you can make a real decision before we ever get on a call.
          </p>
          <p className="text-xs text-[--text-muted]">All pricing in CAD. Government procurement through standard Standing Offer or SOW process.</p>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="bg-[--mkt-bg] py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={
                tier.highlight
                  ? {
                      background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(139,92,246,0.04))",
                      border: "1px solid rgba(139,92,246,0.35)",
                      boxShadow: "0 8px 32px -8px rgba(124,58,237,0.25)",
                    }
                  : {
                      background: "var(--mkt-card)",
                      border: "1px solid var(--mkt-border)",
                    }
              }
            >
              {tier.highlight && (
                <div
                  className="h-1 w-full"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #8b5cf6)" }}
                />
              )}

              <div className="flex flex-col gap-5 p-7 flex-1">
                {/* Header */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[--text-muted]">
                    {tier.duration}
                  </p>
                  <h2 className="text-xl font-bold text-[--text-primary]">{tier.name}</h2>
                  <p className="text-xs text-[--text-secondary] leading-snug">{tier.tag}</p>
                </div>

                {/* Price */}
                <div
                  className="rounded-xl p-4 space-y-0.5"
                  style={{
                    background: tier.highlight
                      ? "rgba(139,92,246,0.10)"
                      : "var(--mkt-section)",
                    border: "1px solid var(--mkt-border)",
                  }}
                >
                  <p
                    className="text-2xl font-bold"
                    style={tier.highlight ? { color: "#a78bfa" } : { color: "var(--text-primary)" }}
                  >
                    {tier.price}
                  </p>
                  <p className="text-[11px] text-[--text-muted]">{tier.priceNote}</p>
                </div>

                {/* Includes */}
                <div className="space-y-2 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[--text-muted]">
                    Includes
                  </p>
                  <ul className="space-y-2">
                    {tier.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[--text-secondary]">
                        <Check
                          className="h-3.5 w-3.5 shrink-0 mt-0.5"
                          style={{ color: tier.highlight ? "#a78bfa" : "#34d399" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ideal for */}
                <div
                  className="rounded-lg p-3 space-y-1"
                  style={{ background: "var(--mkt-section)", border: "1px solid var(--mkt-border)" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[--text-muted]">
                    Best for
                  </p>
                  <p className="text-xs text-[--text-secondary] leading-relaxed">{tier.ideal}</p>
                </div>

                <Link href="/contact">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
                    style={
                      tier.highlight
                        ? {
                            background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                            color: "white",
                            boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
                          }
                        : {
                            border: "1px solid rgba(139,92,246,0.3)",
                            color: "var(--accent-vivid)",
                            background: "transparent",
                          }
                    }
                  >
                    Start a Conversation <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Procurement note */}
        <div className="max-w-6xl mx-auto mt-8 text-center">
          <p className="text-xs text-[--text-muted] max-w-2xl mx-auto">
            Government procurement: we work through Standing Offer arrangements and custom SOW processes.
            Not sure which vehicle fits? Mention it when you reach out — we've done this before.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[--mkt-section] border-t border-[--mkt-border] py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">
              Common Questions
            </p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Before you reach out.</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group soft-card overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none text-sm font-semibold text-[--text-primary] hover:text-[--accent-bright] transition-colors">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-[--text-muted] transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-sm text-[--text-secondary] leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors"
            >
              See all frequently asked questions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PageCTA
        heading="Ready to scope an engagement?"
        subtext="Tell us about your challenge and we'll recommend the right starting point — no commitment required."
        buttonLabel="Start a Conversation"
        buttonHref="/contact"
      />

      <MarketingFooter />
    </>
  );
}
