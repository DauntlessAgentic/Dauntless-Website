import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Work — 150+ Projects Across Complex Organizations",
  description:
    "Strategy, systems, and design work delivered across 50+ public, private, nonprofit, and international organizations. Proof, not promises.",
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
