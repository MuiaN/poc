"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getNav, ROLE_LABEL } from "@/lib/nav";
import { cn } from "@/components/ui";
import type { Role, SessionUser } from "@/lib/types";
import { Icon, PlaneIcon, ChatIcon, LogoutIcon } from "./icons";

export function Sidebar({ role, user }: { role: Role; user: SessionUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const items = getNav(role);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  async function logout() {
    if (!confirm("Sign out of FRED BLACK?")) return;
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar hidden md:flex">
      <PlaneIcon className="sidebar-plane" />
      <div className="logo-area">
        <div className="logo-icon">
          <Icon name="fleet" className="h-[18px] w-[18px] fill-white" />
        </div>
        <div>
          <div className="logo-name">FRED BLACK</div>
          <div className="logo-tag">Aviation Intelligence</div>
        </div>
      </div>

      <nav className="nav">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.key} href={item.href} className={cn("nav-item", active && "active")}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="help-box">
        <div className="help-top">
          <div className="help-icon">
            <ChatIcon className="h-[14px] w-[14px] fill-white" />
          </div>
          <div className="help-title">Need Help?</div>
        </div>
        <div className="help-sub">Contact our support 24/7</div>
      </div>

      <div className="user-bar">
        <div className="avatar">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="u-name">{user.name}</div>
          <div className="u-role">{ROLE_LABEL[role]}</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div
            className={cn(
              "rounded-md border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider",
              role === "underwriter" ? "border-accent/20 bg-accent-dim text-accent" : "border-warn/20 bg-warn-dim text-warn",
            )}
          > 
            {role === "operator" ? "Operator" : "Insurer"}
          </div> 
          <button onClick={logout} title="Sign out" className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-transparent text-text-3 transition-colors hover:border-danger hover:text-danger">
            <LogoutIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
