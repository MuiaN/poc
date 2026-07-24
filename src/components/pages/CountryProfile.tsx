"use client";

import React, { useState, useEffect } from "react";
import { getCountryProfile, parseJSONField, CountryProfile as ProfileType } from "@/lib/csv-loader";

// ─── Types for parsed JSON fields ──────────────────────────────

interface HullRiskRow {
  location: string;
  hull_risk: string;
  war_risk: string;
  note: string;
}

interface RegulatoryItem {
  key: string;
  value: string;
}

interface ThreatVector {
  severity: "HIGH" | "MODERATE" | "WATCH";
  title: string;
  description: string;
  aviation_exposure: string;
}

interface ExposureFlag {
  exposure: string;
  risk: string;
  note: string;
}

interface SeasonalPeriod {
  period: string;
  name: string;
  badge: string;
  status: "active" | "dry" | "short"; // for styling
  description: string;
  seasonType: "long-rains" | "dry" | "short-rains";
}

interface WeatherRisk {
  flight_delays: string;
  diversions: string;
  convective: string;
  airstrip_surfaces: string;
  gnss: string;
  fir: string;
  nairobi_urban: string;
  jkia_access: string;
  rural_routes: string;
  mombasa_coastal: string;
  key_event: string;
  airport_advisories?: { airport: string; advisory: string }[];
}

interface SeasonalRisk {
  q1_aviation: number;
  q1_ground: number;
  q2_aviation: number;
  q2_ground: number;
  q3_aviation: number;
  q3_ground: number;
  q4_aviation: number;
  q4_ground: number;
  monthly_rainfall: number[]; // 12 values
}

interface WeatherEvent {
  date: string;
  description: string;
}

interface Incident {
  date: string;
  airport: string;
  aircraft: string;
  operator: string;
  category: string;
  severity: "Fatal" | "Serious" | "Minor";
  description: string;
  source: string;
}

interface BirdHotspot {
  location: string;
  risk: string;
  species: string;
  note: string;
}

interface SeverityBreakdown {
  fatal: number;
  serious: number;
  minor: number;
}

// ─── Component ──────────────────────────────────────────────────

interface CountryProfileProps {
  countryKey: string;
}

