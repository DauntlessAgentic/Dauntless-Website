import { MetadataRoute } from "next";

// Sitemap entries. Per-route lastModified anchors to a stable value so the
// sitemap doesn't churn on every build (which would otherwise hurt
// rank-stability signals). Bump the relevant `LAST_MODIFIED` constant when
// the corresponding page's content meaningfully changes.
const LAST_MODIFIED_DEFAULT = new Date("2026-05-13T00:00:00.000Z");
const LAST_MODIFIED_PLATFORM = new Date("2026-05-13T00:00:00.000Z");

interface SitemapEntry {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified?: Date;
}

const entries: SitemapEntry[] = [
  { path: "/",                                   changeFrequency: "weekly",  priority: 1.0 },
  { path: "/platform",                           changeFrequency: "weekly",  priority: 0.9, lastModified: LAST_MODIFIED_PLATFORM },
  { path: "/method",                             changeFrequency: "monthly", priority: 0.8 },
  { path: "/services",                           changeFrequency: "monthly", priority: 0.9 },
  { path: "/services/training",                  changeFrequency: "monthly", priority: 0.85 },
  { path: "/services/consulting",                changeFrequency: "monthly", priority: 0.85 },
  { path: "/services/agentic-systems",           changeFrequency: "monthly", priority: 0.85 },
  { path: "/about",                              changeFrequency: "monthly", priority: 0.7 },
  { path: "/about/manifesto",                    changeFrequency: "monthly", priority: 0.6 },
  { path: "/work",                               changeFrequency: "monthly", priority: 0.7 },
  { path: "/case-studies",                       changeFrequency: "monthly", priority: 0.8 },
  { path: "/case-studies/esdc-process-redesign", changeFrequency: "yearly",  priority: 0.6 },
  { path: "/case-studies/health-canada-foresight", changeFrequency: "yearly", priority: 0.6 },
  { path: "/case-studies/tbs-performance-model", changeFrequency: "yearly",  priority: 0.6 },
  { path: "/insights",                           changeFrequency: "weekly",  priority: 0.7 },
  { path: "/contact",                            changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing",                            changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq",                                changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/privacy",                      changeFrequency: "yearly",  priority: 0.3 },
  { path: "/legal/terms",                        changeFrequency: "yearly",  priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dauntlessagentic.com";
  return entries.map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: entry.lastModified ?? LAST_MODIFIED_DEFAULT,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
