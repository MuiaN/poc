"use client";

import { useRouter } from "next/navigation";
import { type HTMLAttributes } from "react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { ROLE_LABEL } from "@/lib/nav";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/components/ui";
import { BellIcon, MoonIcon, SearchIcon, SunIcon, ChevronDownIcon, LogoutIcon, UserIcon } from "./icons";

export function Topbar({ title, user, className, ...props }: { title: string; user: SessionUser } & HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const openLogoutDialog = () => {
    setDropdownOpen(false);
    setShowLogoutDialog(true);
  };

  const closeLogoutDialog = () => setShowLogoutDialog(false);

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
        <SunIcon className="h-[15px] w-[15px] rotate-0 scale-100 transition-all [html[data-theme=dark]&:rotate-90] [html[data-theme=dark]&:scale-0]" />
        <MoonIcon className="absolute h-[15px] w-[15px] rotate-90 scale-0 transition-all [html[data-theme=dark]&:rotate-0] [html[data-theme=dark]&:scale-100]" />
        <span className="sr-only">Toggle theme</span>
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          className={cn(
            "user-chip w-full transition-all duration-200 ease-out",
            dropdownOpen && "rounded-b-none"
          )}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="uc-av">{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="uc-name truncate">{user.name}</div>
            <div className="uc-role truncate">{ROLE_LABEL[user.role]}</div>
          </div>
          <ChevronDownIcon className={cn("ml-1 h-3.5 w-3.5 text-text-3 transition-transform duration-200", dropdownOpen && "rotate-180")} />
        </button>

        <div
          className={cn(
            "absolute right-0 top-full left-0 bg-bg-3 border border-border border-t-0 rounded-b-lg shadow-lg z-50 overflow-hidden transition-all duration-200 ease-out",
            dropdownOpen
              ? "opacity-100 visible max-h-40"
              : "opacity-0 invisible max-h-0"
          )}
        >
          <div className="px-3 py-2 flex items-center gap-2 text-xs text-text hover:bg-bg-hover transition-colors cursor-pointer"
               onClick={() => setDropdownOpen(false)}>
            <UserIcon className="h-3.5 w-3.5" />
            <span>Profile</span>
          </div>
          <div className="border-t border-border mx-3" />
          <div className="px-3 py-2 flex items-center gap-2 text-xs text-danger hover:bg-danger-dim transition-colors cursor-pointer"
               onClick={openLogoutDialog}>
            <LogoutIcon className="h-3.5 w-3.5" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeLogoutDialog}>
          <div className="bg-bg-2 border border-border rounded-lg p-6 min-w-[320px] max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                <LogoutIcon className="h-5 w-5 text-danger" />
              </div>
              <h3 className="text-lg font-semibold text-text">Sign Out</h3>
            </div>
            <p className="text-text-2 mb-6">Are you sure you want to sign out of FRED BLACK?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeLogoutDialog}
                className="px-4 py-2 rounded-md border border-border text-text-2 hover:bg-bg-3 hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-danger text-white hover:bg-danger/90 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
