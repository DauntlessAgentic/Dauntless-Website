import type { Metadata } from "next";

import { AppShell } from "@/components/shell/app-shell";
import { PoliteAnnouncer } from "@/components/patterns/polite-announcer";
import { RoleSwitcher } from "@/components/shell/role-switcher";
import { WorkspaceSwitcher } from "@/components/shell/workspace-switcher";
import { getAuthRuntimeState } from "@/lib/auth/runtime";
import { getCurrentMembership } from "@/lib/auth/session";
import { getOrgRollup } from "@/lib/portal/org-rollup";
import { getPortalRepository } from "@/lib/portal/repositories";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = getAuthRuntimeState();

  if (auth.mode === "auth-unavailable") {
    return (
      <div className="min-h-screen bg-[--app-bg] text-[--text-primary]">
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-4 px-6">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[--text-muted]">
            Client Intelligence Portal
          </p>
          <h1 className="text-2xl font-semibold">Portal sign-in is not configured</h1>
          <p className="text-sm leading-relaxed text-[--text-secondary]">
            Client access requires OAuth or an explicit public demo flag. Set `PORTAL_DEMO_MODE=true`
            for a labeled demo, or configure real authentication before exposing the portal.
          </p>
        </main>
      </div>
    );
  }

  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  const rollup = await getOrgRollup((await repo.getSnapshot(workspace.id)).organization.id);

  return (
    <AppShell
      banner={
        auth.isDemoMode ? (
          <div
            role="status"
            className="border-b border-[--border-active] bg-[--accent-dim] px-3 py-2 text-xs text-[--text-secondary]"
          >
            <span className="font-semibold text-[--accent-vivid]">Demo mode:</span>{" "}
            this portal uses deterministic sample data, role switching is enabled for walkthroughs,
            and changes may reset when the server restarts.
          </div>
        ) : null
      }
      topBarActions={
        <>
          <WorkspaceSwitcher
            orgName={rollup.organization.name}
            items={rollup.workspaces.map((w) => ({
              id: w.id,
              name: w.name,
              visibility: w.visibility,
              active: w.active,
            }))}
          />
          <RoleSwitcher
            currentRole={membership.role}
            displayName={membership.displayName}
            visible={auth.isDevBypassEnabled}
            modeLabel={auth.isDemoMode ? "Demo mode" : "Dev-bypass mode"}
          />
        </>
      }
    >
      {children}
      <PoliteAnnouncer />
    </AppShell>
  );
}
