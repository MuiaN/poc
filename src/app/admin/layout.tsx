import type { ReactNode } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUser } from "@/lib/current-user";

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return null; // middleware redirects before this can happen

  return (
    <DashboardShell role="admin" title="Administrator Dashboard" user={user}>
      {children}
    </DashboardShell>
  );
}
