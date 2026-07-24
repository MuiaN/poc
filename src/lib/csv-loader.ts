export interface CountryProfile {
  id: string;
  name: string;
  flag: string;
  region: string;
  timezone: string;
  kpi_hull_risk: string;
  kpi_war_risk: string;
  kpi_terrorism: string;
  kpi_airspace: string;
  kpi_regulatory: string;
  // KPI extra info fields
  kpi_hull_risk_info: string;
  kpi_war_risk_info: string;
  kpi_terrorism_info: string;
  kpi_airspace_info: string;
  kpi_regulatory_info: string;
  aviation_overview: string;
  hull_risk_table_json: string;
  regulatory_json: string;
  threat_assessment_json: string;
  threat_vectors_json: string;
  exposure_flags_json: string;
  seasonal_calendar_json: string;
  weather_risk_json: string;
  seasonal_risk_json: string;
  weather_events_json: string;
  incident_log_json: string;
  bird_hotspots_json: string;
  severity_breakdown_json: string;
  monthly_rainfall_json: string;
  // Direct wx fields (from CSV)
  wx_flight_delays: string;
  wx_diversions: string;
  wx_convective: string;
  wx_airstrip_surfaces: string;
  wx_gnss: string;
  wx_fir: string;
  wx_nairobi_urban: string;
  wx_jkia_access: string;
  wx_rural_routes: string;
  wx_mombasa_coastal: string;
  wx_key_event: string;
  wx_hkjk: string;
  wx_hkmo: string;
  wx_hknw: string;
  wx_maasai_mara: string;
  wx_northern_kenya: string;
  // Quarterly/seasonal fields
  q1_aviation: string;
  q1_ground: string;
  q2_aviation: string;
  q2_ground: string;
  q3_aviation: string;
  q3_ground: string;
  q4_aviation: string;
  q4_ground: string;
  jan_risk: string;
  feb_risk: string;
  mar_risk: string;
  apr_risk: string;
  may_risk: string;
  jun_risk: string;
  jul_risk: string;
  aug_risk: string;
  sep_risk: string;
  oct_risk: string;
  nov_risk: string;
  dec_risk: string;
  // Severity fields
  sev_fatal: string;
  sev_runway_excursion: string;
  sev_bird_strike: string;
  sev_serious_other: string;
  sev_security_divert: string;
  sev_other: string;
}

const CSV_TO_INTERFACE: Record<string, string> = {
  hull_risk_table: 'hull_risk_table_json',
  regulatory: 'regulatory_json',
  threat_overview: 'threat_assessment_json',
  threat_vectors: 'threat_vectors_json',
  exposure_flags: 'exposure_flags_json',
  seasonal_calendar: 'seasonal_calendar_json',
  wx_flight_delays: 'wx_flight_delays',
  wx_diversions: 'wx_diversions',
  wx_convective: 'wx_convective',
  wx_airstrip_surfaces: 'wx_airstrip_surfaces',
  wx_gnss: 'wx_gnss',
  wx_fir: 'wx_fir',
  wx_nairobi_urban: 'wx_nairobi_urban',
  wx_jkia_access: 'wx_jkia_access',
  wx_rural_routes: 'wx_rural_routes',
  wx_mombasa_coastal: 'wx_mombasa_coastal',
  wx_key_event: 'wx_key_event',
  wx_hkjk: 'wx_hkjk',
  wx_hkmo: 'wx_hkmo',
  wx_hknw: 'wx_hknw',
  wx_maasai_mara: 'wx_maasai_mara',
  wx_northern_kenya: 'wx_northern_kenya',
  q1_aviation: 'q1_aviation',
  q1_ground: 'q1_ground',
  q2_aviation: 'q2_aviation',
  q2_ground: 'q2_ground',
  q3_aviation: 'q3_aviation',
  q3_ground: 'q3_ground',
  q4_aviation: 'q4_aviation',
  q4_ground: 'q4_ground',
  jan_risk: 'jan_risk',
  feb_risk: 'feb_risk',
  mar_risk: 'mar_risk',
  apr_risk: 'apr_risk',
  may_risk: 'may_risk',
  jun_risk: 'jun_risk',
  jul_risk: 'jul_risk',
  aug_risk: 'aug_risk',
  sep_risk: 'sep_risk',
  oct_risk: 'oct_risk',
  nov_risk: 'nov_risk',
  dec_risk: 'dec_risk',
  weather_events: 'weather_events_json',
  incident_log: 'incident_log_json',
  bird_hotspots: 'bird_hotspots_json',
  sev_fatal: 'sev_fatal',
  sev_runway_excursion: 'sev_runway_excursion',
  sev_bird_strike: 'sev_bird_strike',
  sev_serious_other: 'sev_serious_other',
  sev_security_divert: 'sev_security_divert',
  sev_other: 'sev_other',
};

