import type { ReactNode } from "react";
import type { Role } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
  company: string;
}

export function DashboardShell({
  role,
  title,
  user,
  children,
}: {
  role: Role;
  title: string;
  user: SessionUser;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text">
      <Sidebar role={role} company={user.company} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} user={user} />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
