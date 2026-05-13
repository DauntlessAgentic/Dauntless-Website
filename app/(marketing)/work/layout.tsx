import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Work — 150+ Projects Across Government & Industry",
  description:
    "Strategy, systems, and design work delivered across 50+ client organizations and private sector organizations. Proof, not promises.",
  openGraph: {
    title: "Our Work — Dauntless Agentic",
    description:
      "150+ engagements across federal, private, and international clients. Strategy design, process architecture, foresight, performance models, knowledge systems.",
    type: "website",
    siteName: "Dauntless Agentic",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Work — Dauntless Agentic",
    description:
      "150+ engagements across federal, private, and international clients.",
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
