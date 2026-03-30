import { ThemeWrapper } from "@/components/marketing/theme-wrapper";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <ThemeWrapper>{children}</ThemeWrapper>;
}
