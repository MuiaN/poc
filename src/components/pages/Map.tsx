import { Card, DataTable, PageHeader, Badge, PanelHeader } from "@/components/ui";
import { liveFlights } from "@/data";
import type { Role } from "@/lib/types";

function tone(status?: string): "success" | "warn" | "danger" | "info" {
  const s = (status ?? "").toLowerCase();
  if (s.includes("scheduled") || s.includes("en route") || s.includes("on time")) return "success";
  if (s.includes("delay")) return "warn";
  if (s.includes("cancel")) return "danger";
  return "info";
}

export function MapPage({ role }: { role: Role }) {
  const flights = role === "operator" ? liveFlights.slice(0, 25) : liveFlights;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Live Map" subtitle="Flight positions and schedule status across the tracked network" />

      <Card className="flex h-[280px] items-center justify-center border-dashed bg-bg-3 text-center">
        <div>
          <div className="text-[13px] font-semibold text-text-2">Interactive map coming soon</div>
          <div className="mt-1 text-[11.5px] text-text-3">The flight list below reflects the same live scheduling data.</div>
        </div>
      </Card>

      <Card>
        <PanelHeader title={`${flights.length} Flights`} />
        <div className="overflow-x-auto">
          <DataTable columns={["Flight", "Operator", "Aircraft", "Origin", "Destination", "Status", "Progress"]}>
            {flights.map((f, i) => (
              <tr key={i} className="border-b border-border last:border-none hover:bg-bg-hover">
                <td className="px-3.5 py-2.5 font-mono text-[12px] font-semibold text-accent">
                  {f.ident_iata ?? f.ident ?? "—"}
                </td>
                <td className="px-3.5 py-2.5 text-text">{f.operator ?? "—"}</td>
                <td className="px-3.5 py-2.5 text-text-2">{f.aircraft_type ?? "—"}</td>
                <td className="px-3.5 py-2.5 text-text">{f.origin?.code_iata ?? f.origin?.city ?? "—"}</td>
                <td className="px-3.5 py-2.5 text-text">{f.destination?.code_iata ?? f.destination?.city ?? "—"}</td>
                <td className="px-3.5 py-2.5">
                  <Badge tone={tone(f.status)}>{f.status ?? "unknown"}</Badge>
                </td>
                <td className="px-3.5 py-2.5 text-text-2">{f.progress_percent != null ? `${f.progress_percent}%` : "—"}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      </Card>
    </div>
  );
}
