import { useMemo } from "react";
import { useState } from "react";
import { Button, cn, PanelHeader } from "@/components/ui";
import {
  INSURANCE_NEWS_ITEMS,
  INSURER_NOTAMS,
  INSURER_COUNTRIES,
} from "@/data/overview";
import { NewsBadge } from "@/components/NewsBadge";
import { NotamItem } from "@/components/NotamItem";

type NewsFilter = "ALL" | "WEATHER" | "SECURITY" | "REGULATION" | "INFRASTRUCTURE";

export function IntelligencePanel() {
  const [newsFilter, setNewsFilter] = useState<"ALL" | "WEATHER" | "SECURITY" | "REGULATION" | "INFRASTRUCTURE">("ALL");

  const filteredNews = useMemo(() => {
    if (newsFilter === "ALL") return INSURANCE_NEWS_ITEMS;
    return INSURANCE_NEWS_ITEMS.filter((item) => item.cat === newsFilter);
  }, [newsFilter]);

  return (
    <div className="panel">
      {/* Panel Header */}
      <PanelHeader
        title="Intelligence"
        action={<Button variant="ghost" className="text-[11px] font-semibold !text-accent">Full Feed →</Button>}
      />

      {/* Intelligence Pane */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 220px' }}>
        {/* News Column */}
        <div className="border-r border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-3 p-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-display text-[13px] font-bold tracking-wide text-text">Today's Risk Intelligence</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["ALL", "WEATHER", "SECURITY", "REGULATION", "INFRASTRUCTURE"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setNewsFilter(f)}
                  className={`intel-filter-btn ${newsFilter === f ? "active" : ""}`}
                >
                  {f === "INFRASTRUCTURE" ? "Infra" : f}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3">
            {INSURANCE_NEWS_ITEMS.map((item, i) => (
              <div key={i} className={`cursor-pointer border-b border-border p-4 transition-colors last:border-none hover:bg-bg-hover ${i % 2 === 0 ? "bg-bg-2" : "bg-bg-3"}`}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-y-1 text-[10px] font-semibold">
                    <span className={`mr-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${item.catColor}`}>{item.cat}</span>
                    <span className="font-semibold text-text-2">{item.country}</span>
                    {item.portfolioTag && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-accent-dim text-accent">{item.portfolioTag.split("·")[1].trim()}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-3">{item.time}</span>
                </div>
                <div className="mb-1 text-xs font-bold leading-snug">{item.headline}</div>
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
              <span className="h-1.5 w-1.5 rounded-full bg-warn" />
              <span className="font-display text-[13px] font-bold tracking-wide text-text">Today's Regional NOTAMs</span>
            </div>
            <span className="text-[11px] font-semibold text-accent">Full List →</span>
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
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="font-display text-[13px] font-bold tracking-wide text-text">Regional Country Profiles</span>
            </div>
            <span className="text-[11px] font-semibold text-accent">All →</span>
          </div>
          <div>
            {INSURER_COUNTRIES.map((c, i) => (
              <div
                key={i}
                className={`flex cursor-pointer items-center gap-2.5 border-b border-border transition-colors last:border-none hover:bg-bg-hover ${i % 2 === 0 ? "bg-bg-2" : "bg-bg-3"}`}
                style={{ padding: "10px 14px" }}
              >
                <img
                  src={`https://flagcdn.com/w40/${c.iso}.png`}
                  width="28"
                  height="20"
                  className="shrink-0 rounded-sm object-cover"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,.15)" }}
                  alt={`${c.name} flag`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-bold text-text">{c.name}</div>
                  <div className="mt-px text-[10px] font-bold" style={{ color: c.riskColor }}>
                    {c.risk} Risk
                  </div>
                </div>
                <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="var(--text-3)" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}