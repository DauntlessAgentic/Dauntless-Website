import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Conversation",
  description:
    "Tell us about your challenge. No pitch decks, no pressure — just a real conversation about what you're trying to build.",
  openGraph: {
    title: "Start a Conversation — Dauntless Agentic",
    description:
      "Response within 24 hours. 30-minute discovery call, then a clear recommendation within a week.",
    type: "website",
    siteName: "Dauntless Agentic",
  },
  twitter: {
    card: "summary_large_image",
    title: "Start a Conversation — Dauntless Agentic",
    description:
      "Response within 24 hours. No pitch decks, no pressure.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
