import Image from "next/image";
import { Card, PageHeader, Badge, PanelHeader } from "@/components/ui";
import { COUNTRIES } from "@/data";

const RISK_NOTES: Record<string, { overall: string; security: string; infra: string; note: string }> = {
  kenya: { overall: "Low", security: "Stable, isolated coastal/border incidents", infra: "Modern, JKIA Cat. 1 rated", note: "Primary regional hub with strong regulatory oversight (KCAA)." },
  tanzania: { overall: "Low", security: "Stable", infra: "Developing, steady investment", note: "Growing tourism and cargo traffic through DAR and JRO." },
  uganda: { overall: "Low-Moderate", security: "Generally stable, periodic unrest", infra: "Entebbe upgrades ongoing", note: "Regional connections expanding via Uganda Airlines fleet growth." },
  rwanda: { overall: "Low", security: "Very stable", infra: "Modern, Bugesera expansion", note: "RwandAir hub growth with strong safety record." },
  burundi: { overall: "Moderate", security: "Periodic political tension", infra: "Limited", note: "Constrained regional connectivity, elevated ground risk." },
  drcongo: { overall: "High", security: "Active conflict in eastern provinces", infra: "Variable, limited outside Kinshasa", note: "Elevated hull and security risk in eastern operating areas." },
  somalia: { overall: "Extreme", security: "Active conflict, terrorism risk", infra: "Limited, Mogadishu improving", note: "War risk endorsements required for most coverage." },
  ethiopia: { overall: "Moderate", security: "Localized internal conflict", infra: "Strong, Addis Bole hub", note: "Ethiopian Airlines is a major regional and continental hub." },
  southsudan: { overall: "Extreme", security: "Active conflict, fragile state", infra: "Very limited", note: "Highest risk tier in the region; specialist coverage required." },
  sudan: { overall: "Extreme", security: "Active civil conflict", infra: "Severely degraded", note: "Airspace restrictions in effect; most commercial ops suspended." },
  djibouti: { overall: "Low-Moderate", security: "Stable, strategic military presence", infra: "Modern, strategic port/airport", note: "Strategic Horn of Africa logistics and refuelling hub." },
  eritrea: { overall: "Moderate", security: "Stable but isolated", infra: "Limited, aging", note: "Limited commercial traffic and constrained market access." },
};

export function CountryProfile({ countryKey }: { countryKey: string }) {
  const country = COUNTRIES.find((c) => c.key === countryKey);
  const risk = RISK_NOTES[countryKey];

  if (!country) {
    return <div className="text-[13px] text-text-2">Country not found.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Image src={`https://flagcdn.com/w80/${country.flag}.png`} alt={country.name} width={40} height={27} className="rounded border border-border-2" unoptimized />
        <PageHeader title={country.name} subtitle={country.region} />
      </div>

      {risk && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-4 lg:col-span-2">
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-text-3">Risk Summary</div>
            <p className="text-[12.5px] leading-relaxed text-text-2">{risk.note}</p>
          </Card>
          <Card>
            <PanelHeader title="Ratings" />
            <div className="flex flex-col gap-2.5 p-4">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-2">Overall risk</span>
                <Badge tone={risk.overall === "Low" ? "success" : risk.overall.includes("Extreme") ? "danger" : "warn"}>{risk.overall}</Badge>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-2">Security</span>
                <span className="text-right text-text">{risk.security}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-2">Infrastructure</span>
                <span className="text-right text-text">{risk.infra}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
