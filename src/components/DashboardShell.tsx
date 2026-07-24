"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Role, SessionUser } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "./ui";

export function DashboardShell({
  role,
  title,
  user,
  children,
  fullWidth = false,
}: {
  role: Role;
  title: string;
  user: SessionUser;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  const pathname = usePathname();
  const isMapPage = pathname.endsWith("/map");

  return (
    <div className="flex h-full w-full">
      <Sidebar role={role} user={user} />
      <div className="main">
        <Topbar title={title} user={user} />
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            isMapPage ? "flex flex-col" : "content",
            fullWidth && "p-0"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
