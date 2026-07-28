import Papa from "papaparse";

export interface Airfield {
  name: string;
  code: string;
  city: string;
  type: string;
  coords: [number, number];
  timezone: string;
  category: string;
  elevation: string;
  runways: string;
  airspace: string;
  atc: string;
  nightoperations: string;
  fuel: string;
  image: string;
  riskScore: number;
  riskLevel?: string;
  riskReport: string;
  domains: Record<string, { name: string; score: number }>;
  worstCredibleDomain: string;
  meanImpactSeverity: number;
  status: string;
  activeDisruptions: string[];
  lastUpdate: string;
  domainImpactAssessment: Array<{
    domain: string;
    likelihoods: number;
    impact: number;
    liColor: string;
    severity: string;
    rationale: string;
  }>;
  servicingAndCarriers: {
    hubCarriers: string;
    globalCarriers: string;
    regionalFeeders: string;
    strategicUse: string;
  };
  groundsideSecurityRisks: {
    airsideLandside: string;
    customsProcessing: string;
    groundTransport: string;
  };
  otherRealities: {
    departureTiming: string;
    infrastructureReliability: string;
    transitRisk: string;
  };
}

function parseAirfieldRow(row: any): Airfield {
  const domains: Record<string, { name: string; score: number }> = {};
  for (let i = 1; i <= 5; i++) {
    const key = `D${i}`;
    domains[key] = {
      name: row[`domain_${key}_name`] || '',
      score: parseInt(row[`domain_${key}_score`] || '0', 10),
    };
  }

  const dia: Airfield['domainImpactAssessment'] = [];
  for (let i = 0; i < 5; i++) {
    dia.push({
      domain: row[`dia_${i}_domain`] || '',
      likelihoods: parseInt(row[`dia_${i}_likelihoods`] || '0', 10),
      impact: parseInt(row[`dia_${i}_impact`] || '0', 10),
      liColor: row[`dia_${i}_liColor`] || '',
      severity: row[`dia_${i}_severity`] || '',
      rationale: row[`dia_${i}_rationale`] || '',
    });
  }

  return {
    name: row.name,
    code: row.code,
    city: row.city,
    type: row.type,
    coords: [parseFloat(row.lat), parseFloat(row.lng)],
    timezone: row.timezone,
    category: row.category,
    elevation: row.elevation,
    runways: row.runways,
    airspace: row.airspace,
    atc: row.atc,
    nightoperations: row.nightoperations,
    fuel: row.fuel,
    image: row.image,
    riskScore: parseInt(row.riskScore, 10),
    riskReport: row.riskReport || '',
    domains,
    worstCredibleDomain: row.worstCredibleDomain || '',
    meanImpactSeverity: parseFloat(row.meanImpactSeverity) || 0,
    status: row.status || 'NORMAL',
    activeDisruptions: row.activeDisruptions ? row.activeDisruptions.split('|') : [],
    lastUpdate: row.lastUpdate || '',
    domainImpactAssessment: dia,
    servicingAndCarriers: {
      hubCarriers: row.servicing_hubCarriers || '',
      globalCarriers: row.servicing_internationalAirlines || '',
      regionalFeeders: row.servicing_regionalDomesticAirlines || '',
      strategicUse: row.servicing_primaryUse || '',
    },
    groundsideSecurityRisks: {
      airsideLandside: row.groundside_airsideLandside || '',
      customsProcessing: row.groundside_customsProcessing || '',
      groundTransport: row.groundside_groundTransport || '',
    },
    otherRealities: {
      departureTiming: row.operational_departureTiming || '',
      infrastructureReliability: row.operational_infrastructureReliability || '',
      transitRisk: row.operational_transitRisk || '',
    },
  };
}

let cachedAirfields: Airfield[] | null = null;

export async function loadAirfields(): Promise<Airfield[]> {
  if (cachedAirfields) return cachedAirfields;

  try {
    const response = await fetch('/data/airfields.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load airfields CSV: ${response.status}`);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = results.data.map(parseAirfieldRow);
            cachedAirfields = data;
            resolve(data);
          } catch (err) {
            reject(err);
          }
        },
        error: (err: any) => reject(err),
      });
    });
  } catch (error) {
    console.error('Error loading airfields:', error);
    return [];
  }
}

export async function getAirfieldByCode(code: string): Promise<Airfield | null> {
  const all = await loadAirfields();
  return all.find(a => a.code === code) || null;
}