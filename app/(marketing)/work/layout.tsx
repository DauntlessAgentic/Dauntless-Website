import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Work — 150+ Projects Across Government & Industry",
  description:
    "Strategy, systems, and design work delivered across 50+ client organizations and private sector organizations. Proof, not promises.",
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
