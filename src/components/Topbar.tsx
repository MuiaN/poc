"use client";

import { useRouter } from "next/navigation";
import { type HTMLAttributes } from "react";
import { useTheme } from "next-themes";
import { ROLE_LABEL } from "@/lib/nav";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/components/ui";
import { BellIcon, MoonIcon, SearchIcon, SunIcon, ChevronDownIcon } from "./icons";

export function Topbar({ title, user, className, ...props }: { title: string; user: SessionUser } & HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <header className={cn("topbar", className)} {...props}>
      <div className="spacer" />
      <div className="tb-badge">{user.role === "operator" ? user.company : `${ROLE_LABEL[user.role]} View`}</div>

      <button className="tb-icon" title="Search">
        <SearchIcon />
      </button>
      <button className="tb-icon" title="Notifications">
        <BellIcon />
      </button>
      <button
        className="tb-icon"
        title="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <SunIcon className="h-[15px] w-[15px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[15px] w-[15px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </button>

      <div className="user-chip">
        <div className="uc-av">{initials}</div>
        <div>
          <div className="uc-name">{user.name}</div>
          <div className="uc-role">{ROLE_LABEL[user.role]}</div>
        </div>
        <ChevronDownIcon className="ml-1 h-3.5 w-3.5 text-text-3" />
      </div>
    </header>
  );
}
