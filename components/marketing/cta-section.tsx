import React from "react";
import Link from "next/link";
import { ArrowRight, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="bg-[--mkt-bg] py-24 px-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active]">
            <Cpu className="h-6 w-6 text-[--accent-vivid]" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-[--text-primary]">
            Start building something real.
          </h2>
          <p className="text-sm text-[--text-secondary]">
            Clone the chassis. Set your tokens. Ship a product that looks like it
            was designed with intention — because it was.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="gap-2">
              Open the App
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/showcase">
            <Button variant="outline" size="lg">View Components</Button>
          </Link>
        </div>
        <p className="text-xs text-[--text-muted]">
          MIT licensed · Next.js 16 · TypeScript · Tailwind v4
        </p>
      </div>
    </section>
  );
}
