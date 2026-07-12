"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROLE_LABEL } from "@/lib/nav";
import type { SessionUser } from "./DashboardShell";

export function Topbar({ title, user }: { title: string; user: SessionUser }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-border bg-bg-2 px-5 py-3">
      <div className="min-w-0">
        <div className="font-display text-[14px] font-bold text-text">{title}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-[12px] font-semibold text-text">{user.name}</div>
          <div className="text-[10.5px] text-text-3">
            {ROLE_LABEL[user.role]} · {user.company}
          </div>
        </div>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border-2 bg-bg-3 text-[11px] font-bold text-text-2">
          {user.name.charAt(0)}
        </div>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="rounded-md border border-border-2 px-2.5 py-1.5 text-[11px] font-semibold text-text-2 transition-colors hover:border-accent hover:text-text disabled:opacity-60"
        >
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </header>
  );
}
