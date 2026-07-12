import { Card, DataTable, PageHeader, Badge, PanelHeader } from "@/components/ui";
import { policies } from "@/data";

export function Policies() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Policies" subtitle="Active and historical hull & liability policies across the portfolio" />
      <Card>
        <PanelHeader title={`${policies.length} Policies`} />
        <div className="overflow-x-auto">
          <DataTable columns={["Policy ID", "Client", "Aircraft", "Coverage", "Period", "Expires In", "Status"]}>
            {policies.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-none hover:bg-bg-hover">
                <td className="px-3.5 py-2.5 font-mono text-[12px] font-semibold text-accent">{p.id}</td>
                <td className="px-3.5 py-2.5 text-text">{p.client}</td>
                <td className="px-3.5 py-2.5 text-text">{p.ac}</td>
                <td className="px-3.5 py-2.5 text-text">{p.cov}</td>
                <td className="px-3.5 py-2.5 text-text-2">{p.period}</td>
                <td className="px-3.5 py-2.5 text-text-2">{p.expiry}</td>
                <td className="px-3.5 py-2.5">
                  <Badge tone={p.status === "Active" ? "success" : "warn"}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      </Card>
    </div>
  );
}
