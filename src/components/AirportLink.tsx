import { AIRPORT_INFO } from "@/data/airports";

export function AirportLink({ icao }: { icao: string }) {
  const airport = AIRPORT_INFO[icao];

  if (!airport) {
    return icao;
  }

  return (
    <span className="whitespace-nowrap">
      {icao}
      <span className="text-[10px] text-text-2"> {airport.city},</span>
      <span className="cursor-pointer text-[10px] font-semibold text-accent hover:underline"> {airport.country}</span>
    </span>
  );
}