import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Testimonials() {
  return (
    <section
      className="py-24 px-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--mkt-section) 0%, rgba(124,58,237,0.08) 50%, var(--mkt-section) 100%)",
      }}
    >
      <div className="relative max-w-3xl mx-auto text-center space-y-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">
          The Manifesto
        </p>
        <blockquote className="text-3xl md:text-4xl font-extrabold text-[--text-primary] leading-snug italic">
          &ldquo;Don&apos;t build a faster horse. Build the thing that lets humans fly.&rdquo;
        </blockquote>
        <p className="text-[--text-muted] text-sm">— Thesis IX, The Dauntless Manifesto</p>
        <p className="text-[--text-secondary]">
          9 theses on work, intelligence, and human potential in the age of AI. A declaration for
          the undaunted.
        </p>
        <Link href="/about/manifesto">
          <Button variant="primary" size="lg" className="gap-2">
            Read the Full Manifesto <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
