import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { DemoModeBanner } from "@/components/shell/demo-mode-banner";
import { RoleSwitcher } from "@/components/shell/role-switcher";
import { WorkspaceSwitcher } from "@/components/shell/workspace-switcher";
import { getAuthRuntimeState } from "@/lib/auth/runtime";
import { getCurrentMembership } from "@/lib/auth/session";
import { getOrgRollup } from "@/lib/portal/org-rollup";
import { getPortalRepository } from "@/lib/portal/repositories";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  const auth = getAuthRuntimeState();
  const rollup = await getOrgRollup((await repo.getSnapshot(workspace.id)).organization.id);

  return (
    <AppShell
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
          />
        </>
      }
    >
      <Suspense fallback={null}>
        <DemoModeBanner />
      </Suspense>
      {children}
    </AppShell>
  );
}
