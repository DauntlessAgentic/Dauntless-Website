import type { MetadataRoute } from "next";

/**
 * Web app manifest — makes the marketing site installable on
 * mobile + desktop (PWA). Theme color matches the deep-ultraviolet
 * identity anchor; background matches the app-bg token.
 *
 * Pre-launch §A10 / repo hygiene.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dauntless Agentic",
    short_name: "Dauntless",
    description:
      "AI strategy, systems, and training for solopreneurs, growing teams, and national institutions.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#09090e",
    theme_color: "#7c3aed",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
