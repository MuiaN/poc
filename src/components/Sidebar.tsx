"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { getNav, ROLE_LABEL, ROLE_BASE } from "@/lib/nav";
import { cn } from "@/components/ui";
import type { Role, SessionUser } from "@/lib/types";
import { Icon, PlaneIcon, ChatIcon, LogoutIcon, ChevronDownIcon } from "./icons";

export function Sidebar({ role, user }: { role: Role; user: SessionUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const allItems = getNav(role);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  const [countryProfilesOpen, setCountryProfilesOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const COUNTRY_REGIONS = [
    {
      label: "East Africa",
      countries: [
        { code: "ke", name: "Kenya" },
        { code: "tz", name: "Tanzania" },
        { code: "ug", name: "Uganda" },
        { code: "rw", name: "Rwanda" },
        { code: "bi", name: "Burundi" },
      ],
    },
    {
      label: "Horn & Central",
      countries: [
        { code: "cd", name: "DR Congo" },
        { code: "so", name: "Somalia" },
        { code: "et", name: "Ethiopia" },
        { code: "ss", name: "South Sudan" },
        { code: "sd", name: "Sudan" },
        { code: "dj", name: "Djibouti" },
        { code: "er", name: "Eritrea" },
      ],
    },
  ];

  const handleLogout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }, [router]);

  const openLogoutDialog = () => setShowLogoutDialog(true);
  const closeLogoutDialog = () => setShowLogoutDialog(false);

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
        {allItems.map((item) => {
          const active = pathname === item.href;
          if (item.key === "countries") {
            return (
              <div key={item.key} className="nav-item-group">
                <button
                  className={cn("nav-item w-full justify-between", active && "active")}
                  onClick={() => setCountryProfilesOpen(!countryProfilesOpen)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDownIcon
                    className={cn(
                      "h-3 w-3 stroke-current transition-transform",
                      countryProfilesOpen && "rotate-180"
                    )}
                  />
                </button>
                {countryProfilesOpen && (
                  <div className="overflow-hidden transition-all duration-200">
                    <div className="px-3 pb-2">
                      {COUNTRY_REGIONS.map((region) => (
                        <div key={region.label}>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-text-3 px-3 py-1 border-t border-border">
                            {region.label}
                          </div>
                          {region.countries.map((c) => (
                            <Link
                              key={c.code}
                              href={`${ROLE_BASE[role]}/countries/${c.code}`}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-2 hover:bg-accent-dim hover:text-accent transition-colors rounded-[6px] mb-1",
                                pathname === `${ROLE_BASE[role]}/countries/${c.code}` && "bg-accent-dim text-accent"
                              )}
                            >
                              <img
                                src={`https://flagcdn.com/w20/${c.code}.png`}
                                alt=""
                                className="w-5 h-3 rounded flex-shrink-0"
                              />
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }
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
              role === "underwriter"
                ? "border-accent/20 bg-accent-dim text-accent"
                : role === "admin"
                  ? "border-purple-500/20 bg-purple-500/10 text-purple-500"
                  : "border-warn/20 bg-warn-dim text-warn",
            )}
          >
            {role === "admin" ? "Admin" : role === "operator" ? "Operator" : "Insurer"}
          </div>
          <button onClick={openLogoutDialog} title="Sign out" className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-transparent text-text-3 transition-colors hover:border-danger hover:text-danger">
            <LogoutIcon className="h-3 w-3" />
          </button>
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
    </aside>
  );
}