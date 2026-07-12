import { Card, PageHeader, Badge, PanelHeader, Button } from "@/components/ui";

const FILES = [
  { name: "KQ_Fleet_Insurance_Cert_2026.pdf", type: "Certificate", size: "1.2 MB", by: "A. Mwangi", date: "2026-06-28", status: "verified" },
  { name: "ET_Loss_Run_Q2_2026.xlsx", type: "Loss Run", size: "384 KB", by: "S. Bekele", date: "2026-06-21", status: "verified" },
  { name: "Fly540_Hull_Survey_Report.pdf", type: "Survey", size: "5.6 MB", by: "J. Otieno", date: "2026-06-15", status: "pending" },
  { name: "RwandAir_Renewal_Submission.docx", type: "Submission", size: "212 KB", by: "P. Uwase", date: "2026-06-02", status: "verified" },
  { name: "Jubilee_Claim_CLM-2026-0037_Photos.zip", type: "Evidence", size: "22.4 MB", by: "A. Mwangi", date: "2026-05-27", status: "pending" },
];

export function Uploads() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Document Uploads"
        subtitle="Certificates, loss runs, survey reports and claim evidence"
        action={
          <Button variant="primary">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
              <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
            </svg>
            Upload File
          </Button>
        }
      />
      <Card>
        <PanelHeader title={`${FILES.length} Files`} />
        <div className="divide-y divide-border">
          {FILES.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-semibold text-text">{f.name}</div>
                <div className="mt-0.5 text-[11px] text-text-3">
                  {f.type} · {f.size} · uploaded by {f.by} on {f.date}
                </div>
              </div>
              <Badge tone={f.status === "verified" ? "success" : "warn"}>{f.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
