"use client";

import { KpiCard, PanelHeader } from "@/components/ui";
import { Icon } from "@/components/icons";
import type { Role, SessionUser } from "@/lib/types";
import { KPI_DATA } from "@/data/overview";
import { WelcomeCard } from "../../data/WelcomeCard";
import { FleetByType } from "../../data/FleetByType";

export function Overview({ user, role }: { user: SessionUser; role: Role }) {
  const isOp = role === "operator";

  return (
    <>
      {/* Top Strip */}
      <div className="top-strip">
        <WelcomeCard name={user.name} role={role} />
        {!isOp && <KpiCard {...KPI_DATA.policies} icon={<Icon name={KPI_DATA.policies.icon} />} />}
        <KpiCard
          {...KPI_DATA.aircraft}
          icon={<Icon name={KPI_DATA.aircraft.icon} />}
          value={isOp ? KPI_DATA.aircraft.valueOp : KPI_DATA.aircraft.value}
          label={isOp ? KPI_DATA.aircraft.labelOp : KPI_DATA.aircraft.label}
          sub={isOp ? KPI_DATA.aircraft.subOp : KPI_DATA.aircraft.sub}
        />
        <KpiCard
          {...KPI_DATA.flights}
          icon={<Icon name={KPI_DATA.flights.icon} />}
          value={isOp ? KPI_DATA.flights.valueOp : KPI_DATA.flights.value}
        />
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        <div className="flex flex-col gap-3.5">
          <FleetByType role={role} />
          {/* Placeholder for Live Flights table */}
          <div className="panel">
            <PanelHeader title={isOp ? "My Flights (KQ)" : "Live Client Flights"} action={<button className="text-[11px] font-semibold text-accent hover:underline">Open Map View →</button>} />
            <div className="p-8 text-center text-sm text-text-3">Live Flights component coming soon...</div>
          </div>
          {/* Placeholder for role-specific panels */}
          <div className="panel">
            <PanelHeader title={isOp ? "Your Operational Updates" : "Intelligence / Safety"} />
            <div className="p-8 text-center text-sm text-text-3">Intelligence panel component coming soon...</div>
          </div>
        </div>
      </div>
    </>
  );
}
