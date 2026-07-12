import { Card, DataTable, PageHeader, Badge, PanelHeader, KpiCard, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { claims } from "@/data";

function tone(status: string): "success" | "warn" | "danger" | "info" {
  if (status === "open") return "danger";
  if (status === "review") return "warn";
  if (status === "settled") return "success";
  return "info";
}

export function Claims() {
  const open = claims.filter((c) => c.status === "open").length;
  const review = claims.filter((c) => c.status === "review").length;
  const settled = claims.filter((c) => c.status === "settled").length;
  const total = claims.reduce((s, c) => s + Number(c.amount.replace(/[^0-9.]/g, "") || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Claims Management"
        action={
          <Button variant="primary">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            New Claim
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard icon={<Icon name="claims" width={22} height={22} />} tone="amber" label="Open Claims" value={String(open)} sub="Awaiting resolution" />
        <KpiCard icon={<Icon name="overview" width={22} height={22} />} tone="blue" label="Pending Review" value={String(review)} sub="Awaiting underwriter" />
        <KpiCard icon={<Icon name="policies" width={22} height={22} />} tone="green" label="Settled" value={String(settled)} sub="Closed claims" />
        <KpiCard icon={<Icon name="billing" width={22} height={22} />} tone="red" label="Total Value" value={`$${(total / 1000).toFixed(0)}K`} sub="Across all claims" />
      </div>

      <Card>
        <PanelHeader title="All Claims" />
        <div className="overflow-x-auto">
          <DataTable columns={["Claim ID", "Policy", "Operator", "Aircraft Type", "Claim Type", "Amount", "Status", "Filed", "Handler"]}>
            {claims.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-none hover:bg-bg-hover">
                <td className="px-3.5 py-2.5 font-mono text-[12px] font-semibold text-accent">{c.id}</td>
                <td className="px-3.5 py-2.5 text-text">{c.policy}</td>
                <td className="px-3.5 py-2.5 text-text">{c.operator}</td>
                <td className="px-3.5 py-2.5 text-text">{c.aircraft}</td>
                <td className="px-3.5 py-2.5 text-text">{c.type}</td>
                <td className="px-3.5 py-2.5 font-semibold text-text">{c.amount}</td>
                <td className="px-3.5 py-2.5">
                  <Badge tone={tone(c.status)}>{c.status}</Badge>
                </td>
                <td className="px-3.5 py-2.5 text-text-2">{c.filed}</td>
                <td className="px-3.5 py-2.5 text-text-2">{c.handler}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      </Card>
    </div>
  );
}
