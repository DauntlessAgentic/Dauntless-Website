import { NextResponse } from "next/server";

import { getAuthRuntimeState } from "@/lib/auth/runtime";
import { computeActivationStatus, getPortalRepository } from "@/lib/portal/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  const repository = getPortalRepository();
  const activation = computeActivationStatus(repository);
  const auth = getAuthRuntimeState();
  const isProduction = process.env.NODE_ENV === "production";
  const portalPublicEnabled = !isProduction || process.env.PORTAL_PUBLIC_ENABLED === "true";
  const apiKeyConfigured = Boolean(process.env.PORTAL_API_KEY);
  const openApiDemo = process.env.PORTAL_ALLOW_OPEN_API === "true";

  const missingRequired = [
    portalPublicEnabled && isProduction && auth.mode === "auth-unavailable" ? "AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET or PORTAL_DEMO_MODE" : null,
    portalPublicEnabled && isProduction && !apiKeyConfigured && !openApiDemo ? "PORTAL_API_KEY or PORTAL_ALLOW_OPEN_API" : null,
  ].filter((item): item is string => Boolean(item));

  const status = missingRequired.length > 0 ? "degraded" : "ok";

  return NextResponse.json(
    {
      status,
      checkedAt: new Date().toISOString(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "local",
      repository: {
        kind: activation.repositoryKind,
        id: activation.repositoryId,
        hosted: activation.isHosted,
        writable: activation.isWritable,
        gaps: activation.configGaps,
      },
      auth: {
        portalPublicEnabled,
        mode: auth.mode,
        configured: auth.isConfigured,
        demo: auth.isDemoMode,
        devBypass: auth.isDevBypassEnabled,
      },
      api: {
        bearerConfigured: apiKeyConfigured,
        openApiDemo,
        rateLimit: {
          scope: "in-process",
          burst: Number(process.env.PORTAL_API_RATE_BURST ?? 30),
          refillPerSecond: Number(process.env.PORTAL_API_RATE_REFILL ?? 5),
        },
      },
      env: {
        nodeEnv: process.env.NODE_ENV ?? "development",
        missingRequired,
      },
    },
    { status: missingRequired.length > 0 ? 503 : 200 },
  );
}
