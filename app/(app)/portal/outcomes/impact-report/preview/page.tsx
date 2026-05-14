import { exportSignedImpactReport } from "@/lib/portal/exports/actions";

import { SignedPreviewView } from "./view";

export const dynamic = "force-dynamic";

export default async function SignedPreviewPage() {
  // Generating the bundle on a GET is intentional: previewing is
  // exactly the same operation as downloading, just rendered inline.
  // The audit-log entry is emitted by exportSignedImpactReport().
  const signed = await exportSignedImpactReport();
  return <SignedPreviewView signed={signed} />;
}
