/**
 * Identity Configuration — Stealth Mode Switch
 * ─────────────────────────────────────────────
 * Controls all personal/founder references across the site.
 *
 * To activate stealth mode (anonymous public launch):
 *   Set NEXT_PUBLIC_STEALTH_MODE=true in your .env.local and redeploy.
 *
 * To restore full identity (September reveal):
 *   Remove the variable (or set to "false") and redeploy.
 *
 * This is a build-time switch — changes take effect on next deployment.
 */

const STEALTH = process.env.NEXT_PUBLIC_STEALTH_MODE === "true";

export const identity = {
  // ─── Founder ────────────────────────────────────────────────────────────────
  /** Full name — null in stealth, renders fallback UI in consuming components */
  founderName:       STEALTH ? null               : "Craig Marchand",
  founderTitle:      STEALTH ? "Dauntless Agentic" : "Founder, Dauntless Agentic · Systems Architect · AI Strategist · Builder",
  founderShortTitle: STEALTH ? "Dauntless Agentic" : "Founder, Dauntless Agentic",
  founderPhoto:      STEALTH ? null               : "/images/craig-headshot.jpg",
  founderPhotoAlt:   STEALTH ? "Dauntless Agentic" : "Craig Marchand",

  /** Short bio shown in the homepage founder card */
  founderBioShort: STEALTH
    ? "20+ years of public sector transformation. 180+ AI-augmented workflows designed for government and enterprise. Systems thinkers and architects building at the intersection of AI, human capability, and organizational design."
    : "Former VP Innovation at BDO Canada, FutureCraft program architect, systems thinker, and builder of operating architectures at the intersection of AI, human capability, and organizational design.",

  // ─── Contact ────────────────────────────────────────────────────────────────
  email:     STEALTH ? "hello@dauntlessagentic.com" : "craig@dauntlessagentic.com",
  emailLabel: STEALTH ? "Email Us"                  : "Email Craig",

  // ─── Social ─────────────────────────────────────────────────────────────────
  /** null → LinkedIn card/link is hidden in stealth */
  linkedIn:         STEALTH ? null : "https://linkedin.com/in/craigmarchand",
  linkedInDisplay:  STEALTH ? null : "linkedin.com/in/craigmarchand",
  personalWebsite:  STEALTH ? null : "https://craigmarchand.com",

  // ─── SEO / Schema.org ───────────────────────────────────────────────────────
  sameAs: STEALTH ? [] : ["https://linkedin.com/in/craigmarchand"],

  // ─── About Page ─────────────────────────────────────────────────────────────
  aboutPageTitle: STEALTH
    ? "About Dauntless Agentic"
    : "About — Craig Marchand",
  aboutPageDescription: STEALTH
    ? "The track record, the philosophy, and the thinking behind Dauntless Agentic."
    : "20+ years designing AI and systems architecture for government and enterprise. The story behind Dauntless and why we build the way we do.",

  /** Background line items on the about/credentials section */
  background: STEALTH
    ? [
        "20+ years of public sector innovation",
        "180+ AI-augmented workflows designed",
        "Systems thinking practitioner",
        "Notion-native operating system designer",
        "AI agent fleet architect",
        "Public sector digital transformation specialist",
      ]
    : [
        "VP Innovation, BDO Canada",
        "FutureCraft Program Architect",
        "Systems thinking practitioner",
        "Notion-native operating system designer",
        "AI agent fleet architect",
        "Public sector digital transformation specialist",
      ],

  // ─── Testimonials ───────────────────────────────────────────────────────────
  /** Consulting page testimonial — replaces "Craig's team" with "this team" */
  consultingTestimonialOpener: STEALTH
    ? "Working with this team"
    : "Working with Craig\u2019s team",
};

export type Identity = typeof identity;
