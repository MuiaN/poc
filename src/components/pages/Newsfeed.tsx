import { Card, PageHeader } from "@/components/ui";
import { newsfeedInsurer, newsfeedOperator } from "@/data";
import type { Role } from "@/lib/types";

export function Newsfeed({ role }: { role: Role }) {
  const items = role === "operator" ? newsfeedOperator : newsfeedInsurer;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Regional Newsfeed" subtitle="Live risk, security, and operational intelligence across Eastern Africa" />
      <div className="flex flex-col gap-3">
        {items.map((n, i) => (
          <Card key={i} className="p-4">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: `${n.catColor}22`, color: n.catColor }}
              >
                {n.cat}
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-text-3">{n.country}</span>
              <span className="ml-auto text-[10.5px] text-text-3">{n.time}</span>
            </div>
            <div className="text-[13px] font-semibold text-text">{n.headline}</div>
            <div className="mt-1 text-[12px] leading-relaxed text-text-2">{n.body}</div>
            <div className="mt-2 text-[10.5px] italic text-text-3">{n.source}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
