"use client";

import { useMemo, useState } from "react";
import { Card, PageHeader, Badge, PanelHeader } from "@/components/ui";

type Notam = {
  loc: string;
  num: string;
  cls: "International" | "Military";
  start: string;
  end: string;
  cond: string;
};

const NOTAMS: Notam[] = [
  { loc: "HKJK", num: "A0063/26", cls: "International", start: "05/14/2026 0001", end: "05/27/2026 2359", cond: "TRIGGER NOTAM - AIRAC AIP SUP 21/26 WEF 14 MAY 2026. JOMO KENYATTA INTERNATIONAL AIRPORT RADAR MINIMUM TERRAIN CLEARANCE CHART" },
  { loc: "HDAM", num: "M0037/26", cls: "Military", start: "05/09/2026 1000", end: "05/09/2026 1600", cond: "AERODROME SINGLE MILITARY AIRCRAFT WILL BE PERFORMING MULTIPLE PASSES OF HIGH-ALTITUDE AIRDROPS AT KATHERINE DZ. ALL TRAFFIC IS ADVISED TO AVOID THIS AIRSPACE." },
  { loc: "HUEN", num: "A0056/26", cls: "International", start: "05/07/2026 0000", end: "05/10/2026 2359", cond: "RWY 12/30 WIP REF: AIP UGANDA AD 2-HUEN-2-1(22 JAN 26)" },
  { loc: "HKJK", num: "A0082/26", cls: "International", start: "05/05/2026 1300", end: "05/19/2026 0800EST", cond: "PRESENCE OF LOOSE DEBRIS BEHIND BAY F3. ALL ACFT PCD TO BAY F3-F9 TO SHUT DOWN ENGINES BEHIND BAY F2 FOR TOWING." },
  { loc: "HAAB", num: "A0146/26", cls: "International", start: "05/05/2026 0830", end: "06/06/2026 0900", cond: "AERODROME FUEL SERVICE LIMITATION: MAX 20,000 LITERS PER FLIGHT FOR SCHEDULED OPERATORS. JET FUEL NOT AVAILABLE FOR CHARTER FLIGHTS." },
  { loc: "HRYR", num: "A0036/26", cls: "International", start: "05/03/2026 0000", end: "07/31/2026 1200EST", cond: "MET RADIOSONDE BALLOON ASCENT — RADIUS OF 162NM. PILOTS ADVISED TO EXERCISE CAUTION FLYING THIS AREA." },
  { loc: "HTDA", num: "A0089/26", cls: "International", start: "05/02/2026 0400", end: "08/02/2026 1500EST", cond: "RWY 23 RESA GRADING WIP. PILOTS TO TAKE CAUTION DURING LANDING/TAKEOFF." },
  { loc: "HSSS", num: "A0030/26", cls: "International", start: "05/01/2026 0000", end: "05/31/2026 2359", cond: "DUE TO SECURITY REASONS NO ATC SERVICE AVAILABLE IN KHARTOUM FIR OVER SOUTH SUDAN ABOVE FL245. CONTINGENCY ROUTING IN EFFECT." },
  { loc: "HDAM", num: "M0034/26", cls: "Military", start: "04/29/2026 0808", end: "07/27/2026 2359", cond: "AERODROME BASH BIRD WATCH CONDITION MODERATE. REMAIN VIGILANT FOR MIGRATORY BIRD ACTIVITY." },
  { loc: "HCMM", num: "A0007/26", cls: "International", start: "02/05/2026 0000", end: "02/19/2026 2359EST", cond: "TWY F CLOSED FOR MAINTENANCE. NORTH RAMP ACCESS VIA TWY G." },
];

export function Notams() {
  const [filter, setFilter] = useState<"all" | "International" | "Military">("all");
  const rows = useMemo(() => NOTAMS.filter((n) => filter === "all" || n.cls === filter), [filter]);
  const intl = NOTAMS.filter((n) => n.cls === "International").length;
  const mil = NOTAMS.filter((n) => n.cls === "Military").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="NOTAMs"
        action={
          <div className="flex items-center gap-1.5">
            {(["all", "International", "Military"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-sm border px-3 py-1 text-[11px] font-semibold transition-colors ${
                  filter === f
                    ? f === "Military"
                      ? "border-warn bg-warn text-bg"
                      : "border-accent bg-accent text-white"
                    : "border-border-2 bg-bg-3 text-text-2 hover:border-accent hover:text-accent"
                }`}
              >
                {f === "all" ? `All (${intl + mil})` : f === "International" ? `International (${intl})` : `Military (${mil})`}
              </button>
            ))}
          </div>
        }
      />
      <Card>
        <PanelHeader title="Active Notices" />
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-[12.5px]">
            <thead>
              <tr>
                {["Location", "NOTAM #", "Class", "Start (UTC)", "End (UTC)", "Condition"].map((c) => (
                  <th key={c} className="whitespace-nowrap border-b border-r border-border bg-bg-3 px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-text-2 last:border-r-0">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((n, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-bg-2" : "bg-bg-3"}>
                  <td className="border-b border-r border-border px-2.5 py-2 font-semibold text-text">{n.loc}</td>
                  <td className="border-b border-r border-border px-2.5 py-2 font-mono text-accent">{n.num}</td>
                  <td className="border-b border-r border-border px-2.5 py-2">
                    <Badge tone={n.cls === "Military" ? "warn" : "info"}>{n.cls}</Badge>
                  </td>
                  <td className="whitespace-pre-line border-b border-r border-border px-2.5 py-2 text-text-2">{n.start}</td>
                  <td className="whitespace-pre-line border-b border-r border-border px-2.5 py-2 text-text-2">{n.end}</td>
                  <td className="whitespace-pre-wrap border-b border-border px-2.5 py-2 text-text">{n.cond}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