export const CountryProfile: React.FC<CountryProfileProps> = ({ countryKey }) => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "threat" | "weather" | "history">("overview");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getCountryProfile(countryKey);
      setProfile(data);
      setLoading(false);
    };
    fetchData();
  }, [countryKey]);

  if (loading) return <div className="text-[13px] text-text-2">Loading country profile…</div>;
  if (!profile) return <div className="text-[13px] text-text-2">Country not found.</div>;

  // ─── Parse JSON fields ──────────────────────────────────────

  const hullRows = parseJSONField<HullRiskRow[]>(profile.hull_risk_table_json, []);
  const regulatoryObj = parseJSONField<Record<string, string>>(profile.regulatory_json, {});
  const threatVectors = parseJSONField<ThreatVector[]>(profile.threat_vectors_json, []);
  const exposureFlags = parseJSONField<ExposureFlag[]>(profile.exposure_flags_json, []);
  const seasonalCalendar = parseJSONField<SeasonalPeriod[]>(profile.seasonal_calendar_json, []);
  const weatherRisk = parseJSONField<WeatherRisk>(profile.weather_risk_json, {} as WeatherRisk);
  const seasonalRisk = parseJSONField<SeasonalRisk>(profile.seasonal_risk_json, {} as SeasonalRisk);
  const weatherEvents = parseJSONField<WeatherEvent[]>(profile.weather_events_json, []);
  const incidentLog = parseJSONField<Incident[]>(profile.incident_log_json, []);
  const birdHotspots = parseJSONField<BirdHotspot[]>(profile.bird_hotspots_json, []);
  const severityBreakdown = parseJSONField<SeverityBreakdown>(profile.severity_breakdown_json, { fatal: 0, serious: 0, minor: 0 });

  // Additional direct fields
  const {
    kpi_hull_risk,
    kpi_war_risk,
    kpi_terrorism,
    kpi_airspace,
    kpi_regulatory,
    kpi_hull_risk_info,
    kpi_war_risk_info,
    kpi_terrorism_info,
    kpi_airspace_info,
    kpi_regulatory_info,
    aviation_overview,
    wx_flight_delays,
    wx_diversions,
    wx_convective,
    wx_airstrip_surfaces,
    wx_gnss,
    wx_fir,
    wx_nairobi_urban,
    wx_jkia_access,
    wx_rural_routes,
    wx_mombasa_coastal,
    wx_key_event,
    wx_hkjk,
    wx_hkmo,
    wx_hknw,
    wx_maasai_mara,
    wx_northern_kenya,
  } = profile;

  // ─── Helper: severity class ──────────────────────────────────

  const severityClass = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "fatal": return "sev-fatal";
      case "serious": return "sev-serious";
      default: return "sev-minor";
    }
  };

  // ─── Helper: risk badge class ────────────────────────────────

  const riskClass = (risk: string) => {
    const r = risk.toLowerCase();
    if (r.includes("low")) return "cp-r-low";
    if (r.includes("moderate") || r === "mod") return "cp-r-mod";
    if (r.includes("elevated")) return "cp-r-el";
    if (r.includes("high")) return "cp-r-high";
    if (r.includes("seasonal")) return "cp-r-seasonal";
    if (r.includes("monitor")) return "cp-r-monitor";
    if (r.includes("moderate–elevated") || r === "mod-el") return "cp-r-mod-el";
    return "";
  };

  // ─── Helper: source badge class ──────────────────────────────

  const srcClass = (src: string) => {
    const s = src.toLowerCase();
    if (s.includes("open")) return "src-open";
    if (s.includes("avh")) return "src-avh";
    if (s.includes("asn")) return "src-asn";
    return "src-open";
  };

  // ─── Helper: regulatory value class ──────────────────────────────

  const regValueClass = (key: string, value: string) => {
    const k = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
    // Special highlight for TSA OSS
    if (key === "TSA OSS") return "cp-kv-v special";
    // Amber for Labour and JKIA items
    if (key === "Labour" || key === "JKIA" || key === "JKIA 2nd runway") return "cp-kv-v amber";
    // Blue for Civil authority and Tel / Web
    if (key === "Civil authority" || key === "Tel / Web") return "cp-kv-v blue";
    // Green for compliance items
    if (key === "ICAO AVSEC" || key === "IATA IOSA" || key === "EASA TCO" || key === "EU Air Safety List" || key === "ISAGO" || key === "KCAA") return "cp-kv-v green";
    return "cp-kv-v";
  };

  const seasonClass = (status: string) => {
    switch (status) {
      case "active": return "s-active";
      case "dry": return "s-dry";
      case "short": return "s-short";
      default: return "s-dry";
    }
  };

  // ─── Determine active season based on current month ────────────────
  const getSeasonKey = (period: string) => {
    const p = period.toLowerCase();
    if (p.includes("mar") || p.includes("may")) return "long-rains";  // Mar-May
    if (p.includes("jun") || p.includes("sep")) return "dry-1";      // Jun-Sep
    if (p.includes("oct") || p.includes("dec")) return "short-rains"; // Oct-Dec
    if (p.includes("jan") || p.includes("feb")) return "dry-2";      // Jan-Feb
    return "";
  };

  const getActiveSeasonKey = () => {
    const m = new Date().getMonth() + 1; // 1-12
    if (m >= 3 && m <= 5) return "long-rains";
    if (m >= 6 && m <= 9) return "dry-1";
    if (m >= 10 && m <= 12) return "short-rains";
    return "dry-2";
  };

  const activeSeasonKey = getActiveSeasonKey();

  // Calendar order (chronological through the year)
  const calendarOrder = ["dry-2", "long-rains", "dry-1", "short-rains"];
  
  // Sort seasons: active first, then chronological order starting from active season
  const sortedSeasons = [...seasonalCalendar].sort((a, b) => {
    const aKey = getSeasonKey(a.period);
    const bKey = getSeasonKey(b.period);
    const aActive = aKey === activeSeasonKey ? 0 : 1;
    const bActive = bKey === activeSeasonKey ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    
    // For non-active, order chronologically starting from active season
    const activeIdx = calendarOrder.indexOf(activeSeasonKey);
    const aIdx = (calendarOrder.indexOf(aKey) - activeIdx + 4) % 4;
    const bIdx = (calendarOrder.indexOf(bKey) - activeIdx + 4) % 4;
    return aIdx - bIdx;
  });

  // Update status: active for current season, otherwise use the season key for CSS
  const seasonsWithStatus = sortedSeasons.map(s => {
    const seasonKey = getSeasonKey(s.period);
    const isActive = seasonKey === activeSeasonKey;
    return {
      ...s,
      seasonKey,  // for CSS class
      isActive   // for ACTIVE NOW badge
    };
  });

  // ─── Build quarterly risk data ────────────────────────────────

  const qAviation = [
    seasonalRisk.q1_aviation || 1,
    seasonalRisk.q2_aviation || 4,
    seasonalRisk.q3_aviation || 1,
    seasonalRisk.q4_aviation || 2,
  ];
  const qGround = [
    seasonalRisk.q1_ground || 1,
    seasonalRisk.q2_ground || 5,
    seasonalRisk.q3_ground || 1,
    seasonalRisk.q4_ground || 3,
  ];
  const monthlyRain = seasonalRisk.monthly_rainfall || Array(12).fill(1);

  // ─── Severity percentages ──────────────────────────────────────

  const total = severityBreakdown.fatal + severityBreakdown.serious + severityBreakdown.minor || 1;
  const pFatal = (severityBreakdown.fatal / total) * 100;
  const pSerious = (severityBreakdown.serious / total) * 100;
  const pMinor = (severityBreakdown.minor / total) * 100;

  // ─── SVG chart helper: quarterly risk bars ───────────────────

  const renderQuarterlyBars = () => {
    const barWidth = 17;
    const gap = 2;
    const groupWidth = barWidth * 2 + gap;
    const startX = 38;
    const maxValue = 5;
    const scale = 24; // pixels per unit
    const baseY = 150;

    const quarters = [
      { label: "Jan–Feb", av: qAviation[0], gr: qGround[0] },
      { label: "Mar–May", av: qAviation[1], gr: qGround[1] },
      { label: "Jun–Sep", av: qAviation[2], gr: qGround[2] },
      { label: "Oct–Dec", av: qAviation[3], gr: qGround[3] },
    ];

    let x = startX;
    const bars: JSX.Element[] = [];
    const labels: JSX.Element[] = [];

    quarters.forEach((q, idx) => {
      const avHeight = Math.min(q.av, maxValue) * scale;
      const grHeight = Math.min(q.gr, maxValue) * scale;
      const avY = baseY - avHeight;
      const grY = baseY - grHeight;

      bars.push(
        <React.Fragment key={idx}>
          <rect x={x} y={avY} width={barWidth} height={avHeight} fill="#1B6CA8" />
          <rect x={x + barWidth + gap} y={grY} width={barWidth} height={grHeight} fill="#7A5C00" />
        </React.Fragment>
      );
      // value labels
      labels.push(
        <React.Fragment key={`lbl-${idx}`}>
          <text x={x + barWidth / 2} y={avY - 4} textAnchor="middle" fontSize="9" fill="#1B6CA8" fontWeight="bold">
            {q.av}
          </text>
          <text x={x + barWidth + gap + barWidth / 2} y={grY - 4} textAnchor="middle" fontSize="9" fill="#7A5C00" fontWeight="bold">
            {q.gr}
          </text>
        </React.Fragment>
      );
      x += groupWidth + 16;
    });

    // X axis labels
    const xLabels = [
      { x: startX + groupWidth / 2 - 12, label: "Jan–Feb" },
      { x: startX + groupWidth + 16 + groupWidth / 2 - 12, label: "Mar–May" },
      { x: startX + 2 * (groupWidth + 16) + groupWidth / 2 - 12, label: "Jun–Sep" },
      { x: startX + 3 * (groupWidth + 16) + groupWidth / 2 - 12, label: "Oct–Dec" },
    ];

    return (
      <svg viewBox="0 0 300 195" width="100%" style={{ display: "block", marginBottom: "8px" }}>
        {/* Y-axis and gridlines */}
        <line x1="30" y1="5" x2="30" y2="150" stroke="#C8D4E0" strokeWidth="1" />
        <line x1="30" y1="150" x2="290" y2="150" stroke="#C8D4E0" strokeWidth="1" />
        {[0, 1, 2, 3, 4, 5].map((v) => {
          const y = 150 - v * scale;
          return (
            <React.Fragment key={v}>
              <line x1="30" y1={y} x2="290" y2={y} stroke="#EBF0F5" strokeWidth="0.7" strokeDasharray="3,3" />
              <text x="24" y={y + 3} textAnchor="end" fontSize="8.5" fill="#9AABBA">
                {v}
              </text>
            </React.Fragment>
          );
        })}
        {/* Bars */}
        {bars}
        {/* Value labels */}
        {labels}
        {/* X labels */}
        {xLabels.map((xl) => (
          <text key={xl.label} x={xl.x} y="163" textAnchor="middle" fontSize="8.5" fill="#7A8A98">
            {xl.label}
          </text>
        ))}
        {/* Legend */}
        <rect x="38" y="175" width="11" height="8" fill="#1B6CA8" />
        <text x="52" y="183" fontSize="8" fill="#7A8A98">
          Aviation weather risk
        </text>
        <rect x="152" y="175" width="11" height="8" fill="#7A5C00" />
        <text x="166" y="183" fontSize="8" fill="#7A8A98">
          Ground access risk
        </text>
      </svg>
    );
  };

  // ─── SVG helper: severity donut ──────────────────────────────

  const renderSeverityDonut = () => {
    const cx = 90;
    const cy = 85;
    const outerR = 55;
    const innerR = 34;
    const startAngle = 0;
    const sectors = [
      { label: "Fatal", value: pFatal, color: "#B71C1C" },
      { label: "Serious", value: pSerious, color: "#1B6CA8" },
      { label: "Minor", value: pMinor, color: "#C4D4E8" },
    ];

    let currentAngle = startAngle;
    const paths: JSX.Element[] = [];
    const labels: JSX.Element[] = [];

    sectors.forEach((sector) => {
      if (sector.value === 0) return;
      const angle = (sector.value / 100) * 360;
      const endAngle = currentAngle + angle;
      const startRad = (currentAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = cx + outerR * Math.sin(startRad);
      const y1 = cy - outerR * Math.cos(startRad);
      const x2 = cx + outerR * Math.sin(endRad);
      const y2 = cy - outerR * Math.cos(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const path = `
        M ${cx} ${cy - outerR}
        A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}
        L ${cx + innerR * Math.sin(endRad)} ${cy - innerR * Math.cos(endRad)}
        A ${innerR} ${innerR} 0 ${largeArc} 0 ${cx + innerR * Math.sin(startRad)} ${cy - innerR * Math.cos(startRad)}
        Z
      `;
      paths.push(
        <path key={sector.label} d={path} fill={sector.color} />
      );

      // label at midpoint of arc, radius = outerR + 17
      const midAngle = (currentAngle + endAngle) / 2;
      const midRad = (midAngle * Math.PI) / 180;
      const labelR = outerR + 20;
      const lx = cx + labelR * Math.sin(midRad);
      const ly = cy - labelR * Math.cos(midRad);
      labels.push(
        <text key={`lbl-${sector.label}`} x={lx} y={ly + 3} textAnchor="middle" fontSize="9" fill={sector.color} fontWeight="bold">
          {Math.round(sector.value)}%
        </text>
      );

      currentAngle = endAngle;
    });

    return (
      <svg viewBox="-8 0 196 170" width="85%">
        {paths}
        {labels}
        <text x="90" y="82" textAnchor="middle" fontSize="9" fill="#5A6A78">
          Severity
        </text>
        <text x="90" y="93" textAnchor="middle" fontSize="9" fill="#5A6A78">
          breakdown
        </text>
        {/* Legend */}
        <rect x="22" y="152" width="9" height="7" fill="#B71C1C" />
        <text x="34" y="159" fontSize="8" fill="#5A6A78">
          Fatal
        </text>
        <rect x="72" y="152" width="9" height="7" fill="#1B6CA8" />
        <text x="84" y="159" fontSize="8" fill="#5A6A78">
          Serious
        </text>
        <rect x="130" y="152" width="9" height="7" fill="#C4D4E8" />
        <text x="142" y="159" fontSize="8" fill="#5A6A78">
          Minor
        </text>
      </svg>
    );
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="cp-page">
      {/* ── HEADER ── */}
      <div className="page-header" style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px" }}>
        <span className="header-title" style={{ color: "var(--text)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.2px" }}>
          {profile.name} — Country Profile
        </span>
        <span className="header-tz" style={{ color: "var(--accent)", fontSize: "13px", fontWeight: 700 }}>
          {profile.timezone}
        </span>
      </div>

      {/* ── TAB BAR ── */}
      <div className="tab-bar" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "var(--bg-3)", borderBottom: "1px solid var(--border)" }}>
        <button
          className={`tab-btn ${activeTab === "overview" ? "t-overview" : ""}`}
          onClick={() => setActiveTab("overview")}
          style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: activeTab === "overview" ? "#fff" : "var(--text-2)", background: activeTab === "overview" ? "var(--accent)" : "var(--bg-3)", border: "none", cursor: "pointer", borderRight: "1px solid var(--border)", transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}
        >
          Country Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "threat" ? "t-threat" : ""}`}
          onClick={() => setActiveTab("threat")}
          style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: activeTab === "threat" ? "#fff" : "var(--text-2)", background: activeTab === "threat" ? "var(--danger)" : "var(--bg-3)", border: "none", cursor: "pointer", borderRight: "1px solid var(--border)", transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}
        >
          Threat Profile
        </button>
        <button
          className={`tab-btn ${activeTab === "weather" ? "t-weather" : ""}`}
          onClick={() => setActiveTab("weather")}
          style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: activeTab === "weather" ? "#0B0F1A" : "var(--text-2)", background: activeTab === "weather" ? "var(--warn)" : "var(--bg-3)", border: "none", cursor: "pointer", borderRight: "1px solid var(--border)", transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}
        >
          Weather Trends &amp; Patterns
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "t-history" : ""}`}
          onClick={() => setActiveTab("history")}
          style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: activeTab === "history" ? "var(--text)" : "var(--text-2)", background: activeTab === "history" ? "var(--bg-hover)" : "var(--bg-3)", border: "none", cursor: "pointer", borderRight: "1px solid var(--border)", transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}
        >
          Historical Aviation Data
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1 · OVERVIEW
          ════════════════════════════════════════════════════════════ */}
      <div className={`tab-panel ${activeTab === "overview" ? "active" : ""}`} style={{ display: activeTab === "overview" ? "block" : "none", padding: "12px 14px 18px" }}>
        {/* KPI Strip */}
        <div className="cp-kpi-strip">
          <div className="cp-kpi-card">
            <div className="cp-kpi-label">Hull risk rating</div>
            <div className="cp-kpi-row">
              <div className="cp-kpi-val cp-c-orange">{kpi_hull_risk}</div>
            </div>
            <div className="cp-kpi-sub">{kpi_hull_risk_info}</div>
          </div>
          <div className="cp-kpi-card">
            <div className="cp-kpi-label">War risk (aviation)</div>
            <div className="cp-kpi-row">
              <div className="cp-kpi-val cp-c-orange">{kpi_war_risk}</div>
            </div>
            <div className="cp-kpi-sub">{kpi_war_risk_info}</div>
          </div>
          <div className="cp-kpi-card">
            <div className="cp-kpi-label">Terrorism exposure</div>
            <div className="cp-kpi-row">
              <div className="cp-kpi-val cp-c-green">{kpi_terrorism}</div>
            </div>
            <div className="cp-kpi-sub">{kpi_terrorism_info}</div>
          </div>
          <div className="cp-kpi-card">
            <div className="cp-kpi-label">Airspace status</div>
            <div className="cp-kpi-row">
              <div className="cp-kpi-val cp-c-navy">{kpi_airspace}</div>
            </div>
            <div className="cp-kpi-sub">{kpi_airspace_info}</div>
          </div>
          <div className="cp-kpi-card" style={{ borderRight: "none" }}>
            <div className="cp-kpi-label">Regulatory standing</div>
            <div className="cp-kpi-row">
              <div className="cp-kpi-val cp-c-navy">{kpi_regulatory}</div>
            </div>
            <div className="cp-kpi-sub">{kpi_regulatory_info}</div>
          </div>
        </div>

        {/* 3-column body */}
        <div className="three-col" style={{ display: "grid", gridTemplateColumns: "27% 1fr 28%", gap: "12px" }}>
          {/* LEFT: Aviation System Overview */}
          <div className="panel" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <div className="ph ph-blue" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--accent)", borderLeft: "3px solid var(--accent)" }}>
              Aviation System Overview
            </div>
            <div className="pb" style={{ padding: "11px 12px", fontSize: "11.5px", lineHeight: "1.58", color: "var(--text)" }}>
              {aviation_overview.split("\n").map((para, idx) => (
                <p key={idx} style={{ marginBottom: "8px" }}>{para}</p>
              ))}
            </div>
          </div>

          {/* CENTRE: Hull Risk & War Risk by location */}
          <div className="panel">
            <div className="ph ph-navy" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text)", borderLeft: "3px solid var(--text-2)" }}>
              Hull Risk &amp; War Risk – by location
            </div>
            <table className="dt" style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr>
                  <th style={{ width: "24%", background: "var(--bg-3)", padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--border)", whiteSpace: "nowrap", color: "var(--text-2)" }}>Location</th>
                  <th style={{ width: "14%" }}>Hull risk</th>
                  <th style={{ width: "13%" }}>War risk</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {hullRows.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? "var(--bg-3)" : "transparent" }}>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}>{row.location}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}><span className={`cp-risk ${riskClass(row.hull_risk)}`}>{row.hull_risk}</span></td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}><span className={`cp-risk ${riskClass(row.war_risk)}`}>{row.war_risk}</span></td>
                    <td className="note" style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text-2)", fontSize: "10.5px" }}>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT: Regulatory Status & Compliance */}
          <div className="panel">
            <div className="ph ph-slate" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text-2)", borderLeft: "3px solid var(--text-2)" }}>
              Regulatory Status &amp; Compliance
            </div>
            <div className="pb" style={{ padding: "9px 11px", fontSize: "11.5px", lineHeight: "1.58", color: "var(--text)" }}>
              {Object.entries(regulatoryObj).map(([key, value]) => {
                const isLabour = key === "Labour" || key === "JKIA" || key === "JKIA 2nd runway";
                const isTsa = key === "TSA OSS";
                return (
                  <div
                    key={key}
                    className="kv"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: isLabour ? "5px 4px" : "4px 0",
                      borderBottom: isLabour ? "none" : "1px solid var(--border)",
                      borderTop: isLabour ? "2px solid var(--border)" : "none",
                      background: isTsa ? "var(--success-dim)" : "transparent",
                      borderRadius: isTsa ? "2px" : "0",
                      fontSize: "11px",
                      gap: "6px",
                      alignItems: "flex-start",
                      marginTop: isLabour ? "3px" : "0",
                    }}
                  >
                    <span className="kv-k" style={{ color: isTsa ? "var(--success)" : "var(--text-2)", flexShrink: 0, fontWeight: isTsa ? 700 : undefined }}>{key}</span>
                    <span className={regValueClass(key, value)} style={{ textAlign: "right", fontWeight: isTsa ? 800 : 600, fontSize: isTsa ? "11px" : "10.5px", color: isTsa ? "var(--success)" : undefined }} dangerouslySetInnerHTML={{ __html: value }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 2 · THREAT PROFILE
          ════════════════════════════════════════════════════════════ */}
      <div className={`tab-panel ${activeTab === "threat" ? "active" : ""}`} style={{ display: activeTab === "threat" ? "block" : "none", padding: "12px 14px 18px" }}>
        <div className="three-col" style={{ display: "grid", gridTemplateColumns: "27% 1fr 28%", gap: "12px" }}>
          {/* LEFT: Top-Line Security Assessment */}
          <div className="panel">
            <div className="ph ph-maroon" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "rgba(239,68,68,0.08)", color: "var(--danger)", borderLeft: "3px solid var(--danger)" }}>
              Top-Line Security Assessment
            </div>
            <div className="pb" style={{ padding: "11px 12px", fontSize: "11.5px", lineHeight: "1.58", color: "var(--text)" }}>
              <p>{profile.threat_assessment_json}</p>
            </div>
          </div>

          {/* CENTRE: Active Threat Vectors */}
          <div className="panel">
            <div className="ph ph-red" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "rgba(239,68,68,0.08)", color: "var(--danger)", borderLeft: "3px solid var(--danger)" }}>
              Active Threat Vectors &nbsp;<span style={{ fontWeight: 400, fontSize: "10.5px" }}>[Jan–Apr 2026]</span>
            </div>
            <div className="pb" style={{ padding: "11px 12px", fontSize: "11.5px", lineHeight: "1.58", color: "var(--text)" }}>
              {threatVectors.map((tv, idx) => {
                const sevClass = tv.severity === "HIGH" ? "high" : tv.severity === "MODERATE" ? "mod" : "watch";
                const badgeClass = tv.severity === "HIGH" ? "high" : tv.severity === "MODERATE" ? "mod" : "watch";
                return (
                  <div key={idx} className={`cp-threat-card tc-border-${sevClass}`} style={{ marginBottom: "10px" }}>
                    <div className="tc-head" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 11px", borderBottom: "1px solid var(--border)" }}>
                      <span className={`tc-badge tc-${badgeClass}`} style={{ display: "inline-block", fontSize: "9.5px", fontWeight: 800, padding: "2px 8px", borderRadius: "2px", whiteSpace: "nowrap", letterSpacing: "0.5px", background: tv.severity === "HIGH" ? "var(--danger)" : tv.severity === "MODERATE" ? "var(--warn)" : "var(--success)", color: tv.severity === "HIGH" ? "#fff" : "#0B0F1A" }}>
                        {tv.severity}
                      </span>
                      <span className="tc-title" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>{tv.title}</span>
                    </div>
<div className="tc-body" style={{ padding: "9px 11px", fontSize: "11px", lineHeight: "1.55", color: "var(--text)" }}>
                      <p>{tv.description}</p>
                      <p className="tc-italic" style={{ fontStyle: "italic", color: "var(--text-2)", marginTop: "6px" }}>Aviation exposure: {tv.aviation_exposure}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Exposure & Flags */}
          <div className="panel">
            <div className="ph ph-amber" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "rgba(245,158,11,0.08)", color: "var(--warn)", borderLeft: "3px solid var(--warn)" }}>
              Exposure &amp; Flags
            </div>
            <table className="dt dt-sm" style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
              <thead>
                <tr>
                  <th style={{ background: "var(--bg-3)", padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--border)", whiteSpace: "nowrap", color: "var(--text-2)" }}>Exposure</th>
                  <th style={{ background: "var(--bg-3)", padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--border)", whiteSpace: "nowrap", color: "var(--text-2)" }}>Risk</th>
                  <th style={{ width: "48%", background: "var(--bg-3)", padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--border)", whiteSpace: "nowrap", color: "var(--text-2)" }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {exposureFlags.map((flag, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? "var(--bg-3)" : "transparent" }}>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}>{flag.exposure}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}><span className={`cp-risk ${riskClass(flag.risk)}`}>{flag.risk}</span></td>
                    <td className="note" style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text-2)", fontSize: "10.5px" }}>{flag.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 3 · WEATHER TRENDS & PATTERNS
          ════════════════════════════════════════════════════════════ */}
      <div className={`tab-panel ${activeTab === "weather" ? "active" : ""}`} style={{ display: activeTab === "weather" ? "block" : "none", padding: "12px 14px 18px" }}>
        <div className="three-col" style={{ display: "grid", gridTemplateColumns: "27% 1fr 28%", gap: "12px" }}>
          {/* LEFT: Seasonal Calendar */}
          <div className="panel">
            <div className="ph ph-amber" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "rgba(245,158,11,0.08)", color: "var(--warn)", borderLeft: "3px solid var(--warn)" }}>
              Seasonal Calendar — Kenya Bimodal Rainfall
            </div>
            <div className="pb" style={{ padding: "10px" }}>
              {seasonsWithStatus.map((season, idx) => (
                <div key={idx} className="cp-season-card" style={{ display: "flex", border: "1px solid var(--border)", background: "var(--bg-2)", marginBottom: "8px" }}>
                  <div className={`cp-season-label cp-s-${season.seasonKey}`} style={{ width: "58px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "8px 6px", fontSize: "10px", fontWeight: 700, textAlign: "center" }}>
                    <span className="cp-s-date" style={{ fontSize: "11px", fontWeight: 800, lineHeight: "1.3" }}>{season.period}</span>
                    {season.isActive && <span className="cp-s-badge" style={{ fontSize: "8px", background: "rgba(255,255,255,0.25)", borderRadius: "2px", padding: "1px 4px", marginTop: "3px" }}>ACTIVE NOW</span>}
                  </div>
                  <div className="cp-season-body" style={{ padding: "9px 11px", fontSize: "11px", lineHeight: "1.5", color: "var(--text-2)" }}>
                    <div className="cp-season-name" style={{ fontWeight: 700, fontSize: "11.5px", color: "var(--text)", marginBottom: "4px" }}>{season.name}</div>
                    {season.badge && <div className="cp-season-badge" style={{ fontSize: "9.5px", color: "var(--text-3)", fontStyle: "italic", marginBottom: "4px" }}>{season.badge}</div>}
                    {season.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTRE: Aviation Weather Risk */}
          <div className="panel">
            <div className="ph ph-blue" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--accent)", borderLeft: "3px solid var(--accent)" }}>
              Aviation Weather Risk — Current &amp; Airport Specific
            </div>
            <div className="pb" style={{ padding: "0" }}>
              <div className="wx-section" style={{ marginBottom: "10px" }}>
                <div className="wx-head" style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text-2)", background: "var(--bg-3)", padding: "4px 10px" }}>CURRENT — Long rains active (Mar–May)</div>
                <div className="wx-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px", borderBottom: "1px solid var(--border)", fontSize: "11px" }}>
                  <span className="wx-key" style={{ color: "var(--text-2)" }}>Flight delays</span>
                  <span className={`wx-val ${wx_flight_delays.toLowerCase().includes("elevated") ? "elevated" : ""}`} style={{ fontWeight: 600, color: "var(--text)" }}>{wx_flight_delays}</span>
                </div>
                <div className="wx-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px", borderBottom: "1px solid var(--border)", fontSize: "11px" }}>
                  <span className="wx-key">Diversions</span>
                  <span className={`wx-val ${wx_diversions.toLowerCase().includes("possible") ? "possible" : ""}`}>{wx_diversions}</span>
                </div>
                <div className="wx-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px", borderBottom: "1px solid var(--border)", fontSize: "11px" }}>
                  <span className="wx-key">Convective activity</span>
                  <span className={`wx-val ${wx_convective.toLowerCase().includes("active") ? "active" : ""}`}>{wx_convective}</span>
                </div>
                <div className="wx-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px", borderBottom: "1px solid var(--border)", fontSize: "11px" }}>
                  <span className="wx-key">Airstrip surfaces</span>
                  <span className={`wx-val ${wx_airstrip_surfaces.toLowerCase().includes("soft") ? "soft" : ""}`}>{wx_airstrip_surfaces}</span>
                </div>
                <div className="wx-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px", borderBottom: "1px solid var(--border)", fontSize: "11px" }}>
                  <span className="wx-key">GNSS integrity</span>
                  <span className={`wx-val ${wx_gnss.toLowerCase().includes("normal") ? "normal" : ""}`}>{wx_gnss}</span>
                </div>
                <div className="wx-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px", borderBottom: "1px solid var(--border)", fontSize: "11px" }}>
                  <span className="wx-key">HKNA FIR</span>
                  <span className={`wx-val ${wx_fir.toLowerCase().includes("fully") ? "full" : ""}`}>{wx_fir}</span>
                </div>
              </div>

              <div className="wx-section" style={{ marginBottom: "10px" }}>
                <div className="wx-head" style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text-2)", background: "var(--bg-3)", padding: "4px 10px" }}>GROUND &amp; ACCESS (current)</div>
                <div className="wx-row"><span className="wx-key">Nairobi urban corridors</span><span className={`wx-val ${wx_nairobi_urban.toLowerCase().includes("high") ? "high" : ""}`}>{wx_nairobi_urban}</span></div>
                <div className="wx-row"><span className="wx-key">JKIA access roads</span><span className={`wx-val ${wx_jkia_access.toLowerCase().includes("inter") ? "inter" : ""}`}>{wx_jkia_access}</span></div>
                <div className="wx-row"><span className="wx-key">Rural routes</span><span className={`wx-val ${wx_rural_routes.toLowerCase().includes("high") ? "high" : ""}`}>{wx_rural_routes}</span></div>
                <div className="wx-row"><span className="wx-key">Mombasa coastal</span><span className={`wx-val ${wx_mombasa_coastal.toLowerCase().includes("moderate") ? "moderate-c" : ""}`}>{wx_mombasa_coastal}</span></div>
              </div>

              {wx_key_event && (
                <div className="key-event" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: "8px 11px", margin: "8px 11px 10px", fontSize: "11px", lineHeight: "1.5", color: "var(--text)" }}>
                  <div className="key-event-title" style={{ fontWeight: 800, fontSize: "11px", color: "var(--danger)", marginBottom: "3px" }}>KEY EVENT — {wx_key_event.split("—")[0]?.trim()}</div>
                  {wx_key_event}
                </div>
              )}

              <div style={{ padding: "0 11px 11px" }}>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Airport-Specific Advisories</div>

                {wx_hkjk && (
                  <div className="airport-adv" style={{ border: "1px solid var(--border)", background: "var(--bg-2)", marginBottom: "6px" }}>
                    <div className="adv-head" style={{ background: "var(--bg-3)", padding: "5px 10px", fontSize: "11px", fontWeight: 700, color: "var(--text)", borderBottom: "1px solid var(--border)" }}>HKJK (Nairobi)</div>
                    <div className="adv-body" style={{ padding: "7px 10px", fontSize: "11px", color: "var(--text-2)", lineHeight: "1.5" }}>{wx_hkjk}</div>
                  </div>
                )}
                {wx_hkmo && (
                  <div className="airport-adv">
                    <div className="adv-head">HKMO (Mombasa)</div>
                    <div className="adv-body">{wx_hkmo}</div>
                  </div>
                )}
                {wx_hknw && (
                  <div className="airport-adv">
                    <div className="adv-head">HKNW (Wilson)</div>
                    <div className="adv-body">{wx_hknw}</div>
                  </div>
                )}
                {wx_maasai_mara && (
                  <div className="airport-adv">
                    <div className="adv-head">Maasai Mara strips</div>
                    <div className="adv-body">{wx_maasai_mara}</div>
                  </div>
                )}
                {wx_northern_kenya && (
                  <div className="airport-adv">
                    <div className="adv-head">N. Kenya (Wajir/Mandera)</div>
                    <div className="adv-body">{wx_northern_kenya}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Seasonal Risk Profile */}
          <div className="panel">
            <div className="ph ph-slate" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text-2)", borderLeft: "3px solid var(--text-2)" }}>
              Seasonal Risk Profile — Operational Impact
            </div>
            <div className="pb" style={{ padding: "10px 11px" }}>
              <div className="chart-title" style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text)", marginBottom: "6px", textAlign: "center" }}>Quarterly risk profile (1=Low &nbsp; 5=Severe)</div>
              {renderQuarterlyBars()}

              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text)", marginBottom: "5px" }}>Monthly Rainfall Risk Profile</div>
              <div style={{ fontSize: "9.5px", color: "var(--text-2)", marginBottom: "4px" }}>Scale: 1=Low &nbsp;2=Moderate &nbsp;3=Elevated &nbsp;4=High &nbsp;5=Severe</div>
              <div className="month-grid" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2px", marginBottom: "2px" }}>
                {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                  <div key={i} className="mg-cell mg-hdr" style={{ textAlign: "center", fontSize: "9px", fontWeight: 700, padding: "3px 1px", background: "var(--bg-3)", color: "var(--text-2)" }}>{m}</div>
                ))}
              </div>
              <div className="month-grid" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2px", marginBottom: "12px" }}>
                {monthlyRain.map((val, idx) => {
                  let cls = "mg-1";
                  if (val <= 1) cls = "mg-1";
                  else if (val === 2) cls = "mg-2";
                  else if (val === 3) cls = "mg-3";
                  else if (val === 4) cls = "mg-4";
                  else if (val >= 5) cls = "mg-5";
                  return <div key={idx} className={`mg-cell ${cls}`} style={{ textAlign: "center", fontSize: "9px", fontWeight: 700, padding: "3px 1px" }}>{val}</div>;
                })}
              </div>

              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Significant Weather Events — Aviation Impact</div>
              {weatherEvents.map((evt, idx) => (
                <div key={idx} className="wx-event" style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: "11px" }}>
                  <span className="wx-event-date" style={{ flexShrink: 0, fontSize: "10px", color: "var(--text-2)", width: "68px" }}>{evt.date}</span>
                  <span className="wx-event-text" style={{ color: "var(--text)", lineHeight: "1.45" }}>{evt.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 4 · HISTORICAL AVIATION DATA
          ════════════════════════════════════════════════════════════ */}
      <div className={`tab-panel ${activeTab === "history" ? "active" : ""}`} style={{ display: activeTab === "history" ? "block" : "none", padding: "12px 14px 18px" }}>
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "56% 1fr", gap: "12px" }}>
          {/* LEFT: Verified Incident Log */}
          <div className="panel">
            <div className="ph ph-navy" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text)", borderLeft: "3px solid var(--text-2)" }}>
              Verified Incident Log — Most Recent First &nbsp;
              <span style={{ fontWeight: 400, fontSize: "10px" }}>· Sources: Aviation Herald · ASN · AAID Kenya · Open reporting</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="dt" style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "8%", background: "var(--bg-3)", padding: "5px 8px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--border)", whiteSpace: "nowrap", color: "var(--text-2)" }}>Date</th>
                    <th style={{ width: "12%" }}>Airport/Location</th>
                    <th style={{ width: "12%" }}>Aircraft</th>
                    <th style={{ width: "12%" }}>Operator/Flight</th>
                    <th style={{ width: "11%" }}>Category</th>
                    <th style={{ width: "7%" }}>Severity</th>
                    <th>Description</th>
                    <th style={{ width: "4%" }}>Src</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentLog.map((inc, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "var(--bg-3)" : "transparent" }}>
                      <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}>{inc.date}</td>
                      <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}>{inc.airport}</td>
                      <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}>{inc.aircraft}</td>
                      <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}>{inc.operator}</td>
                      <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}>{inc.category}</td>
                      <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }} className={severityClass(inc.severity)}>{inc.severity}</td>
                      <td className="note" style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text-2)", fontSize: "10.5px" }}>{inc.description}</td>
                      <td style={{ padding: "5px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top", lineHeight: "1.45", color: "var(--text)" }}><span className={`src-badge ${srcClass(inc.source)}`} style={{ display: "inline-block", fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "2px" }}>{inc.source}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Charts + Bird Strike Hotspots */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Charts */}
            <div className="panel">
              <div className="ph ph-navy" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text)", borderLeft: "3px solid var(--text-2)" }}>
                Hull Liability · Bird Strikes · Known Hotspots
              </div>
              <div className="pb">
                <div className="charts-row" style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div className="chart-half" style={{ flex: 1 }}>
                    <div className="chart-title" style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text)", marginBottom: "6px", textAlign: "center" }}>Incident category</div>
                    <svg viewBox="0 0 195 165" width="100%">
                      <line x1="12" y1="128" x2="190" y2="128" stroke="#C8D4E0" strokeWidth="1"/>
                      {[0,1,2,3,4,5].map((v) => {
                        const y = 128 - v * 24;
                        return (
                          <React.Fragment key={v}>
                            <line x1="12" y1={y} x2="190" y2={y} stroke="#EBF0F5" strokeWidth="0.7" strokeDasharray="3,2"/>
                            <text x="9" y={y+3} textAnchor="end" fontSize="8" fill="#9AABBA">{v}</text>
                          </React.Fragment>
                        );
                      })}
                      {/* Bar heights: we need category counts from incidentLog. We'll compute them. */}
                      {(() => {
                        const categories = ["Fatal crash", "Runway excursion", "Bird strike", "Serious—other", "Security divert", "Other"];
                        const counts = [0,0,0,0,0,0];
                        incidentLog.forEach(inc => {
                          const cat = inc.category.toLowerCase();
                          if (cat.includes("fatal")) counts[0]++;
                          else if (cat.includes("runway")) counts[1]++;
                          else if (cat.includes("bird")) counts[2]++;
                          else if (cat.includes("serious") || cat.includes("pressurisation") || cat.includes("gear") || cat.includes("tyre") || cat.includes("landing")) counts[3]++;
                          else if (cat.includes("security")) counts[4]++;
                          else counts[5]++;
                        });
                        const maxCount = Math.max(...counts, 1);
                        const scale = 120 / maxCount; // max height 120
                        const barWidth = 20;
                        const xPositions = [18, 48, 78, 108, 138, 168];
                        const colors = ["#7A1A10", "#1B6CA8", "#C8690A", "#1B6CA8", "#1B6CA8", "#7A8A98"];
                        return counts.map((cnt, i) => {
                          const height = cnt * scale;
                          const y = 128 - height;
                          return (
                            <React.Fragment key={i}>
                              <rect x={xPositions[i]} y={y} width={barWidth} height={height} fill={colors[i]} />
                              <text x={xPositions[i] + barWidth/2} y={y-3} textAnchor="middle" fontSize="9" fill={colors[i]} fontWeight="bold">{cnt}</text>
                              <text fontSize="7.5" fill="#7A8A98" transform={`translate(${xPositions[i] + barWidth/2},133) rotate(-38)`} textAnchor="end">{categories[i]}</text>
                            </React.Fragment>
                          );
                        });
                      })()}
                    </svg>
                  </div>
                  <div className="chart-half" style={{ flex: 1 }}>
                    <div className="chart-title" style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text)", marginBottom: "6px", textAlign: "center" }}>Severity breakdown</div>
                    {renderSeverityDonut()}
                  </div>
                </div>
              </div>
            </div>

            {/* Bird Strike Hotspots */}
            <div className="panel">
              <div className="ph ph-amber" style={{ padding: "6px 11px", fontSize: "11.5px", fontWeight: 700, borderBottom: "1px solid var(--border)", background: "rgba(245,158,11,0.08)", color: "var(--warn)", borderLeft: "3px solid var(--warn)" }}>
                Known Bird Strike Hotspots — Hull liability exposure
              </div>
              <div className="pb" style={{ padding: "9px 10px" }}>
                <div className="bs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {birdHotspots.map((spot, idx) => (
                    <div key={idx} className={`bs-card ${idx === birdHotspots.length - 1 ? "bs-5" : ""}`} style={{ border: "1px solid var(--border)", background: "var(--bg-2)", padding: "9px 11px", gridColumn: idx === birdHotspots.length - 1 ? "1 / -1" : "auto" }}>
                      <div className="bs-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "5px", gap: "6px" }}>
                        <span className="bs-loc" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text)" }}>{spot.location}</span>
                        <span className={`cp-risk ${riskClass(spot.risk)}`} style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "2px", whiteSpace: "nowrap" }}>{spot.risk}</span>
                      </div>
                      <div className="bs-species" style={{ fontSize: "10px", color: "var(--text-2)", fontStyle: "italic", marginBottom: "4px" }}>Species: {spot.species}</div>
                      <div className="bs-note" style={{ fontSize: "10.5px", color: "var(--text-2)", lineHeight: "1.45" }}>{spot.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};