"use client";

import { useState, useRef, useMemo, useEffect, useCallback, Fragment } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { PageHeader, cn } from "@/components/ui";
import type { Role } from "@/lib/types";

// Dummy data for now, will be replaced with actual data from src/data
const AIRFIELDS = [
  { name: "Jomo Kenyatta International Airport", code: "HKJK", city: "Nairobi", type: "Major Airport", coords: [-1.3192, 36.9278], riskScore: 7, timezone: "GMT+3", category: "International", elevation:"5330 ft", runways:"06/24 (4117m) – Asphalt", airspace: "Class C/D CTR + TMA", atc: "Full ATC", nightoperations:"Yes", fuel: "Full international services", image:"/images/jomo.jpg" },
  { name: "Moi International Airport", code: "HKMO", city: "Mombasa", type: "Major Airport", coords: [-4.0348, 39.5942], riskScore: 6, timezone: "GMT+3", category: "International / Domestic", elevation:"200 ft", runways:"03/21 (3350m) – Asphalt", airspace: "Class C", atc: "Controlled", nightoperations:"Yes", fuel: "Full services", image:"/images/moi.jpg" },
  { name: "Wilson Airport", code: "HKNW", city: "Nairobi", type: "Minor Airport", coords: [-1.3217, 36.8148], riskScore: 6, timezone: "GMT+3", category: "Domestic (Regional)", elevation:"5535 ft", runways:"14/32 (1560m), 07/25 (1463m) – Asphalt", airspace: "Class D CTR", atc: "Tower-controlled", nightoperations:"Limited", fuel: "AVGAS & Jet A1", image:"/images/wilson.jpg" },
  { name: "Lokichoggio Airport", code: "HKLK", city: "Turkana", type: "Minor Airport", coords: [4.20412, 34.348202], riskScore: 3, timezone: "GMT+3", category: "Humanitarian (Civil)", elevation:"~2116 ft", runways:"09/27 (1888m) – Asphalt", airspace: "Class G", atc: "Uncontrolled", nightoperations:"Limited", fuel: "Basic", image:"/images/lokichoggio.jpg" },
  { name: "Ol Kiombo Airstrip", code: "HKOK", city: "Narok", type: "Airstrip", coords: [-1.408586, 35.110689], riskScore: 4, timezone: "GMT+3", category: "Civil Bush (High Traffic)", elevation:"5200 ft", runways:"09/27 (1200m) – Gravel", airspace: "None", atc: "Uncontrolled", nightoperations:"No", fuel: "Limited", image:"/images/mara.jpg" },
  { name: "Mara Serena Airstrip", code: "HKMS", city: "Narok", type: "Airstrip", coords: [-1.406111, 35.008057], riskScore: 3, timezone: "GMT+3", category: "Civil Bush", elevation:"5200 ft", runways:"09/27 (1050m) – Gravel", airspace: "Class G", atc: "Uncontrolled", nightoperations:"No", fuel: "Limited", image:"/images/mara.jpg" },
  { name: "Laikipia Air Base", code: "HKNY", city: "Nanyuki", type: "Air Base", coords: [0.032933, 37.026901], riskScore: 3, timezone: "GMT+3", category: "Military", elevation:"~6119 ft", runways:"02/20 (4000m) – Concrete", airspace: "Class C/D when active (with restricted access)", atc: "Military-controlled", nightoperations:"Yes", fuel: "Military only", image:"/images/laikipia.jpg" },
  { name: "Wajir Airport", code: "HKWJ", city: "Wajir", type: "Minor Airport", coords: [1.73324, 40.091599], riskScore: 14, timezone: "GMT+3", category: "Domestic (Regional)", elevation:"~757 ft", runways:"15/33 (2800m) – Asphalt", airspace: "Class D", atc: "Controlled", nightoperations:"Yes", fuel: "Limited", image:"/images/wajir.jpg" },
];

