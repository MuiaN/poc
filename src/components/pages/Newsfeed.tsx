"use client";

import { Card, PageHeader, Badge } from "@/components/ui";
import { useState, useRef, useEffect } from "react";
import { newsfeedInsurer, newsfeedOperator } from "@/data";
import type { Role } from "@/lib/types";

const CATEGORIES = [
  { key: "ALL", label: "All", color: "#1a6fe8" },
  { key: "WEATHER", label: "Weather", color: "#f39c12" },
  { key: "SECURITY", label: "Security", color: "#dc2626" },
  { key: "REGULATION", label: "Regulation", color: "#7c3aed" },
  { key: "COMMERCIAL", label: "Commercial", color: "#1a6fe8" },
  { key: "INFRASTRUCTURE", label: "Infrastructure", color: "#b45309" },
];

export function Newsfeed({ role }: { role: Role }) {
  const items = role === "operator" ? newsfeedOperator : newsfeedInsurer;
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = selectedCategory === "ALL" 
    ? items 
    : items.filter(n => n.cat === selectedCategory);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Regional Newsfeed" 
        subtitle="Live risk, security, and operational intelligence across Eastern Africa"
        action={
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="nf-filter-btn flex items-center gap-2 px-3 py-1.5 bg-accent text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-accent-h"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
              Filter
              <svg className={`h-3 w-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="nf-dropdown absolute right-0 mt-1.5 min-w-[170px] bg-bg-3 border border-border-2 rounded-lg shadow-lg overflow-hidden z-50">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      setDropdownOpen(false);
                    }}
                    className={`nf-dropdown-item flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-text transition-colors w-full ${
                      selectedCategory === cat.key 
                        ? "bg-accent-dim text-accent font-bold" 
                        : "hover:bg-bg-hover"
                    }`}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <span 
                      className="nf-cat-dot w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />
      <div className="flex flex-col gap-3">
        {filteredItems.map((n, i) => (
          <Card key={i} className="p-4">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: `${n.catColor}22`, color: n.catColor }}
              >
                {n.cat}
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-text-3">{n.country}</span>
              <span className="ml-auto text-[10.5px] text-text-3">{n.time}</span>
            </div>
            <div className="text-[13px] font-semibold text-text">{n.headline}</div>
            <div className="mt-1 text-[12px] leading-relaxed text-text-2">{n.body}</div>
            <div className="mt-2 text-[10.5px] italic text-text-3">{n.source}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
