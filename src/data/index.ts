import fleetRaw from "./fleet.json";
import fleetOperators from "./fleet-operators.json";
import claimsRaw from "./claims.json";
import policiesRaw from "./policies.json";
import newsInsurer from "./newsfeed-insurer.json";
import newsOperator from "./newsfeed-operator.json";
import contactsCivil from "./contacts-civil.json";
import contactsEmergency from "./contacts-emergency.json";
import contactsInsurance from "./contacts-insurance.json";
import contactsMaintenance from "./contacts-maintenance.json";
import kqFlights from "./kq_flights_live.json";
import jambojetFlights from "./jambojet_flights_live.json";
import skylineFlights from "./skyline_flights_live.json";

export type FleetAircraft = {
  reg: string;
  type: string;
  short: string;
  op: string;
  country: string;
  yr: number;
  msn: string;
  engines: string;
  seats: number;
  status: string;
  lastInsp: string;
  nextMaint: string;
  maintDays: number;
  polId: string;
  polExp: string;
  polDays: number;
  hullVal: string;
  liabVal: string;
  hours: number;
  cycles: number;
  risk: number;
  riskNote: string;
  history: { date: string; type: string; title: string; desc: string }[];
};

export const fleet = fleetRaw as unknown as FleetAircraft[];
export const operators = fleetOperators as Record<
  string,
  { name: string; color: string; bg: string }
>;
export const claims = claimsRaw as Array<{
  id: string;
  policy: string;
  operator: string;
  type: string;
  aircraft: string;
  amount: string;
  status: string;
  filed: string;
  handler: string;
}>;
export const policies = policiesRaw as Array<{
  id: string;
  client: string;
  ac: string;
  cov: string;
  period: string;
  expiry: string;
  status: string;
}>;
export const newsfeedInsurer = newsInsurer as Array<{
  country: string;
  cat: string;
  catColor: string;
  headline: string;
  body: string;
  source: string;
  time: string;
}>;
export const newsfeedOperator = newsOperator as Array<{
  country: string;
  cat: string;
  catColor: string;
  headline: string;
  body: string;
  source: string;
  time: string;
}>;

export const contacts = {
  civil: contactsCivil as Array<{ org: string; country: string; group: string; details: string[] }>,
  emergency: contactsEmergency as Array<{ org: string; country: string; group: string; emergRows: string[] }>,
  insurance: contactsInsurance as unknown as Array<Record<string, unknown>>,
  maintenance: contactsMaintenance as unknown as Array<Record<string, unknown>>,
};

export type LiveFlight = {
  ident?: string;
  ident_iata?: string;
  operator?: string;
  aircraft_type?: string;
  origin?: { code_iata?: string; city?: string };
  destination?: { code_iata?: string; city?: string };
  status?: string;
  progress_percent?: number;
  scheduled_off?: string;
  scheduled_on?: string;
};

function normalizeKq(): LiveFlight[] {
  const raw = kqFlights as { scheduled?: LiveFlight[] };
  return (raw.scheduled ?? []).slice(0, 40);
}

function normalizeJambojet(): LiveFlight[] {
  const raw = jambojetFlights as { flights?: LiveFlight[] };
  return raw.flights ?? [];
}

function normalizeSkyline(): LiveFlight[] {
  const raw = skylineFlights as { flights?: LiveFlight[] };
  return raw.flights ?? [];
}

export const liveFlights: LiveFlight[] = [
  ...normalizeKq(),
  ...normalizeJambojet(),
  ...normalizeSkyline(),
];

export const COUNTRIES = [
  { key: "ke", name: "Kenya", flag: "ke", region: "East Africa" },
  { key: "tz", name: "Tanzania", flag: "tz", region: "East Africa" },
  { key: "ug", name: "Uganda", flag: "ug", region: "East Africa" },
  { key: "rw", name: "Rwanda", flag: "rw", region: "East Africa" },
  { key: "bi", name: "Burundi", flag: "bi", region: "East Africa" },
  { key: "cd", name: "DR Congo", flag: "cd", region: "Horn & Central" },
  { key: "so", name: "Somalia", flag: "so", region: "Horn & Central" },
  { key: "et", name: "Ethiopia", flag: "et", region: "Horn & Central" },
  { key: "ss", name: "South Sudan", flag: "ss", region: "Horn & Central" },
  { key: "sd", name: "Sudan", flag: "sd", region: "Horn & Central" },
  { key: "dj", name: "Djibouti", flag: "dj", region: "Horn & Central" },
  { key: "er", name: "Eritrea", flag: "er", region: "Horn & Central" },
];
