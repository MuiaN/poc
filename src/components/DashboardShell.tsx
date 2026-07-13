import type { ReactNode } from "react";
import type { Role, SessionUser } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

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
    <div className="flex h-full w-full">
      <Sidebar role={role} user={user} />
      <div className="main">
        <Topbar title={title} user={user} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
