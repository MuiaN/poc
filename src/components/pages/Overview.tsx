"use client";

import { KpiCard } from "@/components/ui";
import { Icon } from "@/components/icons";
import type { Role, SessionUser } from "@/lib/types";
import { KPI_DATA } from "@/data/overview";
import { WelcomeCard } from "@/data/WelcomeCard";
import { FleetByType } from "@/data/FleetByType";
import { LiveFlights } from "@/data/LiveFlights";
import { IntelligencePanel } from "@/data/IntelligencePanel";
import { AviationSafetyPanel } from "@/data/AviationSafetyPanel";

export function Overview({ user, role }: { user: SessionUser; role: Role }) {
  const isOp = role === "operator";

  return (
    <>
      {/* Top Strip */}
      <div className="top-strip">
        <WelcomeCard name={user.name} role={role} />
        {!isOp &&
          <KpiCard
            {...KPI_DATA.policies}
            tone="amber"
            icon={<svg className="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
            valueClassName="text-warn"
            subClassName="text-warn font-semibold"
            sub={KPI_DATA.policies.sub}
          />
        }
        <KpiCard
          {...KPI_DATA.aircraft}
          tone="blue"
          icon={<Icon name={KPI_DATA.aircraft.icon} className="h-[21px] w-[21px]" />}
          value={isOp ? KPI_DATA.aircraft.valueOp : KPI_DATA.aircraft.value}
          label={isOp ? KPI_DATA.aircraft.labelOp : KPI_DATA.aircraft.label}
          sub={isOp ? KPI_DATA.aircraft.subOp : KPI_DATA.aircraft.sub}
          subClassName={isOp ? "text-accent font-semibold" : ""}
        />
        <KpiCard
          {...KPI_DATA.flights}
          tone="green"
          icon={<svg className="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>}
          value={isOp ? KPI_DATA.flights.valueOp : KPI_DATA.flights.value}
          sub="Live Now"
          subClassName="text-success font-semibold"
        />
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        <div className="flex flex-col gap-3.5">
          <FleetByType role={role} />
          <LiveFlights role={role} />
          {!isOp && <IntelligencePanel />}
          <AviationSafetyPanel />
        </div>
      </div>
    </>
  );
}
