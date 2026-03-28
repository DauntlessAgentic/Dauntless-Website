import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Conversation — Dauntless",
  description:
    "Tell us about your challenge. No pitch decks, no pressure — just a real conversation about what you're trying to build.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
