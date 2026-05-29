import { ThemeWrapper } from "@/components/marketing/theme-wrapper";

export const dynamic = "force-static";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <ThemeWrapper>{children}</ThemeWrapper>;
}