const AIRPORT_COORDS: Record<string, { lat: number; lng: number }> = {
  HKJK: { lat: -1.319, lng: 36.927 },
  EGLL: { lat: 51.477, lng: -0.461 },
  HAAB: { lat: 8.978, lng: 38.799 },
  HTDA: { lat: -6.878, lng: 39.203 },
  HRYR: { lat: -1.969, lng: 30.14 },
  OMDB: { lat: 25.253, lng: 55.364 },
  FAOR: { lat: -26.139, lng: 28.246 },
  HUEN: { lat: 0.042, lng: 32.443 },
  VIDP: { lat: 28.556, lng: 77.1 },
  HTZA: { lat: -6.222, lng: 39.225 },
  HSSS: { lat: 15.59, lng: 32.553 },
  HKMO: { lat: -4.035, lng: 39.594 },
  HKKI: { lat: -0.086, lng: 34.729 },
  HSSJ: { lat: 4.872, lng: 31.601 },
  HDAM: { lat: 11.547, lng: 43.16 },
  HHAS: { lat: 15.292, lng: 38.91 },
  FZAA: { lat: -4.385, lng: 15.445 },
  ZBAA: { lat: 40.08, lng: 116.584 },
  HCMM: { lat: 2.014, lng: 45.305 },
  HBBA: { lat: -3.324, lng: 29.319 },
  KJFK: { lat: 40.639, lng: -73.778 },
  HTKJ: { lat: -3.429, lng: 37.075 },
};

const POC_FLIGHTS = [
  { cs: 'KQ100', airline: 'Kenya Airways', ac: 'B772', fr: 'HKJK', to: 'EGLL', status: 'enroute', eta: '4h 45m', alt: 38000, speed: 480, heading: 330 },
  { cs: 'ET306', airline: 'Ethiopian Airlines', ac: 'B789', fr: 'HAAB', to: 'HKJK', status: 'enroute', eta: '55m', alt: 36000, speed: 450, heading: 195 },
  { cs: 'KQ300', airline: 'Kenya Airways', ac: 'B738', fr: 'HKJK', to: 'HAAB', status: 'enroute', eta: '48m', alt: 34000, speed: 430, heading: 15 },
  { cs: 'KQ202', airline: 'Kenya Airways', ac: 'B738', fr: 'HTDA', to: 'HKJK', status: 'enroute', eta: '1h 2m', alt: 35000, speed: 440, heading: 345 },
  { cs: 'WB100', airline: 'RwandAir', ac: 'B738', fr: 'HRYR', to: 'HKJK', status: 'enroute', eta: '1h 22m', alt: 37000, speed: 460, heading: 85 },
  { cs: 'TC501', airline: 'Air Tanzania', ac: 'B39M', fr: 'HTDA', to: 'HRYR', status: 'enroute', eta: '1h 28m', alt: 36000, speed: 455, heading: 290 },
  { cs: 'JM402', airline: 'Jambojet', ac: 'Q400', fr: 'HKMO', to: 'HKJK', status: 'enroute', eta: '38m', alt: 24000, speed: 350, heading: 310 },
  { cs: 'U7201', airline: 'Uganda Airlines', ac: 'A338', fr: 'HUEN', to: 'HKJK', status: 'enroute', eta: '58m', alt: 38000, speed: 470, heading: 95 },
  { cs: 'PW201', airline: 'Precision Air', ac: 'AT75', fr: 'HTDA', to: 'HTZA', status: 'enroute', eta: '32m', alt: 18000, speed: 280, heading: 15 },
];


const AIRLINE_COLORS = {
  'Kenya Airways': '#CC0001',
  'Ethiopian Airlines': '#009B3A',
  'Jambojet': '#FF5500',
  'Uganda Airlines': '#FCDC04',
  'RwandAir': '#20C4F4',
  'Air Tanzania': '#1BB4E8',
  'Precision Air': '#E8821B',
};

const airfieldIcons: Record<string, { color: string; size: number }> = {
  "Major Airport": {
    color: "#dc2626", // red
    size: 42,
  },
  "Minor Airport": {
    color: "#2563eb", // blue
    size: 34,
  },
  "Air Base": {
    color: "#16a34a", // green
    size: 34,
  },
  "Airstrip": {
    color: "#92400e", // brown
    size: 26,
  },
};

