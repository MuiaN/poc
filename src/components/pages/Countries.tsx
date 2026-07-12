import Image from "next/image";
import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { COUNTRIES } from "@/data";
import type { Role } from "@/lib/types";
import { ROLE_BASE } from "@/lib/nav";

export function Countries({ role }: { role: Role }) {
  const base = ROLE_BASE[role];
  const regions = Array.from(new Set(COUNTRIES.map((c) => c.region)));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Country Profiles" subtitle="Aviation risk, security, and regulatory context by country" />
      {regions.map((region) => (
        <div key={region} className="flex flex-col gap-2.5">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-text-3">{region}</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {COUNTRIES.filter((c) => c.region === region).map((c) => (
              <Link key={c.key} href={`${base}/countries/${c.key}`}>
                <Card className="flex items-center gap-3 p-3.5 transition-shadow hover:shadow-card-md">
                  <Image
                    src={`https://flagcdn.com/w40/${c.flag}.png`}
                    alt={c.name}
                    width={28}
                    height={19}
                    className="rounded-sm border border-border-2"
                    unoptimized
                  />
                  <span className="text-[12.5px] font-semibold text-text">{c.name}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
