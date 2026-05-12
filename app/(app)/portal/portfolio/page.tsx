import { notFound } from "next/navigation";

import {
  computePortfolioTotals,
  EMERGENT_PATTERNS,
  INTERNAL_DECISIONS,
  PORTFOLIO_ACCOUNTS,
} from "@/lib/portal/portfolio";
import { loadPortalContext } from "@/lib/portal/server";

import { PortfolioView } from "./view";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const { membership } = await loadPortalContext();
  // Dauntless-internal — gate to owners only.
  if (membership.role !== "owner") notFound();
  const totals = computePortfolioTotals(PORTFOLIO_ACCOUNTS);
  return (
    <PortfolioView
      accounts={PORTFOLIO_ACCOUNTS}
      totals={totals}
      patterns={EMERGENT_PATTERNS}
      internalDecisions={INTERNAL_DECISIONS}
      membership={membership}
    />
  );
}
