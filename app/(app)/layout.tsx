import { AppShell } from "@/components/shell/app-shell";
import { RoleSwitcher } from "@/components/shell/role-switcher";
import { getAuthRuntimeState } from "@/lib/auth/runtime";
import { getCurrentMembership } from "@/lib/auth/session";
import { getPortalRepository } from "@/lib/portal/repositories";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  const membership = await getCurrentMembership(workspace.id);
  const auth = getAuthRuntimeState();

  return (
    <AppShell
      topBarActions={
        <RoleSwitcher
          currentRole={membership.role}
          displayName={membership.displayName}
          visible={auth.isDevBypassEnabled}
        />
      }
    >
      {children}
    </AppShell>
  );
}
