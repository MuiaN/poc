import { Card, DataTable, PageHeader, Badge, PanelHeader } from "@/components/ui";
import { fleet, operators } from "@/data";
import type { Role } from "@/lib/types";

function statusTone(status: string): "success" | "warn" | "danger" | "info" {
  if (status === "active") return "success";
  if (status === "maintenance") return "warn";
  if (status === "grounded") return "danger";
  return "info";
}

function riskTone(risk: number) {
  if (risk <= 6) return { label: "Low", cls: "text-success bg-success-dim" };
  if (risk <= 8) return { label: "Moderate", cls: "text-warn bg-warn-dim" };
  if (risk <= 10) return { label: "High", cls: "text-[#f97316] bg-[rgba(249,115,22,.12)]" };
  return { label: "Extreme", cls: "text-danger bg-danger-dim" };
}

export function Fleet({ role }: { role: Role }) {
  const rows = role === "operator" ? fleet.filter((a) => a.op === "KQ") : fleet;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Fleet Register"
        subtitle={
          role === "operator"
            ? "Aircraft operated by Kenya Airways under FRED BLACK coverage"
            : "Aircraft under management across all client operators"
        }
      />

      <Card>
        <PanelHeader title={`${rows.length} Aircraft`} />
        <div className="overflow-x-auto">
          <DataTable
            columns={["Registration", "Type", "Operator", "Mfg Yr", "Hours / Cycles", "Status", "Next Maint.", "Policy Expiry", "Risk"]}
          >
            {rows.map((a) => {
              const rt = riskTone(a.risk);
              return (
                <tr key={a.reg} className="border-b border-border last:border-none hover:bg-bg-hover">
                  <td className="px-3.5 py-2.5 font-mono text-[12px] font-bold tracking-wide text-accent">{a.reg}</td>
                  <td className="px-3.5 py-2.5">
                    <div className="font-semibold text-text">{a.short}</div>
                    <div className="text-[10.5px] text-text-3">{a.engines}</div>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                      style={{ background: operators[a.op]?.bg, color: operators[a.op]?.color }}
                    >
                      {operators[a.op]?.name ?? a.op}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-text">{a.yr}</td>
                  <td className="px-3.5 py-2.5">
                    <div className="text-text">{a.hours.toLocaleString()} hrs</div>
                    <div className="text-[10px] text-text-3">{a.cycles.toLocaleString()} cycles</div>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-text">
                    {a.nextMaint}
                    <div className="text-[10px] text-text-3">{a.maintDays} days</div>
                  </td>
                  <td className="px-3.5 py-2.5 text-text">
                    {a.polExp}
                    <div className="text-[10px] text-text-3">{a.polDays} days</div>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold ${rt.cls}`}>
                      {a.risk} · {rt.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </div>
      </Card>
    </div>
  );
}