const makeAirfieldIcon = (color: string, size: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
      <path d="M2.5 19h19v2h-19zm7.18-1.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-3.77-1.01-2.89-4.86-1.45.39.89 4.34-3.27-.87-.87-1.73-1.09.29.96 3.78z"
        fill="${color}" stroke="white" stroke-width="0.35"/>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const makeLiveFlightIcon = (color: string, size: number, heading: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="${size}" height="${size}">
    <path transform="rotate(${heading}, 48, 48)" d="M59.4855 84.7162 65.8197 78.3226 59.6456 43.3493 73.3696 29.4964C76.1144 26.7258 78.2829 21.6952 76.1517 19.5838 74.0915 17.5428 69.0103 19.6879 66.2655 22.4585L52.5416 36.3114 17.5121 30.4647 11.1779 36.8584 41.9847 46.9675 26.642 62.4543 13.415 61.5969 9.19222 65.8593 24.0711 72.1538 30.5044 86.9731 34.7271 82.7107 33.7461 69.4922 49.0888 54.0054 59.4855 84.7162Z"
      fill="${color}" stroke="white" stroke-width="2.5"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
const SIM_FLIGHTS_DATA = POC_FLIGHTS.map(f => ({
  ...f,
  from: AIRPORT_COORDS[f.fr],
  to: AIRPORT_COORDS[f.to],
  isKQ: f.airline === 'Kenya Airways',
  color: AIRLINE_COLORS[f.airline as keyof typeof AIRLINE_COLORS] || '#818cf8',
}));

export function DashboardPage({ role }: { role: Role }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [flightFilter, setFlightFilter] = useState<string>('all');
  const [showLayerPanel, setShowLayerPanel] = useState(true); // Default to open
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedAirfield, setSelectedAirfield] = useState<any | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Layer visibility states
  const [layerVisibility, setLayerVisibility] = useState({
    majorAirports: true,
    minorAirports: true,
    airbases: true,
    airstrips: true,
    liveFlights: true,
    weather: false,
    securityFeed: false,
    regulation: false,
    commercial: false,
    infrastructure: false,
    asn: false,
    acled: false,
    ctr: false,
    tma: false,
    fir: false,
    prohibited: false,
    danger: false,
    afis: false,
    restricted: false,
  });

  // Panel open states
  const [openBuckets, setOpenBuckets] = useState({
    airfields: true,
    liveFlights: true,
    liveUpdates: false,
    aviationSafety: false,
    securityHist: false,
    flightZones: false,
  });

  const filteredFlights = useMemo(() => {
    if (flightFilter === 'all') return SIM_FLIGHTS_DATA;
    return SIM_FLIGHTS_DATA.filter(f => f.airline === flightFilter);
  }, [flightFilter]);

  const onLoad = (map: google.maps.Map): void => {
    const bounds = new google.maps.LatLngBounds();
    AIRFIELDS.forEach(field => bounds.extend({ lat: field.coords[0], lng: field.coords[1] }));
    setSelectedAirfield(null);
    setSelectedFlight(null);
    SIM_FLIGHTS_DATA.forEach(flight => bounds.extend(flight.from));
    map.fitBounds(bounds);
    mapRef.current = map;
  };

  const onUnmount = (): void => {
    mapRef.current = null;
  };

  const toggleFullscreen = useCallback(() => {
    const elem = mapContainerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen?.();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('msfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('msfullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleBucket = (bucket: keyof typeof openBuckets) => {
    setOpenBuckets(prev => ({ ...prev, [bucket]: !prev[bucket] }));
  };

  const toggleLayer = (layer: keyof typeof layerVisibility) => {
    setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="relative h-full w-full" ref={mapContainerRef}>
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName="h-full w-full"
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {AIRFIELDS.map(field => {
              if (
                (field.type === "Major Airport" && !layerVisibility.majorAirports) ||
                (field.type === "Minor Airport" && !layerVisibility.minorAirports) ||
                (field.type === "Air Base" && !layerVisibility.airbases) ||
                (field.type === "Airstrip" && !layerVisibility.airstrips)
              ) {
                return null;
              }
              const iconInfo = airfieldIcons[field.type as keyof typeof airfieldIcons];
              if (!iconInfo) {
                // Fallback for unknown types
                return <Marker key={field.code} position={{ lat: field.coords[0], lng: field.coords[1] }} title={`${field.name} (${field.code})`} />;
              }
              return (
                <Marker
                  key={field.code}
                  position={{ lat: field.coords[0], lng: field.coords[1] }} // Corrected to use field.coords
                  title={`${field.name} (${field.code})`}
                  onClick={() => { setSelectedFlight(null); setSelectedAirfield(field); }}
                  icon={{
                    url: makeAirfieldIcon(iconInfo.color, iconInfo.size),
                    scaledSize: new window.google.maps.Size(iconInfo.size, iconInfo.size),
                    anchor: new window.google.maps.Point(iconInfo.size / 2, iconInfo.size * 0.88), // POC anchor
                  }}                />
              );
            })}
            {layerVisibility.liveFlights && filteredFlights.map(flight => (
                <Marker
                  key={flight.cs}
                  position={flight.from}
                  title={`${flight.cs} - ${flight.airline}`}
                  onClick={() => { setSelectedAirfield(null); setSelectedFlight(flight); }}
                  icon={
                    {
                      url: makeLiveFlightIcon(flight.color, 30, flight.heading),
                      scaledSize: new window.google.maps.Size(30, 30),
                      anchor: new window.google.maps.Point(15, 15),
                    }
                  }
                />
              ))}

            {selectedAirfield && (
              <InfoWindow
                position={{ lat: selectedAirfield.coords[0], lng: selectedAirfield.coords[1] }}
                onCloseClick={() => setSelectedAirfield(null)}
              >
                <div className="bg-bg-2 text-text p-0 rounded-lg shadow-lg max-w-sm font-body text-xs" style={{ backgroundColor: 'var(--bg-2)', color: 'var(--text)' }}>
                  <img src={selectedAirfield.image} alt={selectedAirfield.name} className="w-full h-32 object-cover rounded-t-lg" />
                  <div className="p-3">
                    <h3 className="font-bold text-sm uppercase text-text mb-0.5">{selectedAirfield.name}</h3>
                    <p className="text-xs text-text-2 mb-2">ICAO: {selectedAirfield.code}</p>
                    <table className="w-full text-left text-[11px]">
                      <tbody>
                        {Object.entries({
                          City: selectedAirfield.city,
                          Timezone: selectedAirfield.timezone,
                          Category: selectedAirfield.category,
                          Elevation: selectedAirfield.elevation,
                          Runways: selectedAirfield.runways,
                          ATC: selectedAirfield.atc,
                        }).map(([key, value]) => (
                          <tr key={key}><td className="pr-2 text-text-2 py-0.5">{key}</td><td className="font-semibold text-text py-0.5">{value}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <button className="mt-3 w-full rounded-md bg-accent py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent-h">
                      Airport Risk Assessment
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}

            {selectedFlight && (
              <InfoWindow
                position={selectedFlight.from}
                onCloseClick={() => setSelectedFlight(null)}
              >
                <div className="bg-bg-2 text-text p-3 rounded-lg shadow-lg max-w-xs font-body text-xs" style={{ backgroundColor: 'var(--bg-2)', color: 'var(--text)' }}>
                  <div className="mb-2">
                    <span className="inline-block rounded border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest" style={{ borderColor: `${selectedFlight.color}55`, backgroundColor: `${selectedFlight.color}22`, color: selectedFlight.color }}>{selectedFlight.airline}</span>
                  </div>
                  <h3 className="font-display text-lg font-extrabold tracking-wide text-text mb-1">{selectedFlight.cs}</h3>
                  <p className="text-[11px] text-text-2 mb-2.5">{selectedFlight.ac}</p>
                  <table className="w-full text-left text-[11px]">
                    <tbody>
                      <tr><td className="pr-2 text-text-2 py-0.5">Altitude</td><td className="font-semibold text-text py-0.5">{selectedFlight.alt.toLocaleString()} ft</td></tr>
                      <tr><td className="pr-2 text-text-2 py-0.5">Speed</td><td className="font-semibold text-text py-0.5">{selectedFlight.speed} kt</td></tr>
                      <tr><td className="pr-2 text-text-2 py-0.5">Heading</td><td className="font-semibold text-text py-0.5">{selectedFlight.heading}°</td></tr>
                      <tr><td className="pr-2 text-text-2 py-0.5">ETA</td><td className="font-bold text-success py-0.5">{selectedFlight.eta}</td></tr>
                    </tbody>
                  </table>
                  <button className="mt-3 w-full rounded-md bg-accent py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent-h">
                    Full Path
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-2 text-text-2">
            Loading Map...
          </div>
        )}

        {/* Layer Toggle Button */}
        <button
          id="layerToggleBtn"
          onClick={() => setShowLayerPanel(prev => !prev)}
          className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm font-semibold text-text-2 shadow-md transition-colors hover:bg-bg-hover hover:text-text"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M3 6h18v2H3V6zm3 5h12v2H6v-2zm3 5h6v2H9v-2z"/></svg>
          Layers
        </button>

        {/* Custom Layer Tree Panel */}
        <div id="layerPanel" className={cn("absolute right-4 top-[60px] z-10 w-60 overflow-hidden rounded-lg border border-border bg-bg-2 shadow-lg", !showLayerPanel && "hidden")}>
          <div id="layerPanelHead" className="flex items-center justify-between border-b border-border bg-bg-3 px-3.5 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-3">Map Layers</span>
          </div>
          <div id="layerPanelScroll" className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Basemap Section */}
            <div className="border-b border-border py-1.5">
              <div className="px-3.5 pb-1 text-[9.5px] font-bold uppercase tracking-wider text-text-3">Base Map</div>
              <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 text-sm text-text-2 hover:bg-bg-hover hover:text-text">
                <input type="radio" name="basemap" value="default" defaultChecked className="accent-accent" />
                <span>Default</span>
              </label>
              {/* Add other basemap options here */}
            </div>

            {/* Bucket: Airfields */}
            <div className="border-b border-border">
              <div className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm font-semibold text-text hover:bg-bg-hover" onClick={() => toggleBucket('airfields')}>
                <input type="checkbox" className="accent-accent" checked={Object.values(layerVisibility).slice(0, 4).some(v => v)} onChange={(e) => { e.stopPropagation(); setLayerVisibility(p => ({ ...p, majorAirports: e.target.checked, minorAirports: e.target.checked, airbases: e.target.checked, airstrips: e.target.checked })) }} />
                <svg className="h-4 w-4 fill-red-600" viewBox="0 0 24 24"><path d="M2.5 19h19v2h-19zm7.18-1.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-3.77-1.01-2.89-4.86-1.45.39.89 4.34-3.27-.87-.87-1.73-1.09.29.96 3.78z"/></svg>
                <span className="flex-1">Airfields</span>
                <svg className={cn("h-3 w-3 shrink-0 stroke-current stroke-2 text-text-3 transition-transform", openBuckets.airfields && "rotate-180")} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className={cn("py-1", !openBuckets.airfields && "hidden")}>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.majorAirports} onChange={() => toggleLayer('majorAirports')} /><div className="h-2 w-2 rounded-full bg-red-600" /><span>Major Airports</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.minorAirports} onChange={() => toggleLayer('minorAirports')} /><div className="h-2 w-2 rounded-full bg-blue-600" /><span>Minor Airports</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.airbases} onChange={() => toggleLayer('airbases')} /><div className="h-2 w-2 rounded-full bg-green-600" /><span>Air Bases</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.airstrips} onChange={() => toggleLayer('airstrips')} /><div className="h-2 w-2 rounded-full bg-yellow-800" /><span>Airstrips</span></label>
              </div>
            </div>

            {/* Bucket: Live Flights */}
            <div className="border-b border-border">
              <div className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm font-semibold text-text hover:bg-bg-hover" onClick={() => toggleBucket('liveFlights')}>
                <input type="checkbox" className="accent-accent" checked={layerVisibility.liveFlights} onChange={(e) => { e.stopPropagation(); toggleLayer('liveFlights'); }} />
                <svg className="h-4 w-4 fill-success" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>
                <span className="flex-1">Live Flights</span>
                <svg className={cn("h-3 w-3 shrink-0 stroke-current stroke-2 text-text-3 transition-transform", openBuckets.liveFlights && "rotate-180")} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className={cn("py-1", !openBuckets.liveFlights && "hidden")}>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="radio" name="flightMode" value="all" checked={flightFilter === 'all'} className="accent-accent" onChange={() => setFlightFilter('all')} /><div className="h-2 w-2 rounded-full bg-text-3" /><span>All Airlines</span></label>
                {Object.entries(AIRLINE_COLORS).map(([name, color]) => (
                  <label key={name} className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover">
                    <input type="radio" name="flightMode" value={name} checked={flightFilter === name} className="accent-accent" onChange={() => setFlightFilter(name)} />
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Bucket: Live Updates */}
            <div className="border-b border-border">
              <div className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm font-semibold text-text hover:bg-bg-hover" onClick={() => toggleBucket('liveUpdates')}>
                <input
                  type="checkbox"
                  className="accent-accent"
                  checked={[
                    layerVisibility.weather,
                    layerVisibility.securityFeed,
                    layerVisibility.regulation,
                    layerVisibility.commercial,
                    layerVisibility.infrastructure,
                  ].some(v => v)}
                  onChange={(e) => {
                    e.stopPropagation();
                    const isChecked = e.target.checked;
                    setLayerVisibility(p => ({
                      ...p,
                      weather: isChecked,
                      securityFeed: isChecked,
                      regulation: isChecked,
                      commercial: isChecked,
                      infrastructure: isChecked,
                    }));
                  }}
                />
                <svg className="h-4 w-4 fill-warn" viewBox="0 0 24 24"><path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93v2.02c5.05-.5 9-4.76 9-9.95S18.05 2.55 13 2.05zM11 2.05C5.95 2.55 2 6.81 2 12s3.95 9.45 9 9.95v-2.02C7.05 19.43 4 16.07 4 12s3.05-7.44 7-7.93V2.05zM12 6l-5 9h10L12 6z"/></svg>
                <span className="flex-1">Live Updates</span>
                <svg className={cn("h-3 w-3 shrink-0 stroke-current stroke-2 text-text-3 transition-transform", openBuckets.liveUpdates && "rotate-180")} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className={cn("py-1", !openBuckets.liveUpdates && "hidden")}>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.weather} onChange={() => toggleLayer('weather')} /><div className="h-2 w-2 rounded-full bg-warn" /><span>Weather</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.securityFeed} onChange={() => toggleLayer('securityFeed')} /><div className="h-2 w-2 rounded-full bg-danger" /><span>Security</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.regulation} onChange={() => toggleLayer('regulation')} /><div className="h-2 w-2 rounded-full bg-purple-500" /><span>Regulation</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.commercial} onChange={() => toggleLayer('commercial')} /><div className="h-2 w-2 rounded-full bg-blue-500" /><span>Commercial</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.infrastructure} onChange={() => toggleLayer('infrastructure')} /><div className="h-2 w-2 rounded-full bg-orange-700" /><span>Infrastructure</span></label>
              </div>
            </div>
            {/* Bucket: Aviation Safety */}
            <div className="border-b border-border">
              <div className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm font-semibold text-text hover:bg-bg-hover" onClick={() => toggleBucket('aviationSafety')}>
                <input type="checkbox" className="accent-accent" checked={layerVisibility.asn} onChange={(e) => { e.stopPropagation(); toggleLayer('asn'); }} />
                <svg className="h-4 w-4 fill-blue-600" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                <span className="flex-1">Aviation Safety</span>
                <svg className={cn("h-3 w-3 shrink-0 stroke-current stroke-2 text-text-3 transition-transform", openBuckets.aviationSafety && "rotate-180")} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className={cn("py-1", !openBuckets.aviationSafety && "hidden")}>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.asn} onChange={() => toggleLayer('asn')} /><div className="h-2 w-2 rounded-full bg-danger" /><span>ASN Incidents</span></label>
              </div>
            </div>
            {/* Bucket: Historic Security Events */}
            <div className="border-b border-border">
              <div className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm font-semibold text-text hover:bg-bg-hover" onClick={() => toggleBucket('securityHist')}>
                <input type="checkbox" className="accent-accent" checked={layerVisibility.acled} onChange={(e) => { e.stopPropagation(); toggleLayer('acled'); }} />
                <svg className="h-4 w-4 fill-danger" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                <span className="flex-1">Historic Security Events</span>
                <svg className={cn("h-3 w-3 shrink-0 stroke-current stroke-2 text-text-3 transition-transform", openBuckets.securityHist && "rotate-180")} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className={cn("py-1", !openBuckets.securityHist && "hidden")}>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.acled} onChange={() => toggleLayer('acled')} /><div className="h-2 w-2 rounded-full bg-danger" /><span>ACLED Events</span></label>
              </div>
            </div>
            {/* Bucket: Flight Zones */}
            <div className="border-b-0">
              <div className="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm font-semibold text-text hover:bg-bg-hover" onClick={() => toggleBucket('flightZones')}>
                <input type="checkbox" className="accent-accent" checked={Object.values(layerVisibility).slice(12).some(v => v)} onChange={(e) => { e.stopPropagation(); setLayerVisibility(p => ({ ...p, ctr: e.target.checked, tma: e.target.checked, fir: e.target.checked, prohibited: e.target.checked, danger: e.target.checked, afis: e.target.checked, restricted: e.target.checked })) }} />
                <svg className="h-4 w-4 fill-purple-500" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                <span className="flex-1">Flight Zones</span>
                <svg className={cn("h-3 w-3 shrink-0 stroke-current stroke-2 text-text-3 transition-transform", openBuckets.flightZones && "rotate-180")} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className={cn("py-1", !openBuckets.flightZones && "hidden")}>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.ctr} onChange={() => toggleLayer('ctr')} /><div className="h-2 w-2 rounded-full bg-orange-500" /><span>CTR — Control Zones</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.tma} onChange={() => toggleLayer('tma')} /><div className="h-2 w-2 rounded-full bg-yellow-900" /><span>TMA — Terminal Areas</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.fir} onChange={() => toggleLayer('fir')} /><div className="h-2 w-2 rounded-full bg-indigo-900" /><span>FIR — Flight Info Regions</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.prohibited} onChange={() => toggleLayer('prohibited')} /><div className="h-2 w-2 rounded-full bg-lime-500" /><span>Prohibited Airspace</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.danger} onChange={() => toggleLayer('danger')} /><div className="h-2 w-2 rounded-full bg-danger" /><span>Danger Airspace</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.afis} onChange={() => toggleLayer('afis')} /><div className="h-2 w-2 rounded-full bg-yellow-400" /><span>AFIS Zones</span></label>
                <label className="flex cursor-pointer items-center gap-2 px-3.5 py-1 pl-8 text-xs text-text-2 hover:bg-bg-hover"><input type="checkbox" className="accent-accent" checked={layerVisibility.restricted} onChange={() => toggleLayer('restricted')} /><div className="h-2 w-2 rounded-full bg-gray-400" /><span>Restricted Airspace</span></label>
              </div>
            </div>
            {/* Other buckets would go here */}
          </div>
        </div>

        {/* Fullscreen Button */}
        <button
          id="fullscreenBtn"
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm font-semibold text-text-2 shadow-md transition-colors hover:bg-bg-hover hover:text-text"
        >
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
          )}
          <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
    </div>
  );
}