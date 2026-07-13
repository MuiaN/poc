"use client";

import { Fragment, useState } from "react";
import { PanelHeader, cn } from "@/components/ui";
import { FLEET_BY_TYPE } from "@/data/overview";
import type { Role } from "@/lib/types";

export function FleetByType({ role }: { role: Role }) {
  const isOp = role === "operator";
  const totalAircraft = FLEET_BY_TYPE.reduce((sum, type) => sum + (isOp ? type.stats.cli.aircraft : type.stats.ins.aircraft), 0);

  return (
    <div className="panel">
      <PanelHeader
        title={
          <div className="flex items-center gap-2">
            <span className="phdr-title">{isOp ? "My Fleet by Type" : "Fleet by Aircraft Type"}</span>
            <span className="rounded-sm bg-accent-dim px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent">
              {totalAircraft} Aircraft
            </span>
          </div>
        }
        action={<button className="text-[11px] font-semibold text-accent hover:underline">Full Fleet Register →</button>}
      />
      {/* Headers */}
      <div className="fbt-header">
        <div /> {/* Spacer for chevron */}
        <div className="text-[8px] font-semibold uppercase tracking-wider text-text-3">Type</div>
        <div className="text-center text-[8px] font-semibold uppercase tracking-wider text-text-3">Aircraft</div>
        <div className="text-center text-[8px] font-semibold uppercase tracking-wider text-text-3">Active</div>
        <div className="text-center text-[8px] font-semibold uppercase tracking-wider text-text-3">AOG</div>
      </div>

      {FLEET_BY_TYPE.map((type) => (
        <FleetTypeRow key={type.id} type={type} role={role} />
      ))}
    </div>
  );
}

function FleetTypeRow({ type, role }: { type: (typeof FLEET_BY_TYPE)[number]; role: Role }) {
  const [open, setOpen] = useState(false);
  const isOp = role === "operator";
  const stats = isOp ? type.stats.cli : type.stats.ins;
  const aircraft = isOp ? type.aircraft.filter((a) => a.op === "Kenya Airways") : type.aircraft;

  // Hide row entirely if operator has no aircraft of this type
  if (isOp && stats.aircraft === 0) {
    return null
  }

  return (
    <>
      <div className="fbt-type-row" onClick={() => setOpen((v) => !v)}>
        <svg className={cn("fbt-chevron", open && "open")} viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <div>
          <div className="fbt-type-name">{type.name}</div>
          <div className="fbt-type-sub">{type.sub}</div>
        </div>
        <div className="fbt-stat text-center">
          <div className="fbt-stat-val">{stats.aircraft}</div>
          <div className="fbt-stat-lbl">Aircraft</div>
        </div>
        <div className="fbt-stat text-center">
          <div className="fbt-stat-val text-success">{stats.active}</div>
          <div className="fbt-stat-lbl">Active</div>
        </div>
        <div className="fbt-stat text-center">
          <div className={cn("fbt-stat-val", stats.aog > 0 ? "text-danger" : "text-text-3")}>{stats.aog}</div>
          <div className="fbt-stat-lbl">AOG</div>
        </div>
      </div>
      {open && (
        <div className="fbt-aircraft-table open">
          <div className="overflow-x-auto">
            <table className="fbt-at">
              <thead>
                <tr>
                  <th>Registration</th>
                  <th>Type</th>
                  <th>MSN</th>
                  <th>Year</th>
                  <th>Hours</th>
                  <th>Cycles</th>
                  <th>Last C-Check</th>
                  <th>Next Check Due</th>
                  {!isOp && <th>Operator</th>}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {aircraft.map((ac) => (
                  <tr key={ac.reg}>
                    <td>{ac.reg}</td>
                    <td>{ac.type}</td>
                    <td>{ac.msn}</td>
                    <td>{ac.year}</td>
                    <td>{ac.hours.toLocaleString()}</td>
                    <td>{ac.cycles.toLocaleString()}</td>
                    <td>{ac.lastCheck}</td>
                    <td>{ac.nextCheck}</td>
                    {!isOp && <td>{ac.op}</td>}
                    <td><span className={cn("fbt-status", ac.status)}>{ac.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
