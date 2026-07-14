"use client";

import { useMemo } from "react";
import { useState } from "react";
import { Button, cn } from "@/components/ui";
import {
  INSURANCE_NEWS_ITEMS,
  INSURER_NOTAMS,
  INSURER_COUNTRIES,
  ASN_RECENT_INCIDENTS,
  ASN_HISTORIC_INCIDENTS,
} from "@/data/overview";
import { NewsBadge } from "@/components/NewsBadge";
import { NotamItem } from "@/components/NotamItem";

type InsurerTab = "intelligence" | "safety";
type ASNTab = "recent" | "historic";
type NewsFilter = "ALL" | "WEATHER" | "SECURITY" | "REGULATION" | "INFRASTRUCTURE";

export function IntelligencePanel() {
  const [tab, setTab] = useState<InsurerTab>("intelligence");
  const [asnTab, setAsnTab] = useState<ASNTab>("recent");
  const [newsFilter, setNewsFilter] = useState<NewsFilter>("ALL");
  const [asnSearch, setAsnSearch] = useState("");
  const [asnFatalOnly, setAsnFatalOnly] = useState(false);

  const filteredNews = useMemo(() => {
    if (newsFilter === "ALL") return INSURANCE_NEWS_ITEMS;
    return INSURANCE_NEWS_ITEMS.filter((item) => item.cat === newsFilter);
  }, [newsFilter]);

  const filteredHistoricIncidents = useMemo(() => {
    return ASN_HISTORIC_INCIDENTS.filter((inc) => {
      const matchesSearch = asnSearch ? Object.values(inc).some((val) => String(val).toLowerCase().includes(asnSearch.toLowerCase())) : true;
      const matchesFatal = asnFatalOnly ? inc.fat > 0 : true;
      return matchesSearch && matchesFatal;
    });
  }, [asnSearch, asnFatalOnly]);
 return (
    <div className="panel">
      {/* Main Tab Bar */}
      <div className="flex border-b border-border bg-bg-3">
        <button
          onClick={() => setTab("intelligence")}
          className={cn(
            "mb-[-1px] border-b-2 bg-transparent px-4 py-2 text-xs font-semibold",
            tab === "intelligence" ? "border-accent text-accent" : "border-transparent text-text-2",
          )}
        >
          Intelligence
        </button>
        <button
          onClick={() => setTab("safety")}
          className={cn(
            "mb-[-1px] flex items-center gap-1.5 border-b-2 bg-transparent px-4 py-2 text-xs font-semibold",
            tab === "safety" ? "border-accent text-accent" : "border-transparent text-text-2",
          )}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Aviation Safety
        </button>
      </div>

      {/* Intelligence Pane */}
      <div className={cn("grid-cols-[1fr_1fr_220px]", tab === "intelligence" ? "grid" : "hidden")}>
        {/* News Column */}
        <div className="border-r border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-3 p-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-display text-[13px] font-bold tracking-wide text-text">Today's Risk Intelligence</span>
            </div>
            <div className="flex w-full flex-wrap items-center justify-between gap-y-2">
              <div className="flex items-center gap-1.5">
                {(["ALL", "WEATHER", "SECURITY", "REGULATION", "INFRASTRUCTURE"] as NewsFilter[]).map((f) => (
                  <button key={f} onClick={() => setNewsFilter(f)} className={cn(
                    "rounded-sm border border-border-2 bg-bg-3 px-2.5 py-0.5 text-[11px] font-semibold text-text-2 transition-colors hover:border-accent hover:text-accent",
                    newsFilter === f && "active border-accent bg-accent text-white"
                  )}>{f === "INFRASTRUCTURE" ? "Infra" : f}</button>
                ))}
              </div>
              <Button variant="ghost" className="text-[11px] font-semibold !text-accent">Full Feed →</Button>
            </div>
          </div>
          <div>
            {filteredNews.map((item, i) => (
              <div key={i} className={cn("cursor-pointer border-b border-border p-4 transition-colors last:border-none hover:bg-bg-hover", i % 2 === 0 ? "bg-bg-2" : "bg-bg-3")}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-y-1 text-[10px] font-semibold">
                    <NewsBadge color={item.catColor} className="mr-1.5">{item.cat}</NewsBadge>
                    <span className="font-semibold text-text-2">{item.country}</span>
                    {item.portfolioTag && (
                      <NewsBadge className="ml-1.5">{item.portfolioTag.split("·")[1].trim()}</NewsBadge>
                    )}
                  </div>
                  <span className="text-[10px] text-text-3">{item.time}</span>
                </div>
                <div className="mb-1 text-xs font-bold leading-snug text-text">{item.headline}</div>
                <div className="text-[11px] leading-relaxed text-text-2">{item.body}</div>
                {item.source && (
                  <div className="mt-2 text-[10px] italic text-text-3">Source: {item.source}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* NOTAMs Column */}
        <div className="border-r border-border">
          <div className="flex items-center justify-between border-b border-border bg-bg-3 p-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-warn" />
              <span className="font-display text-[13px] font-bold tracking-wide text-text">Today's Regional NOTAMs</span>
            </div>
            <Button variant="ghost" className="text-[11px] font-semibold !text-accent">Full List →</Button>
          </div>
          <div>
            {INSURER_NOTAMS.map((n, i) => (
              <NotamItem key={i} notam={n} isEven={i % 2 === 0} />
            ))}
          </div>
        </div>

        {/* Country Profiles Column */}
        <div>
          <div className="flex items-center justify-between border-b border-border bg-bg-3 p-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="font-display text-[13px] font-bold tracking-wide text-text">Regional Country Profiles</span>
            </div>
            <Button variant="ghost" className="text-[11px] font-semibold !text-accent">All →</Button>
          </div>
          <div>
            {INSURER_COUNTRIES.map((c, i) => (
              <div key={i} className={cn("flex cursor-pointer items-center gap-2.5 border-b border-border p-2.5 transition-colors last:border-none hover:bg-bg-hover", i % 2 === 0 ? "bg-bg-2" : "bg-bg-3")}>
                <img src={`https://flagcdn.com/w40/${c.iso}.png`} width="28" height="20" className="shrink-0 rounded-sm object-cover shadow-md" alt={`${c.name} flag`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-text">{c.name}</div>
                  <div className="mt-px text-[10px] font-bold" style={{ color: c.riskColor }}>{c.risk} Risk</div>
                </div>
                <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 stroke-text-3 stroke-2" fill="none"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aviation Safety Pane */}
      <div className={cn(tab === "safety" ? "block" : "hidden")}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-bg-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded border border-danger/30 bg-danger-dim px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-danger">ASN Data</span>
            <span className="text-xs text-text-3">Aviation Safety Network — East Africa & Horn of Africa</span>
          </div>
          <div className="flex gap-1 rounded-md bg-bg p-0.5">
            <button onClick={() => setAsnTab("recent")} className={cn("rounded px-3 py-1 text-[11px] font-semibold", asnTab === "recent" ? "bg-accent text-white" : "bg-transparent text-text-2")}>Recent</button>
            <button onClick={() => setAsnTab("historic")} className={cn("rounded px-3 py-1 text-[11px] font-semibold", asnTab === "historic" ? "bg-accent text-white" : "bg-transparent text-text-2")}>Historic</button>
          </div>
        </div>
        {/* Recent Incidents */}
        <div className={cn("overflow-x-auto", asnTab === "recent" ? "block" : "hidden")}>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-bg-3">
                {["Date", "Callsign", "Aircraft", "Operator", "Fatalities", "Description"].map(h => <th key={h} className="border-b border-border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-text-2">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {ASN_RECENT_INCIDENTS.map((inc, i) => (
                <tr key={i} className={cn("cursor-default", i % 2 === 0 ? "bg-bg-2" : "bg-bg-3")}>
                  <td className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-text">{inc.date}</td>
                  <td className="whitespace-nowrap border-b border-border px-3 py-2 font-mono font-bold text-accent">{inc.cs}</td>
                  <td className="border-b border-border px-3 py-2 text-text-2">{inc.ac}</td>
                  <td className="border-b border-border px-3 py-2 text-text-2">{inc.op}</td>
                  <td className="whitespace-nowrap border-b border-border px-3 py-2 font-bold" style={{ color: inc.fat > 0 ? "var(--danger)" : "var(--success)" }}>{inc.fat > 0 ? inc.fat : "None"}</td>
                  <td className="max-w-xs truncate border-b border-border px-3 py-2 text-text-2" title={inc.desc}>{inc.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Historic Incidents */}
        <div className={cn(asnTab === "historic" ? "block" : "hidden")}>
           <div className="flex flex-wrap items-center gap-3 border-b border-border bg-bg-3 p-2">
             <div className="relative flex-1">
                <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 stroke-text-3" viewBox="0 0 24 24" fill="none" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  className="w-full rounded-md border border-border-2 bg-bg py-1.5 pl-8 pr-3 text-xs"
                  placeholder="Search historic incidents..."
                  value={asnSearch}
                  onChange={(e) => setAsnSearch(e.target.value)}
                />
             </div>
             <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-text-2">
               <input type="checkbox" className="cursor-pointer accent-danger" checked={asnFatalOnly} onChange={(e) => setAsnFatalOnly(e.target.checked)} />
               Fatalities only
             </label>
           </div>
           <div className="max-h-[340px] overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="sticky top-0 z-10 bg-bg-3">
                  {["Date", "Callsign", "Aircraft", "Operator", "Fatalities", "Description"].map(h => <th key={h} className="border-b border-border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-text-2">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredHistoricIncidents.map((inc, i) => (
                  <tr key={i} className={cn("cursor-default", i % 2 === 0 ? "bg-bg-2" : "bg-bg-3")}>
                    <td className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-text">{inc.date}</td>
                    <td className="whitespace-nowrap border-b border-border px-3 py-2 font-mono font-bold text-accent">{inc.cs}</td>
                    <td className="border-b border-border px-3 py-2 text-text-2">{inc.ac}</td>
                    <td className="border-b border-border px-3 py-2 text-text-2">{inc.op}</td>
                    <td className="whitespace-nowrap border-b border-border px-3 py-2 font-bold" style={{ color: inc.fat > 0 ? "var(--danger)" : "var(--success)" }}>{inc.fat > 0 ? inc.fat : "None"}</td>
                    <td className="max-w-xs truncate border-b border-border px-3 py-2 text-text-2" title={inc.desc}>{inc.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
           </div>
        </div>
      </div>
    </div>
  );
}