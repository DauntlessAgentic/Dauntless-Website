import React from "react";

export function Testimonials() {
  return (
    <section className="relative bg-[--mkt-bg] py-16 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.07) 0%, transparent 65%)" }} />
      </div>
      <div className="relative max-w-3xl mx-auto">
        <div className="space-y-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">What Clients Say</p>
        </div>

        {/* Testimonial card */}
        <div
          className="mt-8 relative rounded-2xl p-10 md:p-12 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(16,16,30,0.9) 50%, rgba(109,40,217,0.08) 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          }}
        >
          {/* Decorative quote mark */}
          <div
            className="absolute top-4 left-6 text-[100px] leading-none font-bold select-none opacity-[0.07]"
            aria-hidden="true"
            style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #a78bfa)", WebkitBackgroundClip: "text", color: "transparent" }}
          >
            &ldquo;
          </div>

          <div className="relative space-y-6 text-center">
            <blockquote className="text-lg md:text-xl font-medium text-[--text-primary] leading-relaxed italic">
              &ldquo;The input I have seen is great and helpful for me to open up discussions with my DG.
              I know she wanted to focus on efficiencies and consistency, but there are obviously other
              themes as well to explore. The engagement process was extremely productive and impactful.&rdquo;
            </blockquote>

            <div className="space-y-2">
              <div className="h-px w-12 mx-auto"
                style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)" }} />
              <p className="text-[--text-primary] text-sm font-semibold">Director</p>
              <p className="text-[--accent-vivid] text-xs font-medium uppercase tracking-wider">
                Program Operations Branch
              </p>
              <p className="text-[--text-muted] text-xs">
                Employment and Social Development Canada &middot; Government of Canada
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
