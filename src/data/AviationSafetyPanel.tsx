"use client";

import { useMemo } from "react";
import { useState } from "react";
import { cn } from "@/components/ui";
import {
  ASN_RECENT_INCIDENTS,
  ASN_HISTORIC_INCIDENTS,
} from "@/data/overview";

type ASNTab = "recent" | "historic";

export function AviationSafetyPanel() {
  const [asnTab, setAsnTab] = useState<"recent" | "historic">("recent");
  const [asnSearch, setAsnSearch] = useState("");
  const [asnFatalOnly, setAsnFatalOnly] = useState(false);

  const filteredHistoricIncidents = useMemo(() => {
    return ASN_HISTORIC_INCIDENTS.filter((inc) => {
      const matchesSearch = asnSearch
        ? Object.values(inc).some((val) =>
            String(val).toLowerCase().includes(asnSearch.toLowerCase())
          )
        : true;
      const matchesFatal = asnFatalOnly ? inc.fat > 0 : true;
      return matchesSearch && matchesFatal;
    });
  }, [asnSearch, asnFatalOnly]);

  return (
    <div className="panel">
      {/* Aviation Safety Pane */}
      <div className="block">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-bg-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded border border-danger/30 bg-danger-dim px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-danger">
              ASN Data
            </span>
            <span className="text-xs text-text-3">
              Aviation Safety Network — East Africa & Horn of Africa
            </span>
          </div>
          <div className="flex gap-1 rounded-md bg-bg p-0.5">
            <button
              onClick={() => setAsnTab("recent")}
              className={`asn-tab-btn ${asnTab === "recent" ? "active" : ""}`}
            >
              Recent
            </button>
            <button
              onClick={() => setAsnTab("historic")}
              className={`asn-tab-btn ${asnTab === "historic" ? "active" : ""}`}
            >
              Historic
            </button>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className={asnTab === "recent" ? "block" : "hidden"}>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-bg-3">
                {["Date", "Callsign", "Aircraft", "Operator", "Fatalities", "Description"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-text-2"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASN_RECENT_INCIDENTS.map((inc, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-bg-2" : "bg-bg-3"}>
                  <td className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-text">
                    {inc.date}
                  </td>
                  <td className="whitespace-nowrap border-b border-border px-3 py-2 font-mono font-bold text-accent">
                    {inc.cs}
                  </td>
                  <td className="border-b border-border px-3 py-2 text-text-2">{inc.ac}</td>
                  <td className="border-b border-border px-3 py-2 text-text-2">{inc.op}</td>
                  <td
                    className="whitespace-nowrap border-b border-border px-3 py-2 font-bold"
                    style={{
                      color: inc.fat > 0 ? "var(--danger)" : "var(--success)",
                    }}
                  >
                    {inc.fat > 0 ? inc.fat : "None"}
                  </td>
                  <td
                    className="max-w-xs truncate border-b border-border px-3 py-2 text-text-2"
                    title={inc.desc}
                  >
                    {inc.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Historic Incidents */}
        <div className={asnTab === "historic" ? "block" : "hidden"}>
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-bg-3 px-4 py-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 stroke-text-3"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="w-full rounded-md border border-border-2 bg-bg py-1.5 pl-8 pr-3 text-xs"
                placeholder="Search historic incidents..."
                value={asnSearch}
                onChange={(e) => setAsnSearch(e.target.value)}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-text-2">
              <input
                type="checkbox"
                className="cursor-pointer accent-danger"
                checked={asnFatalOnly}
                onChange={(e) => setAsnFatalOnly(e.target.checked)}
              />
              Fatalities only
            </label>
          </div>
          <div className="max-h-[340px] overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="sticky top-0 z-10 bg-bg-3">
                  {["Date", "Callsign", "Aircraft", "Operator", "Fatalities", "Description"].map(
                    (h) => (
                      <th
                        key={h}
                        className="border-b border-border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-text-2"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredHistoricIncidents.map((inc, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-bg-2" : "bg-bg-3"}>
                    <td className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-text">
                      {inc.date}
                    </td>
                    <td className="whitespace-nowrap border-b border-border px-3 py-2 font-mono font-bold text-accent">
                      {inc.cs}
                    </td>
                    <td className="border-b border-border px-3 py-2 text-text-2">{inc.ac}</td>
                    <td className="border-b border-border px-3 py-2 text-text-2">{inc.op}</td>
                    <td
                      className="whitespace-nowrap border-b border-border px-3 py-2 font-bold"
                      style={{
                        color: inc.fat > 0 ? "var(--danger)" : "var(--success)",
                      }}
                    >
                      {inc.fat > 0 ? inc.fat : "None"}
                    </td>
                    <td
                      className="max-w-xs truncate border-b border-border px-3 py-2 text-text-2"
                      title={inc.desc}
                    >
                      {inc.desc}
                    </td>
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