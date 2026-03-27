import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="bg-[--mkt-bg] py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)",
          }}
        />
      </div>
      <div className="relative max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-4xl md:text-5xl font-bold text-[--text-primary]">
          Ready to Build Something Dauntless?
        </h2>
        <p className="text-[--text-secondary] text-lg leading-relaxed">
          Every engagement starts with a conversation. No pitch decks. No sales scripts. Just a
          real discussion about where you are, where you want to be, and whether we&apos;re the
          right architecture for the journey.
        </p>
        <Link href="/contact">
          <Button
            variant="primary"
            size="lg"
            className="gap-2 shadow-[var(--shadow-accent)] text-base px-8"
          >
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
