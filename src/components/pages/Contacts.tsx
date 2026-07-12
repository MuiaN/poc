"use client";

import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { contacts } from "@/data";

const TABS = [
  { key: "civil", label: "Civil Aviation Authorities" },
  { key: "emergency", label: "Emergency Contacts" },
  { key: "insurance", label: "Insurance Brokers & Partners" },
  { key: "maintenance", label: "MRO & Engineering Systems" },
] as const;

export function Contacts() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("civil");

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Aviation Contacts Directory" />

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px rounded-t px-4 py-2 text-[12.5px] font-semibold transition-colors ${
              tab === t.key ? "border-b-2 border-accent bg-accent-dim text-accent" : "bg-bg-3 text-text-2 hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "civil" && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.civil.map((c, i) => (
            <Card key={i} className="border-l-[3px] border-l-accent p-3.5">
              <div className="text-[12.5px] font-bold text-text">{c.org}</div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-2">{c.country}</div>
              <div className="flex flex-col gap-1 border-t border-border pt-1.5 text-[12px] text-text-2">
                {c.details.map((d, j) => (
                  <div key={j}>{d}</div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "emergency" && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.emergency.map((c, i) => (
            <Card key={i} className="border-l-[3px] border-l-danger p-3.5">
              <div className="text-[12.5px] font-bold text-text">{c.org}</div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-2">{c.country}</div>
              <div className="flex flex-col gap-1 border-t border-border pt-1.5 text-[12px] text-text-2">
                {c.emergRows.map((d, j) => (
                  <div key={j}>{d}</div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "insurance" && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.insurance.map((c, i) => (
            <Card key={i} className="border-l-[3px] border-l-success p-3.5 text-[12px] leading-relaxed text-text-2">
              {String(c)}
            </Card>
          ))}
        </div>
      )}

      {tab === "maintenance" && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.maintenance.map((c, i) => (
            <Card key={i} className="border-l-[3px] border-l-warn p-3.5 text-[12px] leading-relaxed text-text-2">
              {String(c)}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
