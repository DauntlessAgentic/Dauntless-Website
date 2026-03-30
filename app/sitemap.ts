import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dauntlessagentic.com";
  const pages = [
    "/",
    "/about",
    "/about/manifesto",
    "/method",
    "/contact",
    "/platform",
    "/insights",
    "/work",
    "/services",
    "/services/training",
    "/services/consulting",
    "/services/agentic-systems",
    "/case-studies",
    "/case-studies/esdc-process-redesign",
    "/case-studies/health-canada-foresight",
    "/case-studies/tbs-performance-model",
    "/legal/privacy",
    "/legal/terms",
    "/pricing",
    "/faq",
  ];
  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
