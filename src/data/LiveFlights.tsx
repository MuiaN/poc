"use client";

import { useState } from "react";
import { PanelHeader, cn } from "@/components/ui"; 
import type { Role } from "@/lib/types";
import { FLIGHTS_DATA, INSURER_CLIENTS } from "@/data/overview";
import { AirlineDot } from "@/components/AirlineDot";
import { AirportLink } from "@/components/AirportLink";

type FlightClientFilter = "ALL" | string;

export function LiveFlights({ role }: { role: Role }) {
  const isOp = role === "operator";
  const [filter, setFilter] = useState<FlightClientFilter>("ALL");

  const flights = isOp
    ? FLIGHTS_DATA.filter((f) => f.client === "Kenya Airways")
    : filter === "ALL"
      ? FLIGHTS_DATA
      : FLIGHTS_DATA.filter((f) => f.client === filter);

  const flightsToShow = flights.slice(0, 10);

  return (
    <div className="panel">
      <PanelHeader
        title={
          <div className="flex items-center gap-2">
            <span className="phdr-title">{isOp ? "My Flights (KQ)" : "Live Client Flights"}</span>
            <span className="rounded border border-success/30 bg-success-dim px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-success">
              Live
            </span>
          </div>
        }
        action={<button className="text-[11px] font-semibold text-accent hover:underline">Open Map View →</button>}
      />

      {/* INSURER: client filter bar */}
      {!isOp && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-bg-3 px-3.5 py-2">
          <span className="mr-1 text-[11px] font-semibold text-text-2">Airline:</span>
          <button onClick={() => setFilter("ALL")} className={cn("cnf-btn bg-bg-3", filter === "ALL" && "active bg-accent")}>
            All
          </button> 
          {INSURER_CLIENTS.map((c) => (
            <button key={c.iata} onClick={() => setFilter(c.name)} className={cn("cnf-btn bg-bg-3", filter === c.name && "active bg-accent")}>
              <AirlineDot color={c.color} spacing="4px" />
              {c.iata}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-text-3">{flights.length} flights</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="ftable">
          <thead>
            <tr>
              <th>Flight</th>
              {!isOp && <th>Airline</th>}
              <th>Aircraft</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>ETA</th>
            </tr>
          </thead>
          <tbody>
            {flightsToShow.map((f) => (
              <tr key={f.id}>
                <td className="fid">{f.id}</td>
                {!isOp && ( 
                  <td className="whitespace-nowrap font-semibold text-text">
                    <AirlineDot color={INSURER_CLIENTS.find((c) => c.name === f.client)?.color ?? "var(--text-3)"} spacing="5px" />
                    {f.client}
                  </td>
                )}
                <td className="text-text-2">{f.ac}</td>
                <td><AirportLink icao={f.fr} /></td>
                <td><AirportLink icao={f.to} /></td>
                <td>
                  <span
                    className={cn(
                      "inline-block rounded px-2.5 py-1 text-[10px] font-bold",
                      f.status === "En Route" ? "bg-success-dim text-success" : "bg-bg-3 text-text-3",
                    )}
                  >
                    {f.status}
                  </span>
                </td>
                <td className="font-semibold">{f.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {flights.length > 10 && (
        <div className="border-t border-border p-2.5 text-center">
          <button className="text-[12px] font-semibold text-accent hover:underline">
            {`Showing 10 of ${flights.length} active flights — View all flights →`}
          </button>
        </div>
      )}
    </div>
  );
}