import { Card, KpiCard, PageHeader, Badge, PanelHeader } from "@/components/ui";
import { Icon } from "@/components/icons";
import { fleet, claims, policies, liveFlights, operators } from "@/data";
import type { Role } from "@/lib/types";

function statusTone(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = status.toLowerCase();
  if (s.includes("active") || s.includes("on time") || s.includes("landed")) return "success";
  if (s.includes("maint") || s.includes("delay") || s.includes("review")) return "warn";
  if (s.includes("ground") || s.includes("cancel") || s.includes("open")) return "danger";
  return "info";
}

export function Overview({ role }: { role: Role }) {
  const scopedFleet = role === "operator" ? fleet.filter((a) => a.op === "KQ") : fleet;
  const activeCount = scopedFleet.filter((a) => a.status === "active").length;
  const maintCount = scopedFleet.filter((a) => a.status === "maintenance").length;
  const avgRisk = (scopedFleet.reduce((s, a) => s + a.risk, 0) / (scopedFleet.length || 1)).toFixed(1);
  const openClaims = claims.filter((c) => c.status === "open").length;
  const activePolicies = policies.filter((p) => p.status === "Active").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Overview"
        subtitle={
          role === "operator"
            ? "Live status for the Kenya Airways fleet and network"
            : "Portfolio-wide risk, fleet, and claims snapshot across Eastern Africa"
        }
      />

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard
          icon={<Icon name="fleet" width={22} height={22} />}
          tone="blue"
          label="Aircraft Tracked"
          value={String(scopedFleet.length)}
          sub={`${activeCount} active`}
        />
        <KpiCard
          icon={<Icon name="notams" width={22} height={22} />}
          tone="amber"
          label="In Maintenance"
          value={String(maintCount)}
          sub="Scheduled or unscheduled"
        />
        {role !== "operator" && (
          <KpiCard
            icon={<Icon name="claims" width={22} height={22} />}
            tone="red"
            label="Open Claims"
            value={String(openClaims)}
            sub="Awaiting resolution"
          />
        )}
        {role !== "operator" ? (
          <KpiCard
            icon={<Icon name="policies" width={22} height={22} />}
            tone="green"
            label="Active Policies"
            value={String(activePolicies)}
            sub={`of ${policies.length} total`}
          />
        ) : (
          <KpiCard
            icon={<Icon name="map" width={22} height={22} />}
            tone="green"
            label="Flights Today"
            value={String(liveFlights.length)}
            sub="Across tracked network"
          />
        )}
        <KpiCard
          icon={<Icon name="countries" width={22} height={22} />}
          tone="amber"
          label="Avg. Risk Score"
          value={avgRisk}
          sub="0 (low) – 15 (extreme)"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <PanelHeader title="Fleet Status" />
          <div className="divide-y divide-border">
            {scopedFleet.slice(0, 8).map((a) => (
              <div key={a.reg} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-bold tracking-wide text-accent">{a.reg}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: operators[a.op]?.bg, color: operators[a.op]?.color }}
                    >
                      {operators[a.op]?.name ?? a.op}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-text-3">{a.type}</div>
                </div>
                <Badge tone={statusTone(a.status)}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <PanelHeader title="Risk Snapshot" />
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-2">Highest risk aircraft</span>
              <span className="font-semibold text-danger">
                {scopedFleet.slice().sort((a, b) => b.risk - a.risk)[0]?.reg ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-2">Countries in scope</span>
              <span className="font-semibold text-text">12</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-2">Operators monitored</span>
              <span className="font-semibold text-text">{Object.keys(operators).length}</span>
            </div>
            <div className="mt-1 rounded-md border-l-[3px] border-warn bg-warn-dim px-3 py-2 text-[11.5px] leading-relaxed text-text">
              {role === "operator"
                ? "2 aircraft due for scheduled maintenance within 30 days."
                : "3 policies renew within the next 60 days — review underwriting terms."}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
