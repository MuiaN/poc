import { Card, PageHeader, Badge, PanelHeader, Button, DataTable } from "@/components/ui";

type Company = {
  name: string;
  type: "Insurer Ops" | "Operator";
  country: string;
  users: number;
  aircraft: number;
  status: "active" | "onboarding";
};

const COMPANIES: Company[] = [
  { name: "FRED BLACK", type: "Insurer Ops", country: "Kenya", users: 3, aircraft: 0, status: "active" },
  { name: "Kenya Airways", type: "Operator", country: "Kenya", users: 4, aircraft: 6, status: "active" },
  { name: "Ethiopian Airlines", type: "Operator", country: "Ethiopia", users: 2, aircraft: 5, status: "active" },
  { name: "RwandAir", type: "Operator", country: "Rwanda", users: 1, aircraft: 2, status: "onboarding" },
  { name: "Fly540", type: "Operator", country: "Kenya", users: 1, aircraft: 2, status: "active" },
  { name: "Uganda Airlines", type: "Operator", country: "Uganda", users: 1, aircraft: 2, status: "active" },
];

export function Companies() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Companies"
        subtitle="Insurer and operator organisations on the platform, and the users linked to each"
        action={
          <Button variant="primary">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add Company
          </Button>
        }
      />

      <Card>
        <PanelHeader title={`${COMPANIES.length} Companies`} />
        <div className="overflow-x-auto">
          <DataTable columns={["Company", "Type", "Country", "Linked Users", "Aircraft", "Status", ""]}>
            {COMPANIES.map((c) => (
              <tr key={c.name} className="border-b border-border last:border-none hover:bg-bg-hover">
                <td className="px-3.5 py-2.5 font-semibold text-text">{c.name}</td>
                <td className="px-3.5 py-2.5 text-text">{c.type}</td>
                <td className="px-3.5 py-2.5 text-text-2">{c.country}</td>
                <td className="px-3.5 py-2.5 text-text">{c.users}</td>
                <td className="px-3.5 py-2.5 text-text">{c.aircraft || "—"}</td>
                <td className="px-3.5 py-2.5">
                  <Badge tone={c.status === "active" ? "success" : "warn"}>{c.status}</Badge>
                </td>
                <td className="px-3.5 py-2.5 text-right">
                  <button className="text-[11px] font-semibold text-accent hover:underline">Manage</button>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      </Card>
    </div>
  );
}
