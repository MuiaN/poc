import { Card, DataTable, PageHeader, Badge, PanelHeader, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { policies } from "@/data";

export function Policies() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Policies"
        subtitle="Active and historical hull & liability policies across the portfolio"
        action={
          <Button variant="primary">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            New Policy
          </Button>
        }
      />
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