function parseCSV(csvText: string): CountryProfile[] {
  const lines = csvText.trim().split('\n');
  const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const headers = rawHeaders.map(h => CSV_TO_INTERFACE[h] || h);
  const results: CountryProfile[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);

    if (values.length === rawHeaders.length) {
      const row: Record<string, string> = {};
      rawHeaders.forEach((header, idx) => {
        const mappedHeader = CSV_TO_INTERFACE[header] || header;
        if (mappedHeader) {
          row[mappedHeader] = values[idx] || '';
        }
      });

      // Build weather_risk_json from individual wx_* columns
      const weatherRisk = {
        flight_delays: row.wx_flight_delays || '',
        diversions: row.wx_diversions || '',
        convective: row.wx_convective || '',
        airstrip_surfaces: row.wx_airstrip_surfaces || '',
        gnss: row.wx_gnss || '',
        fir: row.wx_fir || '',
        nairobi_urban: row.wx_nairobi_urban || '',
        jkia_access: row.wx_jkia_access || '',
        rural_routes: row.wx_rural_routes || '',
        mombasa_coastal: row.wx_mombasa_coastal || '',
        key_event: row.wx_key_event || '',
        airport_advisories: [
          { airport: 'HKJK', advisory: row.wx_hkjk || '' },
          { airport: 'HKMO', advisory: row.wx_hkmo || '' },
          { airport: 'HKNW', advisory: row.wx_hknw || '' },
          { airport: 'MAASAI_MARA', advisory: row.wx_maasai_mara || '' },
          { airport: 'NORTHERN_KENYA', advisory: row.wx_northern_kenya || '' },
        ].filter(a => a.advisory),
      };
      row.weather_risk_json = JSON.stringify(weatherRisk);

      // Parse KPI fields: format "Value|Additional Info"
      const parseKpi = (field: string) => {
        const val = row[field] || '';
        const parts = val.split('|');
        return {
          value: parts[0] || '',
          info: parts[1] || '',
        };
      };
      const hull = parseKpi('kpi_hull_risk');
      const war = parseKpi('kpi_war_risk');
      const terror = parseKpi('kpi_terrorism');
      const airspace = parseKpi('kpi_airspace');
      const regulatory = parseKpi('kpi_regulatory');
      row.kpi_hull_risk = hull.value;
      row.kpi_hull_risk_info = hull.info;
      row.kpi_war_risk = war.value;
      row.kpi_war_risk_info = war.info;
      row.kpi_terrorism = terror.value;
      row.kpi_terrorism_info = terror.info;
      row.kpi_airspace = airspace.value;
      row.kpi_airspace_info = airspace.info;
      row.kpi_regulatory = regulatory.value;
      row.kpi_regulatory_info = regulatory.info;

      // Build seasonal_risk_json from quarterly/monthly columns
      const seasonalRisk = {
        q1_aviation: parseInt(row.q1_aviation || '1', 10),
        q1_ground: parseInt(row.q1_ground || '1', 10),
        q2_aviation: parseInt(row.q2_aviation || '4', 10),
        q2_ground: parseInt(row.q2_ground || '5', 10),
        q3_aviation: parseInt(row.q3_aviation || '1', 10),
        q3_ground: parseInt(row.q3_ground || '1', 10),
        q4_aviation: parseInt(row.q4_aviation || '2', 10),
        q4_ground: parseInt(row.q4_ground || '3', 10),
        monthly_rainfall: [
          parseInt(row.jan_risk || '1', 10),
          parseInt(row.feb_risk || '1', 10),
          parseInt(row.mar_risk || '4', 10),
          parseInt(row.apr_risk || '5', 10),
          parseInt(row.may_risk || '4', 10),
          parseInt(row.jun_risk || '1', 10),
          parseInt(row.jul_risk || '1', 10),
          parseInt(row.aug_risk || '1', 10),
          parseInt(row.sep_risk || '1', 10),
          parseInt(row.oct_risk || '2', 10),
          parseInt(row.nov_risk || '3', 10),
          parseInt(row.dec_risk || '2', 10),
        ],
      };
      row.seasonal_risk_json = JSON.stringify(seasonalRisk);

      // Build severity_breakdown_json from sev_* columns
      const severityBreakdown = {
        fatal: parseInt(row.sev_fatal || '0', 10),
        serious: parseInt(row.sev_runway_excursion || '0', 10) + parseInt(row.sev_serious_other || '0', 10),
        minor: parseInt(row.sev_bird_strike || '0', 10) + parseInt(row.sev_security_divert || '0', 10) + parseInt(row.sev_other || '0', 10),
      };
      row.severity_breakdown_json = JSON.stringify(severityBreakdown);

      // Build monthly_rainfall_json
      const monthlyRainfall = seasonalRisk.monthly_rainfall.map((v, i) => ({ month: ['J','F','M','A','M','J','J','A','S','O','N','D'][i], risk: v }));
      row.monthly_rainfall_json = JSON.stringify(monthlyRainfall);

      // Build hull_risk_table_json from pipe/semicolon format
      // Format: Location|Hull Risk|War Risk|Note;Location|Hull Risk|War Risk|Note;...
      if (row.hull_risk_table_json) {
        const hullRows = row.hull_risk_table_json.split(';').map(r => r.trim()).filter(r => r);
        const parsedHull = hullRows.map(r => {
          const parts = r.split('|');
          return {
            location: parts[0] || '',
            hull_risk: parts[1] || '',
            war_risk: parts[2] || '',
            note: parts[3] || '',
          };
        });
        row.hull_risk_table_json = JSON.stringify(parsedHull);
      }

      // Build regulatory_json from key=value;key=value format
      if (row.regulatory_json) {
        const regPairs = row.regulatory_json.split(';').map(r => r.trim()).filter(r => r);
        const regObj: Record<string, string> = {};
        regPairs.forEach(pair => {
          const eqIdx = pair.indexOf('=');
          if (eqIdx > 0) {
            const key = pair.substring(0, eqIdx).trim();
            const value = pair.substring(eqIdx + 1).trim();
            regObj[key] = value;
          }
        });
        row.regulatory_json = JSON.stringify(regObj);
      }

// Build threat_vectors_json from pipe/semicolon format
      // Format: severity|title|description|aviation_exposure;severity|title|description|aviation_exposure;...
      // Record separator is ;HIGH| or ;MODERATE| or ;WATCH| (semicolon + severity + pipe)
      if (row.threat_vectors_json) {
        const text = row.threat_vectors_json;
        const vectors: Array<{severity: string; title: string; description: string; aviation_exposure: string}> = [];
        
        // Split by semicolon followed by severity keyword and pipe
        // Use regex to split only on record separators, not semicolons in text
        const segments = text.split(/;(?=(?:HIGH|MODERATE|WATCH)\|)/);
        
        segments.forEach(segment => {
          const trimmed = segment.trim();
          if (!trimmed) return;
          
          // Parse: severity|title|description|aviation_exposure
          const firstPipe = trimmed.indexOf('|');
          const secondPipe = trimmed.indexOf('|', firstPipe + 1);
          const thirdPipe = trimmed.indexOf('|', secondPipe + 1);
          
          if (firstPipe > 0 && secondPipe > firstPipe && thirdPipe > secondPipe) {
            vectors.push({
              severity: trimmed.substring(0, firstPipe),
              title: trimmed.substring(firstPipe + 1, secondPipe),
              description: trimmed.substring(secondPipe + 1, thirdPipe),
              aviation_exposure: trimmed.substring(thirdPipe + 1),
            });
          }
        });
        
row.threat_vectors_json = JSON.stringify(vectors);
      }

      // Build exposure_flags_json from pipe/semicolon format
      // Format: Exposure|Risk|Note;Exposure|Risk|Note;...
      if (row.exposure_flags_json) {
        const flagRows = row.exposure_flags_json.split(';').map(r => r.trim()).filter(r => r);
        const parsedFlags = flagRows.map(r => {
          const parts = r.split('|');
          return {
            exposure: parts[0] || '',
            risk: parts[1] || '',
            note: parts.slice(2).join('|') || '',
          };
        });
        row.exposure_flags_json = JSON.stringify(parsedFlags);
      }

      // Build seasonal_calendar_json from pipe/semicolon format
      // Format: period|name|badge|status|description;period|name|badge|status|description;...
      // The dash in periods is an en-dash (U+2013)
      if (row.seasonal_calendar_json) {
        const text = row.seasonal_calendar_json;
        const seasons: Array<{period: string; name: string; badge: string; status: string; description: string; seasonType: string}> = [];
        
        // Split by semicolon followed by period pattern (month + hyphen/en-dash + month + pipe)
        const segments = text.split(/;(?=[A-Za-z]+[-–][A-Za-z]+\|)/);
        
        segments.forEach(segment => {
          const trimmed = segment.trim();
          if (!trimmed) return;
          
          const parts = trimmed.split('|');
          // Handle both 5-field (with badge) and 4-field (no badge) formats
          if (parts.length >= 4) {
            const period = parts[0] || '';
            const name = parts[1] || '';
            let badge = '';
            let status = 'dry';
            let description = '';
            
            if (parts.length === 5) {
              // Full format: period|name|badge|status|description
              badge = parts[2] || '';
              status = parts[3] || 'dry';
              description = parts[4] || '';
            } else if (parts.length === 4) {
              // Format without badge: period|name|status|description
              badge = '';
              status = parts[2] || 'dry';
              description = parts[3] || '';
            }
            
            // Determine season type from period for fixed coloring
            const p = period.toLowerCase();
            let seasonType = 'dry';
            if (p.includes('mar') || p.includes('may')) seasonType = 'long-rains';
            else if (p.includes('jun') || p.includes('sep')) seasonType = 'dry';
            else if (p.includes('oct') || p.includes('dec')) seasonType = 'short-rains';
            else if (p.includes('jan') || p.includes('feb')) seasonType = 'dry';
            
            seasons.push({ period, name, badge, status, description, seasonType });
          }
        });
        
        row.seasonal_calendar_json = JSON.stringify(seasons);
      }

      // Build incident_log_json from pipe/semicolon format
      // Format: Date|Airport|Aircraft|Operator|Category|Severity|Description|Source;...
      if (row.incident_log_json) {
        const incidentRows = row.incident_log_json.split(';').map(r => r.trim()).filter(r => r);
        const parsedIncidents = incidentRows.map(r => {
          const parts = r.split('|');
          return {
            date: parts[0] || '',
            airport: parts[1] || '',
            aircraft: parts[2] || '',
            operator: parts[3] || '',
            category: parts[4] || '',
            severity: parts[5] || '',
            description: parts[6] || '',
            source: parts[7] || '',
          };
        });
        row.incident_log_json = JSON.stringify(parsedIncidents);
      }

      // Build bird_hotspots_json from pipe/semicolon format
      // Format: Location|Risk|Species|Note;...
      if (row.bird_hotspots_json) {
        const hotspotRows = row.bird_hotspots_json.split(';').map(r => r.trim()).filter(r => r);
        const parsedHotspots = hotspotRows.map(r => {
          const parts = r.split('|');
          return {
            location: parts[0] || '',
            risk: parts[1] || '',
            species: parts[2] || '',
            note: parts[3] || '',
          };
        });
        row.bird_hotspots_json = JSON.stringify(parsedHotspots);
      }

      // Build weather_events_json from pipe/semicolon format
      // Format: Date|Description;...
      if (row.weather_events_json) {
        const eventRows = row.weather_events_json.split(';').map(r => r.trim()).filter(r => r);
        const parsedEvents = eventRows.map(r => {
          const parts = r.split('|');
          return {
            date: parts[0] || '',
            description: parts[1] || '',
          };
        });
        row.weather_events_json = JSON.stringify(parsedEvents);
      }

      results.push(row as unknown as CountryProfile);
    }
  }

  return results;
}

let cachedProfiles: CountryProfile[] | null = null;

export async function loadCountryProfiles(): Promise<CountryProfile[]> {
  if (cachedProfiles) return cachedProfiles;

  try {
    const response = await fetch('/data/country_profiles_all.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load CSV');
    const csvText = await response.text();
    cachedProfiles = parseCSV(csvText);
    return cachedProfiles;
  } catch (error) {
    console.error('Error loading country profiles:', error);
    return [];
  }
}

export async function getCountryProfile(id: string): Promise<CountryProfile | null> {
  const profiles = await loadCountryProfiles();
  return profiles.find(p => p.id === id) || null;
}

export function parseJSONField<T>(jsonStr: string, fallback: T): T {
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}