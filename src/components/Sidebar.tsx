"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNav, ROLE_LABEL } from "@/lib/nav";
import type { Role } from "@/lib/types";
import { Icon } from "./icons";

export function Sidebar({ role, company }: { role: Role; company: string }) {
  const pathname = usePathname();
  const items = getNav(role);

  return (
    <aside className="relative hidden w-[240px] flex-shrink-0 flex-col overflow-hidden border-r border-border bg-bg-2 md:flex">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          FB
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-[13px] font-bold text-text">{company}</div>
          <div className="text-[10px] uppercase tracking-wide text-text-3">Aviation Intelligence</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 text-[12.5px] font-medium transition-colors ${
                active ? "bg-accent-dim text-accent" : "text-text-2 hover:bg-bg-3 hover:text-text"
              }`}
            >
              <Icon name={item.icon} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-3 text-[10px] text-text-3">
        <div>{company}</div>
        <div className="mt-0.5">{ROLE_LABEL[role]} workspace</div>
      </div>
    </aside>
  );
}
