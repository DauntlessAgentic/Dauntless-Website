"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail, Linkedin, MapPin, Clock, ArrowRight, BookOpen, Layers, Calendar as CalendarIcon } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { identity } from "@/config/identity";

const steps = [
  { step: "1. Response", what: "We acknowledge your message and confirm next steps", timeline: "Within 24 hours" },
  { step: "2. Discovery", what: "A focused conversation to understand your situation and goals", timeline: "30 minutes" },
  { step: "3. Recommendation", what: "A clear recommendation — which service fits, what the engagement looks like, and whether we're the right partner", timeline: "Within 48 hours of discovery" },
  { step: "4. Proposal", what: "If there's a fit, a tailored proposal with scope, outcomes, timeline, and investment", timeline: "Within 1 week" },
];


export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", org: "", role: "", message: "", source: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(var(--accent-rgb),0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[--text-primary]">Let&apos;s Build Something.</h1>
          <p className="text-lg text-[--text-secondary] leading-relaxed">
            Every engagement starts with a conversation. No pitch decks. No sales scripts. Just a real discussion about where you are, where you want to be, and whether we&apos;re the right architecture for the journey.
          </p>
        </div>
      </section>

      {/* Calendar booking block */}
      <section className="bg-[--mkt-bg] py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="flex flex-col md:flex-row items-center gap-5 rounded-xl p-6"
            style={{
              background: "rgba(var(--accent-rgb),0.06)",
              border: "1px solid rgba(var(--accent-bright-rgb),0.2)",
            }}
          >
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-semibold text-[--text-primary]">Prefer to pick a time directly?</p>
              <p className="text-sm text-[--text-secondary] mt-1">
                Book a 30-minute discovery call. No agenda required — bring your challenge.
              </p>
            </div>
            <a
              href="https://cal.com/dauntless/discovery"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                border: "1px solid rgba(var(--accent-bright-rgb),0.4)",
                color: "var(--accent-vivid)",
              }}
            >
              <CalendarIcon className="h-4 w-4" /> Schedule Directly
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form + Quick Reference */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_320px] gap-8">

          {/* Form */}
          <div className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-8">
            {submitted ? (
              <div className="text-center space-y-4 py-12">
                <div className="text-5xl">✓</div>
                <h2 className="text-xl font-bold text-[--text-primary]">Message Received</h2>
                <p className="text-[--text-secondary]">We'll be in touch within 24 hours on business days. Looking forward to the conversation.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Start a Conversation</p>
                  <p className="text-sm text-[--text-muted]">Tell us about your situation and we'll respond within 24 hours.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[--text-secondary]">Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full bg-[--mkt-bg] border border-[--mkt-border] rounded-[--radius-md] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--border-focus] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[--text-secondary]">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@organization.com"
                      className="w-full bg-[--mkt-bg] border border-[--mkt-border] rounded-[--radius-md] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--border-focus] transition-colors" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[--text-secondary]">Organization</label>
                    <input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))}
                      placeholder="Your organization"
                      className="w-full bg-[--mkt-bg] border border-[--mkt-border] rounded-[--radius-md] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--border-focus] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[--text-secondary]">Role / Title</label>
                    <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      placeholder="Your role"
                      className="w-full bg-[--mkt-bg] border border-[--mkt-border] rounded-[--radius-md] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--border-focus] transition-colors" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[--text-secondary]">What are you looking to accomplish? *</label>
                  <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={4} placeholder="Tell us about your situation, your goals, and what's blocking you..."
                    className="w-full bg-[--mkt-bg] border border-[--mkt-border] rounded-[--radius-md] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--border-focus] transition-colors resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[--text-secondary]">How did you hear about us?</label>
                  <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full bg-[--mkt-bg] border border-[--mkt-border] rounded-[--radius-md] px-3 py-2 text-sm text-[--text-primary] focus:outline-none focus:border-[--border-focus] transition-colors">
                    <option value="">Select an option</option>
                    {["LinkedIn", "Referral", "Search", "Event", "Other"].map(o => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)",
                    boxShadow: "0 0 0 1px rgba(var(--accent-bright-rgb),0.5), 0 8px 32px rgba(var(--accent-rgb),0.35)",
                  }}
                >
                  Send Message <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          {/* Quick Reference */}
          <div className="space-y-4">
            <div className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Quick Reference</p>
              {[
                { icon: Mail, label: "Email", value: identity.email, href: `mailto:${identity.email}` },
                ...(identity.linkedIn ? [{ icon: Linkedin, label: "LinkedIn", value: identity.linkedInDisplay!, href: identity.linkedIn }] : []),
                { icon: MapPin, label: "Based In", value: "Ottawa, Canada · Global delivery", href: null },
                { icon: Clock, label: "Response Time", value: "Within 24 hours, business days", href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[--radius-md] bg-[--accent-dim] shrink-0 mt-0.5"><Icon className="h-3.5 w-3.5 text-[--accent-vivid]" /></div>
                  <div>
                    <p className="text-xs text-[--text-muted] uppercase tracking-wider">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                        className="text-sm text-[--text-secondary] hover:text-[--accent-vivid] transition-colors">{value}</a>
                    ) : (
                      <p className="text-sm text-[--text-secondary]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[--accent-dim] border border-[--border-active] rounded-[--radius-xl] p-5 space-y-2">
              <p className="text-xs font-bold text-[--accent-vivid]">No-pressure guarantee.</p>
              <p className="text-sm text-[--text-secondary]">We'll tell you honestly if we're not the right fit. We'll recommend alternatives if we know them. The discovery call is designed to create clarity, not obligation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Process</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">What to Expect After You Reach Out</h2>
          </div>
          <div className="space-y-3">
            {steps.map(({ step, what, timeline }) => (
              <div key={step} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-5 flex flex-col md:flex-row md:items-center gap-3">
                <p className="font-bold text-[--text-primary] md:w-40 shrink-0">{step}</p>
                <p className="text-sm text-[--text-secondary] flex-1">{what}</p>
                <span className="text-xs font-mono text-[--accent-vivid] shrink-0 bg-[--accent-dim] px-2.5 py-1 rounded-full">{timeline}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Not Ready */}
      <section className="bg-[--mkt-section] py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <p className="text-center text-sm text-[--text-muted]">Not ready to talk? Start here.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, title: "Read Our Insights", desc: "Explore our thinking on AI, systems, and human potential.", href: "/insights", cta: "Visit Insights" },
              { icon: Layers, title: "Read the Manifesto", desc: "9 theses on work, intelligence, and what comes next.", href: "/about/manifesto", cta: "Read the Manifesto" },
              { icon: ArrowRight, title: "See Our Method", desc: "Understand how the compounding architecture works.", href: "/method", cta: "Explore the Method" },
            ].map(({ icon: Icon, title, desc, href, cta }) => (
              <div key={title} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-5 space-y-3 hover:border-[--border-active] transition-all duration-300">
                <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim]"><Icon className="h-4 w-4 text-[--accent-vivid]" /></div>
                <h3 className="font-bold text-[--text-primary]">{title}</h3>
                <p className="text-sm text-[--text-secondary]">{desc}</p>
                <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors">
                  {cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
