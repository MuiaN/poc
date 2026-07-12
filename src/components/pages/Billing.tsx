import { Card, PageHeader, Badge, PanelHeader, KpiCard } from "@/components/ui";
import { Icon } from "@/components/icons";

const INVOICES = [
  { id: "INV-2026-0091", desc: "FRED BLACK Platform — Monthly Subscription", amount: "$4,500.00", date: "2026-07-01", status: "paid" },
  { id: "INV-2026-0078", desc: "FRED BLACK Platform — Monthly Subscription", amount: "$4,500.00", date: "2026-06-01", status: "paid" },
  { id: "INV-2026-0065", desc: "FRED BLACK Platform — Monthly Subscription", amount: "$4,500.00", date: "2026-05-01", status: "paid" },
  { id: "INV-2026-0052", desc: "Additional Analyst Seats (×2)", amount: "$900.00", date: "2026-04-14", status: "overdue" },
];

export function Billing() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Billing" subtitle="Subscription plan, usage and invoice history" />

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3">
        <KpiCard icon={<Icon name="billing" width={22} height={22} />} tone="blue" label="Current Plan" value="Enterprise" sub="Renews 2026-08-01" />
        <KpiCard icon={<Icon name="users" width={22} height={22} />} tone="green" label="Seats Used" value="14 / 20" sub="6 seats available" />
        <KpiCard icon={<Icon name="claims" width={22} height={22} />} tone="amber" label="Next Invoice" value="$4,500" sub="Due 2026-08-01" />
      </div>

      <Card>
        <PanelHeader title="Invoice History" />
        <div className="divide-y divide-border">
          {INVOICES.map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold text-text">{inv.desc}</div>
                <div className="mt-0.5 text-[11px] text-text-3">
                  {inv.id} · {inv.date}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12.5px] font-semibold text-text">{inv.amount}</span>
                <Badge tone={inv.status === "paid" ? "success" : "danger"}>{inv.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
