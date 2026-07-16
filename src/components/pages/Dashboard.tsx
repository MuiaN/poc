"use client";

import { useState, useRef, useMemo, useEffect, useCallback, Fragment } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { PageHeader, cn } from "@/components/ui";
import type { Role } from "@/lib/types";
import Papa from "papaparse";

// Enhanced airfield data with full POC-style risk assessment
const AIRFIELDS = [
  { 
    name: "Jomo Kenyatta International Airport", code: "HKJK", city: "Nairobi", type: "Major Airport", coords: [-1.3192, 36.9278], 
    riskScore: 7, timezone: "GMT+3", category: "International", elevation:"5330 ft", runways:"06/24 (4117m) – Asphalt", 
    airspace: "Class C/D CTR + TMA", atc: "Full ATC", nightoperations:"Yes", fuel: "Full international services", 
    image:"/images/jomo.jpg",
    riskLevel: "Moderate",
    threatProfile: "Operations have stabilised following the formal conclusion of the February labour dispute. While seasonal rains continue to affect scheduling, the location's risk profile is now defined by the moderate-risk urban environment, marked by opportunistic crime, infrastructure fragility, and early election cycle mobilisation, rather than systemic collapse. Travellers face heightened exposure to in-traffic robberies, spontaneous political crowd-puller events, and localised unrest along primary transit routes.",
    riskReport: "JKIA operations have been significantly impacted by torrential rains and flash floods through March, causing frequent diversions and terminal delays. While a major workers strike was suspended in February, subsequent labour notices indicated unresolved grievances and a fragile operational environment. The facility remains highly susceptible to short-notice disruptions from adverse weather, industrial action, and impactful access challenges. As a high-visibility international gateway, it retains symbolic target value, though current posture suggests no specific imminent threats.<br><br>Beyond the terminal, the broader metropolitan area faces a shifting security landscape defined by infrastructure fragility and unusually early electioneering for the 2027 cycle. Severe road damage from seasonal rains intensified gridlock at key transit nodes, significantly elevating the risk of carjackings and smash-and-grab robberies targeting stationary vehicles.<br><br>Political crowd-puller events and spontaneous protests pose a recurring risk of localised unrest and flash-violence in peri-urban and low-income. While police patrols have intensified along major highways, petty theft and burglaries remain prevalent in high-density areas and affluent satellite towns. Furthermore, sophisticated white-collar crime in peri-urban zones necessitate high situational awareness and thorough due diligence when engaging in business opportunities. Travellers should avoid political gatherings, secure all valuables in transit, and strictly utilise pre-verified transport to mitigate these opportunistic and evolving threats.",
    extraInfo: `<h3>Operational Context</h3><p>Primary international gateway with continuous high-volume IFR passenger and cargo operations.</p><h3>Operational Profile</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Assessment</th></tr><tr><td>Ops Mix</td><td>Commercial-heavy (pax + cargo)</td></tr><tr><td>Training Activity</td><td>Low</td></tr><tr><td>Rotary Presence</td><td>Low–Moderate</td></tr><tr><td>UAV Activity</td><td>Very Low</td></tr><tr><td>Traffic Type</td><td>IFR-dominant</td></tr></table><h3>Operational Risk Drivers</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>IFR/VFR Mix</td><td>High IFR complexity</td></tr><tr><td>Congestion</td><td>Very High</td></tr><tr><td>Approach/Departure Risk</td><td>Moderate–High</td></tr><tr><td>Runway Condition</td><td>Good</td></tr><tr><td>Wildlife Hazard</td><td>Low</td></tr><tr><td>Ground Exposure</td><td>High</td></tr></table><h3>External & Environmental Factors</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>Weather Risk</td><td>Moderate</td></tr><tr><td>Terrain / Obstacles</td><td>Controlled</td></tr><tr><td>Security Risk</td><td>Low</td></tr><tr><td>Emergency Response</td><td>Strong</td></tr><tr><td>Alternates Availability</td><td>Strong</td></tr><tr><td>Operational Reliability</td><td>High</td></tr></table><h3>Risk Summary</h3><strong>Primary Risk Category:</strong> High consequence<p><strong>Risk Type:</strong> Severity-driven</p><p><strong>Overall Risk Level:</strong> High</p><h3>Top Risk Drivers:</h3><ul><li>High traffic volume</li><li>IFR sequencing complexity</li><li>Runway/taxi congestion</li><li>Large aircraft operations</li><li>Weather disruptions</li></ul><h3>Operational Character</h3><p>Moderate-traffic airport where weather variability drives operational risk.</p><h3>Accidents / Incidents</h3><ul><li>No major accidents (last 2 years)</li><li>Historical: runway/taxi-related incidents</li></ul>`,
    domains: {
      D1: { name: "Airside Operations & Safety", score: 5 },
      D2: { name: "Airport Infrastructure & Assets", score: 7 },
      D3: { name: "Immediate Environs (0–10kms)", score: 4 },
      D4: { name: "Civil Aviation Authority", score: 7 },
      D5: { name: "Wider Airspace", score: 6 }
    },
    worstCredibleDomain: "D2 – Airport Infrastructure & Assets",
    meanImpactSeverity: 0.28,
    status: "NORMAL",
    activeDisruptions: ["Seasonal Weather Delays", "Labour Grievances", "Political Mobilisation"],
    lastUpdate: "18 July 2026",
    domainImpactAssessment: [
      { domain: "D1 – Airside Operations & Safety", likelihoods: 2, impact: 3, liColor: "6", severity: "MEDIUM", rationale: "Weather-driven landing constraints and occasional labour-related staffing gaps present minor but recurring operational friction." },
      { domain: "D2 – Airport Infrastructure & Assets", likelihoods: 3, impact: 4, liColor: "12", severity: "HIGH", rationale: "Torrential rains have exposed terminal drainage vulnerabilities and power supply reliability concerns during peak operations." },
      { domain: "D3 – Immediate Environs (0–10km)", likelihoods: 2, impact: 2, liColor: "4", severity: "MEDIUM", rationale: "Road infrastructure damage has created gridlock at key transit nodes; opportunistic robbery remains limited to specific high-risk corridors." },
      { domain: "D4 – Civil Aviation Authority", likelihoods: 2, impact: 3, liColor: "6", severity: "MEDIUM", rationale: "KCAA oversight remains strong; all AOC statuses current with no pending regulatory notices." },
      { domain: "D5 – Wider Airspace", likelihoods: 2, impact: 3, liColor: "6", severity: "MEDIUM", rationale: "Regional airspace remains secure; GNSS and comms infrastructure fully operational across the domestic network." }
    ],
    servicingAndCarriers: {
      hubCarriers: "Kenya Airways (primary), KQ Cargo",
      globalCarriers: "British Airways, KLM, Qatar Airways, Ethiopian Airlines, Turkish Airlines, Lufthansa, Air France",
      regionalFeeders: "Jambojet, Kenya Airways Express, precision Air, RwandAir",
      strategicUse: "Primary international hub, cargo consolidation, diplomatic and VIP operations"
    },
    groundsideSecurityRisks: {
      airsideLandside: "Low to moderate pickpocketing risk in congested arrivals/baggage claim during peak hours.",
      customsProcessing: "Occasional delays in customs clearance during adverse weather; standard processing norms otherwise maintained.",
      groundTransport: "Elevated in-traffic robbery risk on Nairobi approach routes; use only airport-authorised transport."
    },
    otherRealities: {
      departureTiming: "2.5–3 hour lead time recommended. Weather delays and IFR sequencing complexity can extend pre-departure.",
      infrastructureReliability: "Backup power systems and secondary taxiways operational; minor weather-related delays common during peak rainfall.",
      transitRisk: "Terminal security is robust. Ground-based transit remains the higher-risk segment during periods of political activity."
    }
  },
  { 
    name: "Moi International Airport", code: "HKMO", city: "Mombasa", type: "Major Airport", coords: [-4.0348, 39.5942], 
    riskScore: 6, timezone: "GMT+3", category: "International / Domestic", elevation:"200 ft", runways:"03/21 (3350m) – Asphalt", 
    airspace: "Class C", atc: "Controlled", nightoperations:"Yes", fuel: "Full services", 
    image:"/images/moi.jpg",
    riskLevel: "Moderate",
    threatProfile: "Operations remain stable serving as the primary diversion point for JKIA. The risk profile is increasingly defined by the urban security landscape of Mombasa notably the resurgence of machete-wielding gangs (the Panga Boys) and infrastructure fragility during the 2026 rains rather than direct threats to the terminal. Travellers face specific exposure to opportunistic robberies in gridlocked traffic and petty theft in tourist-heavy zones, alongside a latent terrorism risk associated with regional border proximity.",
    riskReport: "Moi International Airport absorbed significant traffic throughout March, operating efficiently despite the surge in diverted carriers. While the terminal interior is a secure and well-managed hard target, external access was hampered by torrential rains. Stakeholders are advised that while current conditions present only minor operational hurdles, flight planning should remain flexible to accommodate weather-driven diversions and potential industrial action. These patterns have caused record damage to coastal infrastructure, resulting in persistent gridlock on the Makupa Causeway and Airport Road, which elevates the risk of street crimes and in-traffic robberies.<br><br>The broader security landscape remains fluid. A significant concern is the resurgence of semi-organised criminal gangs, specifically machete-wielding youths in areas like Kisauni, Nyali, and Likoni. These groups have recently targeted both residents and tourists, leading to zero-tolerance directives from regional police commanders in early 2026. Furthermore, Mombasa's inclusion on international (No Lists) for 2026 highlights the strain of overtourism on infrastructure and social cohesion, which has exacerbated youth unemployment and opportunistic muggings.<br><br>While the terrorism threat remains latent, the airport's role as a regional hub necessitates vigilance due to its proximity to the Somali borderlands and the Boni Forest corridors, where militant activity persists. Travellers should maintain a low profile, avoid high-density or poorly lit peri-urban zones, and utilise only pre-verified, secure transport to mitigate these evolving coastal threats.",
    extraInfo: `<h3>Operational Context</h3><p>Coastal airport handling commercial, training, and general aviation operations.</p><h3>Operational Profile</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Assessment</th></tr><tr><td>Ops Mix</td><td>Mixed (commercial + GA)</td></tr><tr><td>Training Activity</td><td>Moderate</td></tr><tr><td>Rotary Presence</td><td>Moderate</td></tr><tr><td>UAV Activity</td><td>Low</td></tr><tr><td>Traffic Type</td><td>Mixed</td></tr></table><h3>Operational Risk Drivers</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>IFR/VFR Mix</td><td>Moderate</td></tr><tr><td>Congestion</td><td>Medium</td></tr><tr><td>Approach/Departure Risk</td><td>Moderate</td></tr><tr><td>Runway Condition</td><td>Good</td></tr><tr><td>Wildlife Hazard</td><td>Low–Moderate</td></tr><tr><td>Ground Exposure</td><td>Medium</td></tr></table><h3>External & Environmental Factors</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>Weather Risk</td><td>Moderate–High</td></tr><tr><td>Terrain / Obstacles</td><td>Low</td></tr><tr><td>Security Risk</td><td>Low</td></tr><tr><td>Emergency Response</td><td>Strong</td></tr><tr><td>Alternates Availability</td><td>Moderate</td></tr><tr><td>Operational Reliability</td><td>Medium–High</td></tr></table><h3>Risk Summary</h3><p><strong>Primary Risk Category:</strong> Weather</p><p><strong>Risk Type:</strong> Mixed</p><p><strong>Overall Risk Level:</strong> Moderate</p><h3>Top Risk Drivers:</h3><ul><li>Coastal weather (winds, storms)</li><li>Mixed traffic operations</li><li>Bird activity</li><li>IFR/VFR interaction</li></ul><h3>Operational Character</h3><p>Moderate-traffic airport where weather variability drives operational risk.</p><h3>Accidents / Incidents</h3><ul><li>No major accidents (last 2 years)</li><li>Weather-related diversions common</li></ul>`,
    domains: {
      D1: { name: "Airside Operations & Safety", score: 5 },
      D2: { name: "Airport Infrastructure & Assets", score: 6 },
      D3: { name: "Immediate Environs (0–10kms)", score: 3 },
      D4: { name: "Civil Aviation Authority", score: 6 },
      D5: { name: "Wider Airspace", score: 5 }
    },
    worstCredibleDomain: "D2 – Airport Infrastructure & Assets",
    meanImpactSeverity: 0.24,
    status: "NORMAL",
    activeDisruptions: ["Coastal Weather Patterns", "Organized Gang Activity", "Gridlock on Causeway"],
    lastUpdate: "15 July 2026",
    domainImpactAssessment: [
      { domain: "D1 – Airside Operations & Safety", likelihoods: 2, impact: 2, liColor: "4", severity: "MEDIUM", rationale: "Occasional training-related incidents and minor security gaps in arrivals processing." },
      { domain: "D2 – Airport Infrastructure & Assets", likelihoods: 2, impact: 3, liColor: "6", severity: "HIGH", rationale: "Coastal weather exposure has degraded drainage infrastructure and elevated flooding risk during monsoon season." },
      { domain: "D3 – Immediate Environs (0–10km)", likelihoods: 2, impact: 2, liColor: "4", severity: "MEDIUM", rationale: "Tourism-driven petty crime and gang activity in peri-urban zones; gridlock creates stationary-target vulnerability." },
      { domain: "D4 – Civil Aviation Authority", likelihoods: 2, impact: 3, liColor: "6", severity: "MEDIUM", rationale: "KCAA oversight maintained; AOC status current with no regulatory concerns." },
      { domain: "D5 – Wider Airspace", likelihoods: 2, impact: 2, liColor: "4", severity: "MEDIUM", rationale: "Regional airspace secure; minor bird activity during monsoon periods." }
    ],
    servicingAndCarriers: {
      hubCarriers: "Kenya Airways, Coastal Aviation",
      globalCarriers: "Emirates, Qatar Airways, KLM, Ethiopian Airlines, Turkish Airlines",
      regionalFeeders: "Jambojet, Fly540, Precision Air, Northern Air",
      strategicUse: "Secondary hub for diverted international traffic, regional passenger hub, charter operations"
    },
    groundsideSecurityRisks: {
      airsideLandside: "Moderate pickpocketing and distraction theft in baggage claim, particularly targeting tourists.",
      customsProcessing: "Standard procedures; minor delays during peak seasons due to tourism influx.",
      groundTransport: "High robbery risk on Makupa Causeway approach during gridlock; use airport-verified transport."
    },
    otherRealities: {
      departureTiming: "2.5 hour lead time recommended. Weather diversions can extend processing.",
      infrastructureReliability: "Backup generators operational; occasional power fluctuations during weather events.",
      transitRisk: "Terminal security strong. Ground-based transit to Mombasa city presents elevated exposure."
    }
  },
  { 
    name: "Wilson Airport", code: "HKNW", city: "Nairobi", type: "Minor Airport", coords: [-1.3217, 36.8148], 
    riskScore: 8, timezone: "GMT+3", category: "Domestic (Regional)", elevation:"5535 ft", runways:"14/32 (1560m), 07/25 (1463m) – Asphalt", 
    airspace: "Class D CTR", atc: "Tower-controlled", nightoperations:"Limited", fuel: "AVGAS & Jet A1", 
    image:"/images/wilson.jpg",
    riskLevel: "Moderate",
    threatProfile: "Operations face cumulative pressure from deteriorating runway infrastructure and power unreliability, as flagged by the Senate in March 2026. While landing protocols mitigate immediate flight risks, the location is highly susceptible to operational friction caused by record rainfall and flash flooding at the adjacent interchange. The broader security landscape is defined by infrastructure fragility and unusually early 2027 electioneering, elevating the risk of carjackings, opportunistic robberies, and localised unrest during political crowd-puller events",
    riskReport: "​In March 2026, the Senate flagged concerns regarding Wilson Airport's deteriorating runways and power unreliability. While the KCAA maintains that strict landing protocols mitigate immediate risks, operational friction is exacerbated by record rainfall causing flash floods at the T-Mall interchange.<br><br>Beyond the terminal, infrastructure fragility and unusually early 2027 electioneering define a shifting security landscape. Severe road damage has intensified gridlock at key transit nodes, significantly elevating the risk of carjackings and opportunistic robberies targeting stationary vehicles. Political crowd-puller events and sudden protest activity pose a recurring risk of localised unrest in sub-locations and nearby peri-urban areas. Despite police patrols intensifying, petty theft, burglaries, and white-collar crime remain prevalent. Travellers must maintain high situational awareness, avoid political gatherings, and utilise pre-verified transport. Despite these pressures, airport security remains intact with no reported perimeter breaches, though the last mile transit remains the most volatile segment of the journey.",
    extraInfo: `<h3>Operational Context</h3><p>High-density general aviation hub supporting training, charter, and regional commercial operations within Nairobi.</p><h3>Operational Profile</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Assessment</th></tr><tr><td>Ops Mix</td><td>GA-heavy + regional commercial</td></tr><tr><td>Training Activity</td><td>High</td></tr><tr><td>Rotary Presence</td><td>Moderate–High</td></tr><tr><td>UAV Activity</td><td>Moderate</td></tr><tr><td>Traffic Type</td><td>Mixed (high interaction)</td></tr></table><h3>Operational Risk Drivers</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>IFR/VFR Mix</td><td>Very High</td></tr><tr><td>Congestion</td><td>Very High</td></tr><tr><td>Approach/Departure Risk</td><td>High</td></tr><tr><td>Runway Condition</td><td>Good (length constrained)</td></tr><tr><td>Wildlife Hazard</td><td>Low</td></tr><tr><td>Ground Exposure</td><td>Very High</td></tr></table><h3>External & Environmental Factors</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>Weather Risk</td><td>Moderate</td></tr><tr><td>Terrain / Obstacles</td><td>High</td></tr><tr><td>Security Risk</td><td>Low</td></tr><tr><td>Emergency Response</td><td>Moderate</td></tr><tr><td>Alternates Availability</td><td>Good</td></tr><tr><td>Operational Reliability</td><td>Medium</td></tr></table><h3>Risk Summary</h3><p><strong>Primary Risk Category:</strong> Congestion</p><p><strong>Risk Type:</strong> Frequency-driven</p><p><strong>Overall Risk Level:</strong> High</p><h3>Top Risk Drivers:</h3><ul><li>Training traffic congestion</li><li>Mixed IFR/VFR operationsn</li><li>High circuit density</li><li>Urban ground exposure</li><li>Short runway constraints</li><li>Weather exposure (rotary ops)</li></ul><h3>Operational Character</h3><p>Highly congested mixed-traffic environment with elevated mid-air and departure risk.</p><h3>Accidents / Incidents</h3><ul><li><strong>Runway Excursion (2026):</strong> Dash 8 hard landing → excursion (no injuries)</li><li><strong>Helicopter Crash – Wilson bound (2026): </strong> AS350 (5Y-DSB), weather-related (6 fatalities)</li><li><strong>Mid-air Collision (2024):</strong> Training C172 + Dash 8 (2 fatalities)</li><li><strong>Departure Crash - (2025): </strong> Cessna Citation (6 fatalities)</li></ul>`,
    domains: {
      D1: { name: "Airside Operations & Safety", score: 7 },
      D2: { name: "Airport Infrastructure & Assets", score: 6 },
      D3: { name: "Immediate Environs (0–10kms)", score: 8 },
      D4: { name: "Civil Aviation Authority", score: 7 },
      D5: { name: "Wider Airspace", score: 8 }
    },
    worstCredibleDomain: "D3 – Immediate Environs (0–10kms)",
    meanImpactSeverity: 0.32,
    status: "ELEVATED",
    activeDisruptions: ["Runway Infrastructure Degradation", "Power Unreliability", "Flash Flooding", "Political Mobilisation"],
    lastUpdate: "19 July 2026",
    domainImpactAssessment: [
      { domain: "D1 – Airside Operations & Safety", likelihoods: 3, impact: 3, liColor: "9", severity: "HIGH", rationale: "High-density training operations with frequent near-miss incidents and occasional controller workload saturation." },
      { domain: "D2 – Airport Infrastructure & Assets", likelihoods: 3, impact: 2, liColor: "6", severity: "MEDIUM", rationale: "Senate-flagged runway deterioration and intermittent power supply; backup systems partially functional." },
      { domain: "D3 – Immediate Environs (0–10km)", likelihoods: 3, impact: 3, liColor: "9", severity: "HIGH", rationale: "Severe gridlock at T-Mall interchange during peak hours; flash flooding creates access constraints and robbery opportunities." },
      { domain: "D4 – Civil Aviation Authority", likelihoods: 2, impact: 3, liColor: "6", severity: "MEDIUM", rationale: "KCAA oversight maintained; current AOC status; pending safety audit post-Senate concerns." },
      { domain: "D5 – Wider Airspace", likelihoods: 3, impact: 3, liColor: "9", severity: "HIGH", rationale: "High-density circuit training creates procedural complexity; multiple conflicting traffic patterns simultaneously." }
    ],
    servicingAndCarriers: {
      hubCarriers: "Precision Air, Northern Air, Safari Link",
      globalCarriers: "Limited international ops; charter flights only",
      regionalFeeders: "Multiple GA operators, training schools",
      strategicUse: "Primary GA hub, flight training center, regional charter operations, helicopter base"
    },
    groundsideSecurityRisks: {
      airsideLandside: "Low security concern; tight facility control and limited public access.",
      customsProcessing: "Not applicable; domestic operations only.",
      groundTransport: "High carjacking and robbery risk at T-Mall interchange; use secure transport to/from terminal."
    },
    otherRealities: {
      departureTiming: "1.5–2 hour lead time for GA ops; training sorties subject to circuit congestion delays.",
      infrastructureReliability: "Backup power limited; weather-related disruptions common during monsoon season.",
      transitRisk: "Terminal security robust. Ground-based transit to Nairobi presents moderate-to-elevated exposure during peak traffic."
    }
  },
  { 
    name: "Lokichoggio Airport", code: "HKLK", city: "Turkana", type: "Minor Airport", coords: [4.20412, 34.348202], 
    riskScore: 3, timezone: "GMT+3", category: "Humanitarian (Civil)", elevation:"~2116 ft", runways:"09/27 (1888m) – Asphalt", 
    airspace: "Class G", atc: "Uncontrolled", nightoperations:"Limited", fuel: "Basic", 
    image:"/images/lokichoggio.jpg",
    riskLevel: "Low",
    threatProfile: "Operations at Lokichoggio Airport remain stable, primarily supporting humanitarian and logistical flights into northern Kenya and South Sudan. However, the broader west region of Turkana County is currently under a state of heightened surveillance due to ongoing multi-agency security crackdowns (Operation Maliza Uhalifu) aimed at curbing banditry and the illegal possession of firearms, which remains a primary driver of regional insecurity. While local communities steadily voluntarily surrender weapons, the risk of armed crime in peri-urban zones remains a factor for ground transit",
    riskReport: "Operations at Lokichoggio Airport remain stable, primarily supporting humanitarian and logistical flights into northern Kenya and South Sudan. However, the broader west region of Turkana County is currently under a state of heightened surveillance due to ongoing multi-agency security crackdowns aimed at curbing banditry. The facility's security environment is heavily influenced by its role as a strategic border node. Instability in South Sudan, marked by the collapse of power-sharing arrangements and recent clashes in Unity and Jonglei States, presents a latent risk of displaced populations or armed spillover. Furthermore, the airport is susceptible to harsh environmental disruptions, including extreme heat and seasonal dust storms, which impact flight reliability. While the facility itself is considered a secure operational base, transit to the final destination is constrained by limited emergency response and the logistical challenges of one of Kenya's most remote frontiers.",
    extraInfo: `<h3>Operational Context</h3><p>Remote humanitarian logistics hub supporting NGO and relief operations.</p><h3>Operational Profile</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Assessment</th></tr><tr><td>Ops Mix</td><td>Humanitarian/logistics</td></tr><tr><td>Training Activity</td><td>Low</td></tr><tr><td>Rotary Presence</td><td>Moderate</td></tr><tr><td>UAV Activity</td><td>Low–Moderate</td></tr><tr><td>Traffic Type</td><td>VFR-dominant</td></tr></table><h3>Operational Risk Drivers</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>IFR/VFR Mix</td><td>VFR dominant</td></tr><tr><td>Congestion</td><td>Low–Medium</td></tr><tr><td>Approach/Departure Risk</td><td>Moderate–High</td></tr><tr><td>Runway Condition</td><td>Fair</td></tr><tr><td>Wildlife Hazard</td><td>Low–Moderate</td></tr><tr><td>Ground Exposure</td><td>Low</td></tr></table><h3>External & Environmental Factors</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>Weather Risk</td><td>High</td></tr><tr><td>Terrain / Obstacles</td><td>Low</td></tr><tr><td>Security Risk</td><td>Moderate</td></tr><tr><td>Emergency Response</td><td>Limited</td></tr><tr><td>Alternates Availability</td><td>Limitede</td></tr><tr><td>Operational Reliability</td><td>Medium</td></tr></table><h3>Risk Summary</h3><p><strong>Primary Risk Category:</strong> Remoteness</p><p><strong>Risk Type:</strong> Logistics-driven</p><p><strong>Overall Risk Level:</strong> Moderate–High</p><h3>Top Risk Drivers:</h3><ul><li>Remote operations</li><li>Harsh environment</li><li>Limited support infrastructure</li><li>Mission-driven operations</li></ul><h3>Operational Character</h3><p>Low frequency but operationally complex environment requiring strong planning and self-sufficiency.</p><h3>Accidents / Incidents</h3><ul><li>No major accidents (last 2 years)</li><li>Historically complex humanitarian operations</li></ul>`,
    domains: {
      D1: { name: "Airside Operations & Safety", score: 2 },
      D2: { name: "Airport Infrastructure & Assets", score: 3 },
      D3: { name: "Immediate Environs (0–10kms)", score: 3 },
      D4: { name: "Civil Aviation Authority", score: 2 },
      D5: { name: "Wider Airspace", score: 2 }
    },
    worstCredibleDomain: "D2 – Airport Infrastructure & Assets",
    meanImpactSeverity: 0.12,
    status: "NORMAL",
    activeDisruptions: ["Multi-Agency Security Operations", "South Sudan Instability", "Extreme Heat Events"],
    lastUpdate: "10 July 2026",
    domainImpactAssessment: [
      { domain: "D1 – Airside Operations & Safety", likelihoods: 1, impact: 2, liColor: "2", severity: "MEDIUM", rationale: "Low-frequency operations with experienced crew; minimal ground incidents reported." },
      { domain: "D2 – Airport Infrastructure & Assets", likelihoods: 2, impact: 2, liColor: "4", severity: "MEDIUM", rationale: "Basic infrastructure adequate for mission; dust storms occasionally impact runway maintenance." },
      { domain: "D3 – Immediate Environs (0–10km)", likelihoods: 2, impact: 2, liColor: "4", severity: "MEDIUM", rationale: "Border proximity presents latent cross-border security risks; armed banditry suppressed by ongoing operations." },
      { domain: "D4 – Civil Aviation Authority", likelihoods: 1, impact: 2, liColor: "2", severity: "LOW", rationale: "KCAA oversight maintained; minimal regulatory concerns for remote operations." },
      { domain: "D5 – Wider Airspace", likelihoods: 1, impact: 2, liColor: "2", severity: "LOW", rationale: "Class G uncontrolled airspace; minimal regional traffic interaction." }
    ],
    servicingAndCarriers: {
      hubCarriers: "International Humanitarian Operators",
      globalCarriers: "UN agencies, MSF, ICRC charters",
      regionalFeeders: "Northern Air, Aeromedical services, Mission Aviation Fellowship",
      strategicUse: "Humanitarian relief, medical evacuation, UN logistics, border-region crisis response"
    },
    groundsideSecurityRisks: {
      airsideLandside: "Low; remote facility with restricted access and known personnel only.",
      customsProcessing: "Simplified; diplomatic and UN-cleared cargo prioritized.",
      groundTransport: "Armed escort required for ground movement outside terminal; banditry suppressed but latent."
    },
    otherRealities: {
      departureTiming: "Mission-dependent; typically 1–2 hour lead time for humanitarian ops.",
      infrastructureReliability: "Generators and water systems fully operational; dust storm mitigation in place.",
      transitRisk: "Terminal security strong. Ground-based transit requires coordination with local security authorities."
    }
  },
  { 
    name: "Ol Kiombo Airstrip", code: "HKOK", city: "Narok", type: "Airstrip", coords: [-1.408586, 35.110689], 
    riskScore: 4, timezone: "GMT+3", category: "Civil Bush (High Traffic)", elevation:"5200 ft", runways:"09/27 (1200m) – Gravel", 
    airspace: "None", atc: "Uncontrolled", nightoperations:"No", fuel: "Limited", 
    image:"/images/mara.jpg",
    riskLevel: "Low",
    threatProfile: "Significant operational strain stems from its role as a primary alternative hub during the long rains leading to atypical aircraft congestion and accelerated runway wear. The combination of waterlogged unpaved surfaces and frequent wildlife incursions elevates the risk of ground incidents. While the security environment is stable and lacks urban crime, the facility's isolation and current over-capacity status present unique logistical risks and constrained emergency response capabilities.",
    riskReport: "Operations at Ol Kiombo Airstrip remains active, with a marked increase in traffic as it serves as a preferred alternative within the Maasai Mara during flooding conditions affecting other regional strips. This shift has led to higher aircraft movements and potential congestion, particularly during peak charter windows. The airstrip remains highly exposed to seasonal flooding; waterlogged runway conditions during this period frequently result in short-notice delays or rerouting.<br><br>The broader security environment is tranquil, characterised by a lack of the mass crowd-puller events or opportunistic robberies seen in Nairobi. However, the shifting security landscape in border regions necessitates a baseline of situational awareness regarding cross-border movements and poaching activity. The primary risk is logistical: the increased traffic is straining the unpaved surface, and the region's geographical isolation means technical or medical support is hours away. Travellers are reliant on private conservancy security and the operational efficiency of local ground teams.",
    extraInfo: `<h3>Operational Context</h3><p>Busiest Mara airstrip with frequent safari traffic movements.</p><h3>Operational Profile</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Assessment</th></tr><tr><td>Ops Mix</td><td>Safari/commercial</td></tr><tr><td>Training Activity</td><td>None</td></tr><tr><td>Rotary Presence</td><td>High</td></tr><tr><td>UAV Activity</td><td>Low–Moderate</td></tr><tr><td>Traffic Type</td><td>VFR-dominant</td></tr></table><h3>Operational Risk Drivers</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>IFR/VFR Mix</td><td>Low IFR</td></tr><tr><td>Congestion</td><td>High</td></tr><tr><td>Approach/Departure Risk</td><td>High</td></tr><tr><td>Runway Condition</td><td>Variable</td></tr><tr><td>Wildlife Hazard</td><td>Severe</td></tr><tr><td>Ground Exposure</td><td>Low</td></tr></table><h3>External & Environmental Factors</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Moderate</th></tr><tr><td>Weather Risk</td><td>High</td></tr><tr><td>Terrain / Obstacles</td><td>Low</td></tr><tr><td>Security Risk</td><td>Low</td></tr><tr><td>Emergency Response</td><td>Limited</td></tr><tr><td>Alternates Availability</td><td>Limited</td></tr><tr><td>Operational Reliability</td><td>Medium</td></tr></table><h3>Risk Summary</h3><p><strong>Primary Risk Category:</strong> Congestion + Environmental</p><p><strong>Risk Type:</strong> Mixed</p><p><strong>Overall Risk Level:</strong> High</p><h3>Top Risk Drivers:</h3><ul><li>High traffic density</li><li>Wildlife incursions</li><li>Visual-only ops</li><li>Runway variability</li></ul><h3>Operational Character</h3><p>High-traffic uncontrolled strip combining congestion and environmental risks.</p><h3>Accidents / Incidents</h3><ul><li>No major accidents</li><li>Wildlife incursions common</li><li>Bush operation incidents frequent</li></ul>`,
    domains: {
      D1: { name: "Airside Operations & Safety", score: 6 },
      D2: { name: "Airport Infrastructure & Assets", score: 3 },
      D3: { name: "Immediate Environs (0–10kms)", score: 2 },
      D4: { name: "Civil Aviation Authority", score: 1 },
      D5: { name: "Wider Airspace", score: 2 }
    },
    worstCredibleDomain: "D1 – Airside Operations & Safety",
    meanImpactSeverity: 0.16,
    status: "NORMAL",
    activeDisruptions: ["Seasonal Flooding", "Wildlife Incursions", "Runway Degradation"],
    lastUpdate: "15 July 2026",
    domainImpactAssessment: [
      { domain: "D1 – Airside Operations & Safety", likelihoods: 3, impact: 2, liColor: "6", severity: "MEDIUM", rationale: "High-density safari operations with frequent wildlife on runway; mandatory pre-landing sweeps mitigate but do not eliminate risk." },
      { domain: "D2 – Airport Infrastructure & Assets", likelihoods: 2, impact: 2, liColor: "4", severity: "MEDIUM", rationale: "Gravel runway deteriorates rapidly during long rains; limited maintenance capacity and no hard surfacing." },
      { domain: "D3 – Immediate Environs (0–10km)", likelihoods: 2, impact: 1, liColor: "2", severity: "LOW", rationale: "Conservancy-managed environs; minimal human-wildlife conflict; no urban crime exposure." },
      { domain: "D4 – Civil Aviation Authority", likelihoods: 1, impact: 1, liColor: "1", severity: "LOW", rationale: "Uncontrolled airstrip; KCAA oversight minimal; no regulatory actions pending." },
      { domain: "D5 – Wider Airspace", likelihoods: 1, impact: 2, liColor: "2", severity: "LOW", rationale: "Class G uncontrolled; low traffic density; no airspace complexity." }
    ],
    servicingAndCarriers: {
      hubCarriers: "None (charter only)",
      globalCarriers: "None",
      regionalFeeders: "Safarilink, AirKenya, Mombasa Air Safari, multiple charter operators",
      strategicUse: "Primary Maasai Mara access during flooding of Keekorok/Ol Kiombo; high-season safari hub"
    },
    groundsideSecurityRisks: {
      airsideLandside: "Very low; private conservancy access only; known clientele.",
      customsProcessing: "Not applicable; domestic/charter operations only.",
      groundTransport: "Low risk within conservancy; 4x4 transfer required; road conditions variable in rains."
    },
    otherRealities: {
      departureTiming: "Flexible; charter operations depart on demand. Weather delays common during long rains (Apr–May).",
      infrastructureReliability: "No ATC, no lighting, no fuel on-site (arrange uplift). Solar comms only. Limited shelter.",
      transitRisk: "Airstrip secure. Ground transit to lodges (15–45 min) through wildlife areas; qualified driver-guide mandatory."
    }
  },
  { 
    name: "Mara Serena Airstrip", code: "HKMS", city: "Narok", type: "Airstrip", coords: [-1.406111, 35.008057], 
    riskScore: 3, timezone: "GMT+3", category: "Civil Bush", elevation:"5200 ft", runways:"09/27 (1050m) – Gravel", 
    airspace: "Class G", atc: "Uncontrolled", nightoperations:"No", fuel: "Limited", 
    image:"/images/mara.jpg",
    riskLevel: "Low",
    threatProfile: "Risks are predominantly environmental and logistical, linked to the unpaved runway's exposure to the long rains. Frequent wildlife incursions and deteriorating surface conditions necessitate constant ground coordination. While the security environment is exceptionally stable compared to urban hubs, the facility's isolation presents a unique risk profile defined by constrained emergency response and the latent potential for cross-border movement or seasonal poaching activity within the wider ecosystem.",
    riskReport: "Operations at Mara Serena Airstrip remain stable with no reported criminal activity or civil unrest. However, as a remote facility within the Maasai Mara ecosystem, it is currently highly exposed to the seasonal long rains, which can rapidly degrade the unpaved runway and impact visibility. The primary unique disrupter remains consistent wildlife presence on the runway, requiring mandatory pre-landing sweeps.<br><br>The broader security environment is characterised by its remoteness. Unlike Nairobi, there is no threat from political mobilisation or urban / peri-urban crime. However, the shifting security landscape and regional border proximity necessitate a baseline of situational awareness regarding cross-border movements. The region's isolation means that emergency medical or technical support remains significantly constrained.<br><br>While police and conservancy wardens maintain a presence, travellers are reliant on private lodge security and the operational efficiency of ground teams. All movements should be planned with flexibility to account for sudden weather shifts and environmental delays.",
    extraInfo: `<h3>Operational Context</h3><p>Remote bush airstrip supporting safari and tourism operations.</p><h3>Operational Profile</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Assessment</th></tr><tr><td>Ops Mix</td><td>Safari / charter</td></tr><tr><td>Training Activity</td><td>None</td></tr><tr><td>Rotary Presence</td><td>High</td></tr><tr><td>UAV Activity</td><td>Low–Moderate</td></tr><tr><td>Traffic Type</td><td>VFR-only</td></tr></table><h3>Operational Risk Drivers</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>IFR/VFR Mix</td><td>VFR-only</td></tr><tr><td>Congestion</td><td>Medium</td></tr><tr><td>Approach/Departure Risk</td><td>High</td></tr><tr><td>Runway Condition</td><td>Variable</td></tr><tr><td>Wildlife Hazard</td><td>Severe</td></tr><tr><td>Ground Exposure</td><td>Low</td></tr></table><h3>External & Environmental Factors</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Moderate</th></tr><tr><td>Weather Risk</td><td>High</td></tr><tr><td>Terrain / Obstacles</td><td>Moderate</td></tr><tr><td>Security Risk</td><td>Low</td></tr><tr><td>Emergency Response</td><td>Limited</td></tr><tr><td>Alternates Availability</td><td>Limited</td></tr><tr><td>Operational Reliability</td><td>Low–Medium</td></tr></table><h3>Risk Summary</h3><p><strong>Primary Risk Category:</strong> Environmental</p><p><strong>Risk Type:</strong> Environment-driven</p><p><strong>Overall Risk Level:</strong> High</p><h3>Top Risk Drivers:</h3><ul><li>Wildlife incursions</li><li>Short unpaved runway</li><li>Weather variability</li><li>Visual-only operations</li></ul><h3>Operational Character</h3><p>Environment-driven bush operations relying heavily on pilot judgment.</p><h3>Accidents / Incidents</h3><ul><li>No major accidents (last 2 years)</li><li>Frequent minor bush operation incidents</li></ul>`,
    domains: {
      D1: { name: "Airside Operations & Safety", score: 2 },
      D2: { name: "Airport Infrastructure & Assets", score: 2 },
      D3: { name: "Immediate Environs (0–10kms)", score: 1 },
      D4: { name: "Civil Aviation Authority", score: 1 },
      D5: { name: "Wider Airspace", score: 1 }
    },
    worstCredibleDomain: "D1 – Airside Operations & Safety",
    meanImpactSeverity: 0.12,
    status: "NORMAL",
    activeDisruptions: ["Seasonal Weather", "Wildlife Activity", "Runway Surface Variability"],
    lastUpdate: "12 July 2026",
    domainImpactAssessment: [
      { domain: "D1 – Airside Operations & Safety", likelihoods: 3, impact: 2, liColor: "6", severity: "MEDIUM", rationale: "VFR-only operations on short gravel strip; wildlife incursions frequent; pilot judgment critical." },
      { domain: "D2 – Airport Infrastructure & Assets", likelihoods: 2, impact: 2, liColor: "4", severity: "MEDIUM", rationale: "Unpaved runway degrades rapidly in rains; no lighting; limited maintenance equipment on-site." },
      { domain: "D3 – Immediate Environs (0–10km)", likelihoods: 1, impact: 1, liColor: "1", severity: "LOW", rationale: "Located within Mara Serena conservancy; secure, managed environment; no community friction." },
      { domain: "D4 – Civil Aviation Authority", likelihoods: 1, impact: 1, liColor: "1", severity: "LOW", rationale: "Uncontrolled airstrip; minimal regulatory oversight; no pending actions." },
      { domain: "D5 – Wider Airspace", likelihoods: 1, impact: 1, liColor: "1", severity: "LOW", rationale: "Class G airspace; very low traffic density; no controlled airspace interaction." }
    ],
    servicingAndCarriers: {
      hubCarriers: "None (charter only)",
      globalCarriers: "None",
      regionalFeeders: "Safarilink, AirKenya, Mombasa Air Safari, Governors' Aviation",
      strategicUse: "Exclusive access for Mara Serena Safari Lodge guests; secondary Mara entry point"
    },
    groundsideSecurityRisks: {
      airsideLandside: "Negligible; private lodge access; no public terminal.",
      customsProcessing: "Not applicable; domestic/charter only.",
      groundTransport: "Very low; short transfers to lodge within conservancy; escorted by lodge staff."
    },
    otherRealities: {
      departureTiming: "Flexible; lodge-coordinated charters. Weather holds may delay 30–60 min during storms.",
      infrastructureReliability: "No ATC, no fuel, no lighting. Wind sock only. Comms via lodge radio/handheld.",
      transitRisk: "Airstrip secure. Lodge transfer (5–15 min) through wildlife zone; armed ranger escort standard."
    }
  },
  { 
    name: "Laikipia Air Base", code: "HKNY", city: "Nanyuki", type: "Air Base", coords: [0.032933, 37.026901], 
    riskScore: 2, timezone: "GMT+3", category: "Military", elevation:"~6119 ft", runways:"02/20 (4000m) – Concrete", 
    airspace: "Class C/D when active (with restricted access)", atc: "Military-controlled", nightoperations:"Yes", 
    fuel: "Military only", image:"/images/laikipia.jpg",
    riskLevel: "Low",
    threatProfile: "The operating environment is characterised by strict military control and high-readiness protocols. While the facility remains a secure hard target, the regional profile is influenced by the March–April 2026 gazettement of surrounding areas (including Mukogodo Forest) as 'security-disturbed and dangerous'. Although the risk of a direct breach remains rare due to reinforced fencing and prioritised military surveillance, the intensified anti-banditry operations in the wider county necessitate high situational awareness during ground transit to and from the base.",
    riskReport: "Operations at Laikipia Air Base (Nanyuki) are stable, with the facility currently serving as a strategic hub for regional security. In March, the Commander of the Kenya Air Force (KAF) commissioned critical infrastructure, including a new game-proof electric perimeter fence, specifically designed to enhance security and mitigate human-wildlife conflict. While the base itself remains unaffected by civilian unrest, the surrounding security environment has shifted significantly. Following an escalation in cattle rustling and banditry, parts of northern and eastern Laikipia were declared 'security-disturbed' for 30 days effective 26 March.<br><br>Ongoing multi-agency operations involving the KDF and National Police Service (NPS) have focused on flushing out armed groups from hotspots like Mukogodo Forest. While these kinetic operations have successfully recovered hundreds of stolen livestock as of mid-April, they contribute to a volatile regional atmosphere. Travellers and personnel should note that while flight training and routine military operations continue uninterrupted, ground movement in the wider Nanyuki environs may be subject to intensified checkpoints and military-led traffic control.",
    extraInfo: `<h3>Operational Context</h3><p>Military air base supporting fast jet operations and training.</p><h3>Operational Profile</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Assessment</th></tr><tr><td>Ops Mix</td><td>Military</td></tr><tr><td>Training Activity</td><td>Moderate</td></tr><tr><td>Rotary Presence</td><td>Moderate</td></tr><tr><td>UAV Activity</td><td>Low</td></tr><tr><td>Traffic Type</td><td>Military-controlled</td></tr></table><h3>Operational Risk Drivers</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>IFR/VFR Mix</td><td>Controlled</td></tr><tr><td>Congestion</td><td>Medium–High</td></tr><tr><td>Approach/Departure Risk</td><td>High</td></tr><tr><td>Runway Condition</td><td>Good</td></tr><tr><td>Wildlife Hazard</td><td>Low</td></tr><tr><td>Ground Exposure</td><td>Low</td></tr></table><h3>External & Environmental Factors</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Moderate</th></tr><tr><td>Weather Risk</td><td>Low</td></tr><tr><td>Terrain / Obstacles</td><td>Low</td></tr><tr><td>Security Risk</td><td>High (restricted)</td></tr><tr><td>Emergency Response</td><td>Strong</td></tr><tr><td>Alternates Availability</td><td>Limited</td></tr><tr><td>Operational Reliability</td><td>High</td></tr></table><h3>Risk Summary</h3><p><strong>Primary Risk Category:</strong> Military</p><p><strong>Risk Type:</strong> Interaction-driven</p><p><strong>Overall Risk Level:</strong> High</p><h3>Top Risk Drivers:</h3><ul><li>Fast jet operations</li><li>Restricted airspace</li><li>Military training activity</li><li>High-speed traffic interaction</li></ul><h3>Operational Character</h3><p>Controlled military environment where interaction with high-performance aircraft is the primary risk.</p><h3>Accidents / Incidents</h3><ul><li>No major accidents (last 2 years)</li><li>Risk driven by operational environment rather than events</li></ul>`,
    domains: {
      D1: { name: "Airside Operations & Safety", score: 2 },
      D2: { name: "Airport Infrastructure & Assets", score: 1 },
      D3: { name: "Immediate Environs (0–10kms)", score: 1 },
      D4: { name: "Civil Aviation Authority", score: 1 },
      D5: { name: "Wider Airspace", score: 2 }
    },
    worstCredibleDomain: "D1 – Airside Operations & Safety",
    meanImpactSeverity: 0.08,
    status: "NORMAL",
    activeDisruptions: ["Regional Security Operations", "Restricted Airspace Activity"],
    lastUpdate: "10 July 2026",
    domainImpactAssessment: [
      { domain: "D1 – Airside Operations & Safety", likelihoods: 2, impact: 3, liColor: "6", severity: "MEDIUM", rationale: "Fast jet and training operations create high-speed interaction risk; strict military ATC mitigates but complexity remains." },
      { domain: "D2 – Airport Infrastructure & Assets", likelihoods: 1, impact: 1, liColor: "1", severity: "LOW", rationale: "New game-proof electric fence commissioned Mar 2026; 4000m concrete runway in excellent condition; dedicated military maintenance." },
      { domain: "D3 – Immediate Environs (0–10km)", likelihoods: 2, impact: 2, liColor: "4", severity: "MEDIUM", rationale: "Parts of Laikipia County gazetted as 'security-disturbed' (Mar–Apr 2026); banditry/cattle rustling in Mukogodo Forest; ground transit requires situational awareness." },
      { domain: "D4 – Civil Aviation Authority", likelihoods: 1, impact: 1, liColor: "1", severity: "LOW", rationale: "Military-controlled facility; KCAA oversight not applicable; internal KAF safety management applies." },
      { domain: "D5 – Wider Airspace", likelihoods: 1, impact: 2, liColor: "2", severity: "LOW", rationale: "Class C/D when active; restricted access limits civilian interaction; GNSS/comms infrastructure robust." }
    ],
    servicingAndCarriers: {
      hubCarriers: "Kenya Air Force (F-5, Hawk, Tucano)",
      globalCarriers: "None (military only)",
      regionalFeeders: "KAF training squadrons; occasional VIP/diplomatic rotary",
      strategicUse: "Fast jet base, advanced training, regional security operations hub, VIP transport"
    },
    groundsideSecurityRisks: {
      airsideLandside: "Negligible; military perimeter; no civilian access.",
      customsProcessing: "Not applicable; military facility.",
      groundTransport: "Moderate risk on Nanyuki–Laikipia roads due to ongoing security operations; use military escort or verified transport."
    },
    otherRealities: {
      departureTiming: "Mission-dependent; training sorties subject to airspace booking and range availability.",
      infrastructureReliability: "High; dedicated military power, comms, maintenance; 4000m runway all-weather capable.",
      transitRisk: "Base perimeter secure. Ground transit to Nanyuki (20 km) passes through areas with active security operations; coordinate with base ops."
    }
  },
  { 
    name: "Wajir Airport", code: "HKWJ", city: "Wajir", type: "Minor Airport", coords: [1.73324, 40.091599], 
    riskScore: 14, timezone: "GMT+3", category: "Domestic (Regional)", elevation:"~757 ft", runways:"15/33 (2800m) – Asphalt", 
    airspace: "Class D", atc: "Controlled", nightoperations:"Yes", fuel: "Limited", 
    image:"/images/wajir.jpg",
    riskLevel: "High",
    threatProfile: "Wajir Airport serves as a critical dual-use military and civilian hub within a high-sensitivity security zone. While the facility itself is a fortified green zone under heavy KDF and multi-agency protection, the surrounding environment is defined by ongoing anti-banditry operations and a persistent threat of Al-Shabaab incursions from the nearby Somali border. Operations are stable but subject to military priority, with transit beyond the perimeter considered the most high-risk segment due to IED threats, ambushes and illegal checkpoints.",
    riskReport: "Wajir Airport remains the only secure gateway to the Northern Frontier, as land transit via the Mandera-Wajir or Isiolo-Wajir corridors is currently deemed high-risk. While the airport is a hard target with no recent direct breaches, the broader county is under a state of heightened alert. In March, the government expanded the list of security-disturbed zones in neighbouring counties, and a new multi-agency security camp was launched in Eldas to disrupt human and drug trafficking networks along the Basir corridor.<br><br>The primary security concern remains the latent threat of cross-border terrorism-related activity and the use of improvised explosive devices (IEDs) on regional access roads. While the police and KDF have intensified highway surveillance, illegal checkpoints by armed groups remain a verified threat in peri-urban zones and remote stretches. Travellers are reliant on a high-visibility security presence but should be aware that civilian operations may be temporarily deprioritised to accommodate rapid-response military deployments or casualty evacuations from regional flashpoints.",
    extraInfo: `<h3>Operational Context</h3><p>Strategic northern Kenya airport supporting cargo, passenger, and military operations.</p><h3>Operational Profile</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Assessment</th></tr><tr><td>Ops Mix</td><td>Mixed (cargo + pax + military)</td></tr><tr><td>Training Activity</td><td>Low</td></tr><tr><td>Rotary Presence</td><td>Moderate–High</td></tr><tr><td>UAV Activity</td><td>Low</td></tr><tr><td>Traffic Type</td><td>Mixed</td></tr></table><h3>Operational Risk Drivers</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>IFR/VFR Mix</td><td>Moderate</td></tr><tr><td>Congestion</td><td>Medium</td></tr><tr><td>Approach/Departure Risk</td><td>Moderate</td></tr><tr><td>Runway Condition</td><td>Good</td></tr><tr><td>Wildlife Hazard</td><td>Low</td></tr><tr><td>Ground Exposure</td><td>Medium</td></tr></table><h3>External & Environmental Factors</h3><table border="1" cellpadding="6"><tr><th>Factor</th><th>Level</th></tr><tr><td>Weather Risk</td><td>High</td></tr><tr><td>Terrain / Obstacles</td><td>Low</td></tr><tr><td>Security Risk</td><td>High</td></tr><tr><td>Emergency Response</td><td>Moderate</td></tr><tr><td>Alternates Availability</td><td>Limited</td></tr><tr><td>Operational Reliability</td><td>Medium</td></tr></table><h3>Risk Summary</h3><p><strong>Primary Risk Category:</strong> Security / Environmental</p><p><strong>Risk Type:</strong> External-driven</p><p><strong>Overall Risk Level:</strong> High</p><h3>Top Risk Drivers:</h3><ul><li>Security-sensitive region</li><li>Harsh weather (heat, haze)</li><li>Limited infrastructure</li><li>Mixed operations</li></ul><h3>Operational Character</h3><p>Operational risk influenced strongly by external security and environmental conditions.</p><h3>Accidents / Incidents</h3><ul><li>No major accidents (last 2 years)</li></ul>`,
    domains: {
      D1: { name: "Airside Operations & Safety", score: 6 },
      D2: { name: "Airport Infrastructure & Assets", score: 14 },
      D3: { name: "Immediate Environs (0–10kms)", score: 7 },
      D4: { name: "Civil Aviation Authority", score: 14 },
      D5: { name: "Wider Airspace", score: 7 }
    },
    worstCredibleDomain: "D2 – Airport Infrastructure & Assets",
    meanImpactSeverity: 0.875,
    status: "ELEVATED",
    activeDisruptions: ["Entry & Exit Mobility", "Solicitation", "Strike", "Infrastructure Fragility", "Low-Level Criminality"],
    lastUpdate: "20 May 2026",
    domainImpactAssessment: [
      { domain: "D1 – Airside Operations & Safety", likelihoods: 2, impact: 3, liColor: "6", severity: "MEDIUM", rationale: "Residual labour grievances and low-level solicitation near arrivals present minor guarding lapses." },
      { domain: "D2 – Airport Infrastructure & Assets", likelihoods: 3, impact: 5, liColor: "14", severity: "HIGH", rationale: "Seasonal rains have induced infrastructure fragility, leading to terminal power fluctuations and intermittent BHS/FIDS reliability." },
      { domain: "D3 – Immediate Environs (0–10km)", likelihoods: 2, impact: 3, liColor: "7", severity: "MEDIUM", rationale: "Severe road degradation at entry and exit points has created static targets. Opportunistic criminality likely at congestion chokepoints." },
      { domain: "D4 – Civil Aviation Authority", likelihoods: 3, impact: 5, liColor: "14", severity: "HIGH", rationale: "Kenya Civil Aviation Authority (KCAA) oversight robust. All AOC statuses current with no pending ICAO 'Notice of Concern'." },
      { domain: "D5 – Wider Airspace", likelihoods: 2, impact: 3, liColor: "7", severity: "MEDIUM", rationale: "FIR remains secure. GNSS integrity is high with no reported targeted electronic interference within the domestic corridor." }
    ],
    servicingAndCarriers: {
      hubCarriers: "Kenya Airways / Jambojet",
      globalCarriers: "Emirates, Qatar Airways, Lufthansa, KLM, Ethiopian Airlines, Turkish Airlines, Air France, British Airways",
      regionalFeeders: "Jambojet, Fly540, Precision Air, RwandAir, Uganda Airlines",
      strategicUse: "Passenger hub, cargo, diplomatic and humanitarian operations"
    },
    groundsideSecurityRisks: {
      airsideLandside: "Elevated risk of unauthorised solicitation, profiling and distraction theft in the arrivals zone.",
      customsProcessing: "Ongoing exposure to low-level corruption and informal payment requests; engage only with uniformed officials.",
      groundTransport: "Significant risk of in-traffic robbery and carjacking at road access chokepoints; use pre-verified, secure transport only."
    },
    otherRealities: {
      departureTiming: "3+ hour lead time strongly recommended. Terminal congestion, weather delays and security processing can extend pre-departure to 4 hours.",
      infrastructureReliability: "Frequent power fluctuations and intermittent BHS/FIDS reliability; backup systems partially operational.",
      transitRisk: "Ground-based transit to the final destination is currently the most volatile segment of the journey."
    }
  },
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
  { cs: 'KQ100', airline: 'Kenya Airways', ac: 'B772', acFull: 'Boeing 777-200', reg: '5Y-KQA', icao24: '738012', fr: 'HKJK', to: 'EGLL', frName: 'Jomo Kenyatta Int\'l', toName: 'London Heathrow', frCity: 'Nairobi', toCity: 'London', status: 'enroute', eta: '4h 45m', alt: 38000, speed: 480, heading: 330 },
  { cs: 'ET306', airline: 'Ethiopian Airlines', ac: 'B789', acFull: 'Boeing 787-9', reg: 'ET-AQB', icao24: '896321', fr: 'HAAB', to: 'HKJK', frName: 'Addis Ababa Bole', toName: 'Jomo Kenyatta Int\'l', frCity: 'Addis Ababa', toCity: 'Nairobi', status: 'enroute', eta: '55m', alt: 36000, speed: 450, heading: 195 },
  { cs: 'KQ300', airline: 'Kenya Airways', ac: 'B738', acFull: 'Boeing 737-800', reg: '5Y-KQC', icao24: '738045', fr: 'HKJK', to: 'HAAB', frName: 'Jomo Kenyatta Int\'l', toName: 'Addis Ababa Bole', frCity: 'Nairobi', toCity: 'Addis Ababa', status: 'enroute', eta: '48m', alt: 34000, speed: 430, heading: 15 },
  { cs: 'KQ202', airline: 'Kenya Airways', ac: 'B738', acFull: 'Boeing 737-800', reg: '5Y-KQD', icao24: '738067', fr: 'HTDA', to: 'HKJK', frName: 'Julius Nyerere Int\'l', toName: 'Jomo Kenyatta Int\'l', frCity: 'Dar es Salaam', toCity: 'Nairobi', status: 'enroute', eta: '1h 2m', alt: 35000, speed: 440, heading: 345 },
  { cs: 'WB100', airline: 'RwandAir', ac: 'B738', acFull: 'Boeing 737-800', reg: '9XR-WA', icao24: '897123', fr: 'HRYR', to: 'HKJK', frName: 'Kigali Int\'l', toName: 'Jomo Kenyatta Int\'l', frCity: 'Kigali', toCity: 'Nairobi', status: 'enroute', eta: '1h 22m', alt: 37000, speed: 460, heading: 85 },
  { cs: 'TC501', airline: 'Air Tanzania', ac: 'B39M', acFull: 'Boeing 737 MAX 8', reg: '5H-TCA', icao24: '897456', fr: 'HTDA', to: 'HRYR', frName: 'Julius Nyerere Int\'l', toName: 'Kigali Int\'l', frCity: 'Dar es Salaam', toCity: 'Kigali', status: 'enroute', eta: '1h 28m', alt: 36000, speed: 455, heading: 290 },
  { cs: 'JM402', airline: 'Jambojet', ac: 'Q400', acFull: 'Dash 8-400', reg: '5Y-JMA', icao24: '738089', fr: 'HKMO', to: 'HKJK', frName: 'Moi Int\'l', toName: 'Jomo Kenyatta Int\'l', frCity: 'Mombasa', toCity: 'Nairobi', status: 'enroute', eta: '38m', alt: 24000, speed: 350, heading: 310 },
  { cs: 'U7201', airline: 'Uganda Airlines', ac: 'A338', acFull: 'Airbus A330-800', reg: '5X-UGA', icao24: '896789', fr: 'HUEN', to: 'HKJK', frName: 'Entebbe Int\'l', toName: 'Jomo Kenyatta Int\'l', frCity: 'Entebbe', toCity: 'Nairobi', status: 'enroute', eta: '58m', alt: 38000, speed: 470, heading: 95 },
  { cs: 'PW201', airline: 'Precision Air', ac: 'AT75', acFull: 'ATR 72-500', reg: '5H-PWA', icao24: '897789', fr: 'HTDA', to: 'HTZA', frName: 'Julius Nyerere Int\'l', toName: 'Abeid Amani Karume', frCity: 'Dar es Salaam', toCity: 'Zanzibar', status: 'enroute', eta: '32m', alt: 18000, speed: 280, heading: 15 },
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
  origCode: f.fr,
  destCode: f.to,
  origName: f.frName,
  destName: f.toName,
  origCity: f.frCity,
  destCity: f.toCity,
}));

// Live Updates mock data
const LIVE_UPDATES_DATA = {
  weather: [
    { lat: -1.3, lng: 36.9, title: "Thunderstorm Activity", detail: "CB buildup over Nairobi FIR. Expect moderate to severe turbulence FL250-FL350. Lightning reported within 20nm of HKJK.", severity: "WARN", time: "14:32Z" },
    { lat: -4.0, lng: 39.6, title: "Coastal Fog", detail: "Visibility dropping to 800m at HKMO. Low stratus 200ft. Expected clearance 16:00Z.", severity: "INFO", time: "13:45Z" },
    { lat: 1.7, lng: 40.1, title: "Dust Storm", detail: "Reduced visibility to 2000m at HKWJ. Winds 25kt gusting 35kt from NE. Aviation RED warning active.", severity: "DANGER", time: "12:10Z" },
    { lat: -6.9, lng: 39.2, title: "Heavy Rainfall", detail: "Tropical downpours HTDA. Runway 05/23 water accumulation. Braking action MEDIUM.", severity: "WARN", time: "15:01Z" },
  ],
  securityFeed: [
    { lat: -1.3, lng: 36.8, title: "Protest Activity", detail: "Demonstrations reported near Wilson Airport access road. Police deployed. Avoid Langata Road junction.", severity: "WARN", time: "13:20Z" },
    { lat: -4.0, lng: 39.6, title: "Gang Activity", detail: "Panga Boys reported in Kisauni area. Increased patrols. Mombasa port access unaffected.", severity: "INFO", time: "11:55Z" },
    { lat: 0.0, lng: 37.0, title: "Security Operation", detail: "Multi-agency operation ongoing Mukogodo Forest. Roadblocks on Nanyuki-Rumuruti road. Air operations normal.", severity: "WARN", time: "10:30Z" },
  ],
  regulation: [
    { lat: -1.3, lng: 36.9, title: "NOTAM: Runway Works", detail: "HKJK RWY 06/24 partial closure 22-24 Jul. 06 reduced to 2800m. Expect delays.", severity: "INFO", time: "09:00Z" },
    { lat: 8.98, lng: 38.8, title: "ATC Strike Notice", detail: "HAAB potential ATC industrial action 25 Jul. Contingency routes activated.", severity: "WARN", time: "16:00Z" },
  ],
  commercial: [
    { lat: -1.3, lng: 36.9, title: "KQ New Route", detail: "Kenya Airways announces HKJK-DXB daily B787 from Oct 26. Bookings open 15 Jul.", severity: "INFO", time: "12:00Z" },
    { lat: -4.0, lng: 39.6, title: "Jambojet Expansion", detail: "Jambojet adds HKMO-HKKI 4x weekly Q400. Targets coastal tourism surge.", severity: "INFO", time: "11:30Z" },
  ],
  infrastructure: [
    { lat: -1.3, lng: 36.9, title: "Power Fluctuation", detail: "JKIA terminal 1A experiencing intermittent power. Backup generators active. BHS partially affected.", severity: "WARN", time: "14:15Z" },
    { lat: -4.0, lng: 39.6, title: "Fuel Supply Delay", detail: "HKMO Jet A-1 delivery delayed 24hrs. Limited uplift available. Coordinate with handler.", severity: "WARN", time: "13:00Z" },
    { lat: 1.7, lng: 40.1, title: "Runway Lighting U/S", detail: "HKWJ edge lights RWY 15/33 unserviceable. Day ops only until repair.", severity: "DANGER", time: "08:00Z" },
  ],
};

// Severity colors
const SEVERITY_COLORS = {
  INFO: '#1a6fe8',
  WARN: '#f59e0b',
  DANGER: '#ef4444',
  SUCCESS: '#10b981',
};

// ASN Aviation Incidents data (from POC)
const ASN_INCIDENTS = [
  // Ethiopian Airlines
  { lat: 8.88,  lon: 39.34, cs: 'ET302',  date: '2019-03-10', ac: 'Boeing 737 MAX 8',         op: 'Ethiopian Airlines',      fat: 157, desc: 'Crashed shortly after takeoff from ADD; MCAS malfunction implicated. All 157 killed.' },
  { lat: 9.03,  lon: 38.75, cs: 'ET961',  date: '1996-11-23', ac: 'Boeing 767-260ER',          op: 'Ethiopian Airlines',      fat: 125, desc: 'Hijacked, fuel exhausted; ditched in Indian Ocean off Comoros. 125 killed.' },
  { lat: 33.82, lon: 35.49, cs: 'ET409',  date: '2010-01-25', ac: 'Boeing 737-800',            op: 'Ethiopian Airlines',      fat: 90,  desc: 'Crashed into sea off Beirut shortly after takeoff; cause undetermined. 90 killed.' },
  { lat: 9.00,  lon: 38.77, cs: 'ET705',  date: '2003-05-24', ac: 'Boeing 737-200',            op: 'Ethiopian Airlines',      fat: 0,   desc: 'Runway overrun on landing at ADD after hydraulic problem. No fatalities.' },
  { lat: 8.98,  lon: 38.80, cs: 'ET812',  date: '2026-04-10', ac: 'Airbus A350-900',           op: 'Ethiopian Airlines',      fat: 0,   desc: 'Spurious cargo door light on approach; returned to ADD. False alarm confirmed.' },
  { lat: 9.01,  lon: 38.76, cs: 'ET501',  date: '2025-03-15', ac: 'Boeing 737 MAX 8',          op: 'Ethiopian Airlines',      fat: 0,   desc: 'Runway incursion during night operations at ADD; no collision or injuries.' },
  { lat: 8.97,  lon: 38.76, cs: 'ET627',  date: '2024-02-04', ac: 'Boeing 787-9',              op: 'Ethiopian Airlines',      fat: 0,   desc: 'Bird strike on takeoff from ADD; returned for inspection. No injuries.' },

  // Kenya Airways / East African Airways
  { lat: -3.98, lon: 9.72,  cs: 'KQ507',  date: '2007-05-05', ac: 'Boeing 737-800',            op: 'Kenya Airways',           fat: 114, desc: 'Crashed into swamp near Douala shortly after takeoff. 114 killed.' },
  { lat: 5.35,  lon: -3.93, cs: 'KQ431',  date: '2000-01-30', ac: 'Boeing 737-200',            op: 'Kenya Airways',           fat: 169, desc: 'Crashed into sea off Abidjan coast shortly after takeoff. All 169 killed.' },
  { lat: -3.07, lon: 37.37, cs: 'KQ101',  date: '1974-11-20', ac: 'Boeing 707-351C',           op: 'East African Airways',    fat: 59,  desc: 'Crashed into Mount Kilimanjaro on descent to HTDA. 59 killed.' },
  { lat: -1.29, lon: 36.82, cs: 'KQ410',  date: '2026-05-02', ac: 'Boeing 737-800',            op: 'Kenya Airways',           fat: 0,   desc: 'Bird strike during landing rollout at HKJK; minor engine damage, no injuries.' },
  { lat: -1.29, lon: 36.82, cs: 'KQ305',  date: '2025-07-22', ac: 'Boeing 787-8',              op: 'Kenya Airways',           fat: 0,   desc: 'Hydraulic anomaly on approach to HKJK; landed safely with emergency services on standby.' },
  { lat: -1.31, lon: 36.83, cs: 'KQ621',  date: '2018-07-16', ac: 'Embraer E190',              op: 'Kenya Airways',           fat: 0,   desc: 'Rejected takeoff at HKJK due to engine vibration alert. No injuries.' },

  // Precision Air / Air Tanzania
  { lat: -1.21, lon: 31.80, cs: 'PW494',  date: '2012-11-12', ac: 'ATR 42-320',                op: 'Precision Air',           fat: 19,  desc: 'Ditched in Lake Victoria near Bukoba after fuel starvation. 19 of 43 killed.' },
  { lat: -6.88, lon: 39.21, cs: 'TC101',  date: '2014-09-05', ac: 'Bombardier Q300',           op: 'Air Tanzania',            fat: 0,   desc: 'Hard landing at HTDA; nose gear collapsed on rollout. No fatalities.' },
  { lat: -3.43, lon: 37.07, cs: 'ATC201', date: '1993-06-12', ac: 'Boeing 737-200',            op: 'Air Tanzania',            fat: 50,  desc: 'Crashed at Kilimanjaro International Airport in poor visibility. 50 killed.' },
  { lat: -6.88, lon: 39.20, cs: 'TC511',  date: '2017-11-11', ac: 'ATR 42-320',                op: 'Coastal Aviation',        fat: 11,  desc: 'Crashed into Lake Victoria near Bukoba; 11 killed, 4 survived.' },
  { lat: -6.84, lon: 37.67, cs: 'CZA201', date: '2013-08-05', ac: 'Cessna 208B Caravan',       op: 'Coastal Aviation',        fat: 4,   desc: 'Crashed on approach to Dodoma in IMC. 4 killed.' },

  // Sudan / South Sudan
  { lat: 15.59, lon: 32.55, cs: 'SAW311', date: '2003-02-08', ac: 'Boeing 737-200',            op: 'Sudan Airways',           fat: 116, desc: 'Crashed shortly after takeoff from Khartoum. 116 killed.' },
  { lat: 15.60, lon: 32.55, cs: 'SD501',  date: '2008-07-10', ac: 'Antonov An-24RV',           op: 'Sudan Airways',           fat: 30,  desc: 'Runway excursion at Khartoum; aircraft caught fire. 30 killed.' },
  { lat: 15.59, lon: 32.56, cs: 'SU101',  date: '2024-09-21', ac: 'Airbus A320',               op: 'Sudan Airways',           fat: 0,   desc: 'Fuel leak detected in cruise; diverted to Port Sudan. Landed safely.' },
  { lat: 4.87,  lon: 31.60, cs: 'SS201',  date: '2013-11-04', ac: 'Antonov An-26',             op: 'South Sudan Airlines',    fat: 42,  desc: 'Crashed near Juba; 42 passengers killed on impact.' },
  { lat: 8.40,  lon: 30.56, cs: 'SS101',  date: '2016-03-14', ac: 'Antonov An-72',             op: 'Sky Aviation S. Sudan',   fat: 0,   desc: 'Wheels-up landing at Malakal due to gear failure. Crew survived.' },
  { lat: 4.87,  lon: 31.61, cs: 'S9CH01', date: '2026-01-14', ac: 'Cessna Grand Caravan',      op: 'South Sudan Charter',     fat: 6,   desc: 'Crashed on approach to Juba in fog; 6 of 8 on board killed.' },

  // Somalia / Horn of Africa
  { lat: 2.01,  lon: 45.31, cs: 'SO201',  date: '1993-09-22', ac: 'Boeing 707',                op: 'Somali Airlines',         fat: 0,   desc: 'Aircraft destroyed on ground at Mogadishu during armed conflict. No crew aboard.' },
  { lat: 2.33,  lon: 44.49, cs: 'SO101',  date: '2009-08-09', ac: 'Ilyushin Il-76',            op: 'Daallo Airlines',         fat: 0,   desc: 'Engine fire on takeoff from Mogadishu; emergency stop on runway. No fatalities.' },
  { lat: 11.52, lon: 43.13, cs: 'D3159',  date: '2016-02-02', ac: 'Airbus A321',               op: 'Daallo Airlines',         fat: 1,   desc: 'Bomb exploded mid-flight, blew hole in fuselage; aircraft landed at HADC. 1 killed (bomber).' },
  { lat: 2.01,  lon: 45.32, cs: 'D3801',  date: '2025-11-08', ac: 'ATR 72-600',                op: 'Daallo Airlines',         fat: 0,   desc: 'Tyre burst on landing at Aden Adde; aircraft stopped safely. No injuries.' },
  { lat: 11.55, lon: 43.17, cs: 'JW201',  date: '2026-03-05', ac: 'Boeing 737-800',            op: 'Jubba Airways',           fat: 0,   desc: 'Aborted landing at HADC due to vehicle on runway; went around, landed on second attempt.' },

  // DRC Congo
  { lat: -4.32, lon: 15.45, cs: 'CAD301', date: '2011-07-08', ac: 'CASA CN-235',               op: 'Hewa Bora Airways',       fat: 74,  desc: 'Crashed near Kisangani; broke apart in jungle. 74 of 118 killed.' },
  { lat: 0.51,  lon: 25.19, cs: 'HBK201', date: '2008-04-15', ac: 'Antonov An-26',             op: 'Hewa Bora Airways',       fat: 13,  desc: 'Crashed on approach to Kindu airport. 13 killed.' },
  { lat: -4.38, lon: 15.44, cs: 'CAD101', date: '1996-01-08', ac: 'Antonov An-32',             op: 'African Air Services',    fat: 237, desc: 'Crashed on takeoff from Kinshasa-Ndolo; ploughed into crowded market. 237 killed.' },
  { lat: -2.50, lon: 28.80, cs: 'ZAR201', date: '2004-11-17', ac: 'Boeing 727-100',            op: 'Wimbi Dira Airways',      fat: 0,   desc: 'Overran runway at Bukavu on landing; no fatalities.' },

  // Comoros / Indian Ocean
  { lat: -11.70,lon: 43.24, cs: 'YC626',  date: '2009-06-30', ac: 'Airbus A310-300',           op: 'Yemenia',                 fat: 152, desc: 'Crashed into Indian Ocean approaching Moroni. 152 killed; 1 survivor.' },

  // Uganda
  { lat: 0.04,  lon: 32.44, cs: 'EA001',  date: '1976-07-04', ac: 'Airbus A300B4',             op: 'Air France (hijack)',     fat: 4,   desc: 'Hijacked to Entebbe; Israeli rescue operation. 4 hostages and all hijackers killed.' },
  { lat: 0.04,  lon: 32.44, cs: 'U7301',  date: '2010-04-16', ac: 'CRJ-100ER',                 op: 'Air Uganda',              fat: 0,   desc: 'Hydraulic failure on approach to Entebbe; emergency landing. No injuries.' },

  // Burundi
  { lat: -3.32, lon: 29.32, cs: 'QU201',  date: '2009-10-21', ac: 'ATR 42',                    op: 'Air Burundi',             fat: 0,   desc: 'Runway excursion at Bujumbura airport on landing. No injuries.' },

  // Djibouti
  { lat: 11.55, lon: 43.16, cs: 'FX8321', date: '2011-09-03', ac: 'McDonnell Douglas DC-8',    op: 'FedEx Express',           fat: 0,   desc: 'Tail strike on takeoff from HADC; declared emergency, returned and landed safely.' },

  // Rwanda
  { lat: -1.97, lon: 30.13, cs: 'WB101',  date: '2015-09-30', ac: 'CRJ-900',                   op: 'RwandAir',                fat: 0,   desc: 'Runway excursion on landing at Kigali-Kanombe. No fatalities.' },

  // South Africa / Southern Africa
  { lat: -26.10,lon: 28.22, cs: 'SA295',  date: '1987-11-28', ac: 'Boeing 747-244B',           op: 'South African Airways',  fat: 159, desc: 'Caught fire and crashed into Indian Ocean south of Mauritius. 159 killed.' },

  // Kenya — small aviation
  { lat: -1.13, lon: 37.00, cs: 'WIL201', date: '2014-08-14', ac: 'Cessna 208 Caravan',        op: 'SafariLink Aviation',     fat: 0,   desc: 'Hard landing at Wilson Airport, Nairobi. No injuries.' },
  { lat: -3.42, lon: 36.68, cs: 'AML201', date: '2018-02-05', ac: 'Cessna 208B Caravan',       op: 'Amref Aviation',          fat: 4,   desc: 'Crashed on approach to Arusha; 4 killed including medical crew.' },

  // West / North Africa (regional relevance)
  { lat: 16.27, lon: -1.55, cs: 'AH5017', date: '2014-07-24', ac: 'McDonnell Douglas MD-83',   op: 'Air Algérie',             fat: 116, desc: 'Crashed in Mali during severe thunderstorm. 116 killed.' },
  { lat: 33.50, lon: 28.50, cs: 'MS804',  date: '2016-05-19', ac: 'Airbus A320-232',           op: 'EgyptAir',                fat: 66,  desc: 'Disappeared over Mediterranean en route Cairo–Paris. 66 killed.' },
  { lat: 5.35,  lon: -3.93, cs: 'KQ431',  date: '2000-01-30', ac: 'Boeing 737-200',            op: 'Kenya Airways',           fat: 169, desc: 'Crashed into sea off Abidjan shortly after takeoff. All 169 killed.' },
];


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
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const [riskPanelAirfield, setRiskPanelAirfield] = useState<any | null>(null);
  const [selectedLiveUpdate, setSelectedLiveUpdate] = useState<{ item: any; category: string } | null>(null);
  const [selectedASN, setSelectedASN] = useState<any | null>(null);
  const [selectedACLED, setSelectedACLED] = useState<any | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [dtfOpen, setDtfOpen] = useState(false);
  const [dtfActiveTab, setDtfActiveTab] = useState<string | null>(null);

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

  // Live updates layer refs
  const liveUpdatesLayersRef = useRef<Record<string, { marker: google.maps.Marker }[]>>({
    weather: [],
    securityFeed: [],
    regulation: [],
    commercial: [],
    infrastructure: [],
  });

  // ASN incidents layer refs
  const asnLayersRef = useRef<{ marker: google.maps.Marker }[]>([]);

  // ACLED security events layer refs
  const acledLayersRef = useRef<{ marker: google.maps.Marker }[]>([]);

  // Panel open states
  const [openBuckets, setOpenBuckets] = useState({
    airfields: true,
    liveFlights: true,
    liveUpdates: false,
    aviationSafety: false,
    securityHist: false,
    flightZones: false,
  });

  // Flight path state
  const [drawnPaths, setDrawnPaths] = useState<Record<string, google.maps.Polyline[]>>({});
  const pathPolylinesRef = useRef<Record<string, google.maps.Polyline[]>>({});

  // Great circle calculation - generates points along the great circle route
  const greatCirclePoints = useCallback((from: { lat: number; lng: number }, to: { lat: number; lng: number }, n = 80) => {
    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;
    const lat1 = from.lat * toRad;
    const lon1 = from.lng * toRad;
    const lat2 = to.lat * toRad;
    const lon2 = to.lng * toRad;

    const d = 2 * Math.asin(Math.sqrt(
      Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
    ));

    if (d < 1e-9) return [from, to];

    const pts: { lat: number; lng: number }[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const A = Math.sin((1 - t) * d) / Math.sin(d);
      const B = Math.sin(t * d) / Math.sin(d);
      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);
      pts.push({
        lat: Math.atan2(z, Math.sqrt(x * x + y * y)) * toDeg,
        lng: Math.atan2(y, x) * toDeg
      });
    }
    return pts;
  }, []);

  // Draw flight path on map
  const drawFlightPath = useCallback((flight: any) => {
    const map = mapRef.current;
    if (!map || !flight.from || !flight.to) return;

    // Clear existing path for this flight
    clearFlightPath(flight.cs);

    // Calculate progress based on ETA (simplified - could use actual progress)
    const progress = 0.5; // midpoint for demo, could calculate from actual position

    const points = greatCirclePoints(flight.from, flight.to, 80);
    const splitIdx = Math.round(progress * points.length);
    const flownPts = points.slice(0, splitIdx + 1);
    const remainPts = points.slice(splitIdx);

    // Create polyline for flown portion (green solid)
    const flownPath = new google.maps.Polyline({
      path: flownPts,
      geodesic: true,
      strokeColor: '#10b981',
      strokeOpacity: 0.9,
      strokeWeight: 2.5,
      map: map
    });

    // Create polyline for remaining portion (gray dashed)
    const remainPath = new google.maps.Polyline({
      path: remainPts,
      geodesic: true,
      strokeColor: '#94a3b8',
      strokeOpacity: 0.6,
      strokeWeight: 2,
      map: map
    });

    // Store references
    const paths = [flownPath, remainPath];
    pathPolylinesRef.current[flight.cs] = paths;
    setDrawnPaths(prev => ({ ...prev, [flight.cs]: paths }));
  }, [greatCirclePoints]);

  // Clear flight path
  const clearFlightPath = useCallback((callsign: string) => {
    const paths = pathPolylinesRef.current[callsign];
    if (paths) {
      paths.forEach(p => p.setMap(null));
      delete pathPolylinesRef.current[callsign];
      setDrawnPaths(prev => {
        const next = { ...prev };
        delete next[callsign];
        return next;
      });
    }
  }, []);

  // Toggle flight path
  const toggleFlightPath = useCallback((flight: any) => {
    if (drawnPaths[flight.cs]) {
      clearFlightPath(flight.cs);
    } else {
      drawFlightPath(flight);
    }
  }, [drawnPaths, drawFlightPath, clearFlightPath]);

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

  // Live updates marker creation - simplified to just create markers, popup handled via React state
  const createLiveUpdateMarker = useCallback((map: google.maps.Map, item: any, category: string) => {
    const color = SEVERITY_COLORS[item.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.INFO;
    
    // Create pulsing circle SVG icon
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="6" fill="${color}" opacity="0.3"/>
      <circle cx="12" cy="12" r="4" fill="${color}"/>
      <animate attributeName="r" from="6" to="12" dur="2s" repeatCount="indefinite" begin="0s" fill="freeze" opacity="0.2"/>
    </svg>`;
    
    const marker = new google.maps.Marker({
      position: { lat: item.lat, lng: item.lng },
      map: map,
      icon: {
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12),
      },
      title: `${category}: ${item.title}`,
    });

    marker.addListener('click', () => {
      setSelectedLiveUpdate({ item, category });
      setSelectedAirfield(null);
      setSelectedFlight(null);
    });

    return { marker };
  }, []);

  // Manage live updates layers visibility
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const categories = ['weather', 'securityFeed', 'regulation', 'commercial', 'infrastructure'] as const;
    
    categories.forEach(category => {
      const isVisible = layerVisibility[category];
      const existingItems = liveUpdatesLayersRef.current[category] || [];
      
      if (isVisible && existingItems.length === 0) {
        // Create markers
        const data = LIVE_UPDATES_DATA[category] || [];
        const items = data.map(item => createLiveUpdateMarker(map, item, category));
        liveUpdatesLayersRef.current[category] = items;
      } else if (!isVisible && existingItems.length > 0) {
        // Remove markers
        existingItems.forEach(({ marker }) => marker.setMap(null));
        liveUpdatesLayersRef.current[category] = [];
      }
    });
  }, [layerVisibility, createLiveUpdateMarker]);

  // ASN marker creation - creates markers with colored circles based on fatalities
  const createASNMarker = useCallback((map: google.maps.Map, item: any) => {
    // Color based on fatalities: 0 = amber, < 50 = red, >= 50 = dark red
    const color = item.fat === 0 ? '#f59e0b' : item.fat < 50 ? '#ef4444' : '#7f1d1d';
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="6" fill="${color}" opacity="0.3"/>
      <circle cx="12" cy="12" r="4" fill="${color}"/>
    </svg>`;
    
    const marker = new google.maps.Marker({
      position: { lat: item.lat, lng: item.lon },
      map: map,
      icon: {
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12),
      },
      title: `${item.cs} · ${item.date} · ${item.fat} fatalities`,
    });

    marker.addListener('click', () => {
      setSelectedASN(item);
      setSelectedAirfield(null);
      setSelectedFlight(null);
      setSelectedLiveUpdate(null);
    });

    return { marker };
  }, []);

  // Manage ASN layer visibility
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const isVisible = layerVisibility.asn;
    const existingItems = asnLayersRef.current || [];
    
    if (isVisible && existingItems.length === 0) {
      // Create markers
      const items = ASN_INCIDENTS.map(item => createASNMarker(map, item));
      asnLayersRef.current = items;
    } else if (!isVisible && existingItems.length > 0) {
      // Remove markers
      existingItems.forEach(({ marker }) => marker.setMap(null));
      asnLayersRef.current = [];
    }
  }, [layerVisibility.asn, createASNMarker]);

  // ACLED marker creation - creates markers with colored circles based on event type/severity
  const createACLEDMarker = useCallback((map: google.maps.Map, item: any) => {
    // Color based on event type/severity
    const severityColors: Record<string, string> = {
      'Battles': '#ef4444',
      'Explosions/Remote violence': '#dc2626',
      'Violence against civilians': '#ef4444',
      'Riots': '#f59e0b',
      'Protests': '#3b82f6',
      'Strategic developments': '#8b5cf6',
    };
    const color = severityColors[item.event_type] || '#64748b';
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="6" fill="${color}" opacity="0.3"/>
      <circle cx="12" cy="12" r="4" fill="${color}"/>
    </svg>`;
    
    const marker = new google.maps.Marker({
      position: { lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) },
      map: map,
      icon: {
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12),
      },
      title: `${item.event_type} · ${item.event_date} · ${item.fatalities} fatalities`,
    });

    marker.addListener('click', () => {
      setSelectedACLED(item);
      setSelectedAirfield(null);
      setSelectedFlight(null);
      setSelectedLiveUpdate(null);
      setSelectedASN(null);
    });

    return { marker };
  }, []);

  // Manage ACLED layer visibility
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const isVisible = layerVisibility.acled;
    const existingItems = acledLayersRef.current || [];
    
    if (isVisible && existingItems.length === 0) {
      // Load ACLED data from CSV and create markers
      fetch('/data/acled.csv')
        .then(response => response.text())
        .then(csvText => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const data = results.data
                .filter((row: any) => row.latitude && row.longitude)
                .map((row: any) => ({
                  latitude: row.latitude,
                  longitude: row.longitude,
                  event_type: row.event_type,
                  sub_event_type: row.sub_event_type,
                  actor1: row.actor1,
                  fatalities: parseInt(row.fatalities) || 0,
                  event_date: row.event_date,
                  notes: row.notes,
                  location: row.location,
                  country: row.country,
                }));
              
              const items = data.map(item => createACLEDMarker(map, item));
              acledLayersRef.current = items;
            },
            error: (err: any) => console.error('Failed to parse ACLED data:', err)
          });
        })
        .catch(err => console.error('Failed to load ACLED data:', err));
    } else if (!isVisible && existingItems.length > 0) {
      // Remove markers
      existingItems.forEach(({ marker }) => marker.setMap(null));
      acledLayersRef.current = [];
    }
  }, [layerVisibility.acled]);

  const toggleBucket = (bucket: keyof typeof openBuckets) => {
    setOpenBuckets(prev => ({ ...prev, [bucket]: !prev[bucket] }));
  };

  const toggleLayer = (layer: keyof typeof layerVisibility) => {
    setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const openRiskAssessment = (airfield: any) => {
    setSelectedAirfield(null); // Close the airport popup
    setRiskPanelAirfield(airfield);
    setShowRiskPanel(true);
  };

  // Search handler
  const handleSearch = () => {
    const query = document.getElementById('mapSearchInput') as HTMLInputElement;
    if (!query?.value) return;
    
    const found = AIRFIELDS.find(f => 
      f.name.toLowerCase().includes(query.value.toLowerCase()) ||
      f.code.toLowerCase() === query.value.toLowerCase()
    );
    
    if (found && mapRef.current) {
      mapRef.current.setCenter({ lat: found.coords[0], lng: found.coords[1] });
      mapRef.current.setZoom(10);
      setSelectedAirfield(found);
      setSelectedFlight(null);
      if (focusMode) {
        // Apply focus if enabled
        applyFocus(found);
      }
    }
  };

  const applyFocus = (field: any) => {
    if (!mapRef.current) return;
    // In a real implementation, this would hide other markers
    // For now just center on the field
    mapRef.current.setCenter({ lat: field.coords[0], lng: field.coords[1] });
    mapRef.current.setZoom(10);
  };

  // Focus mode toggle
  const toggleFocusMode = () => {
    const newFocusMode = !focusMode;
    setFocusMode(newFocusMode);
    if (!newFocusMode && selectedAirfield) {
      // Restore all markers
      applyFocus(selectedAirfield);
    }
  };

  // Search airport
  const searchAirport = () => {
    const input = document.querySelector('input[placeholder="Search airport or ICAO"]') as HTMLInputElement;
    if (!input) return;
    const query = input.value.toLowerCase();
    const found = AIRFIELDS.find(f => 
      f.name.toLowerCase().includes(query) || f.code.toLowerCase() === query
    );
    if (found && mapRef.current) {
      mapRef.current.setCenter({ lat: found.coords[0], lng: found.coords[1] });
      mapRef.current.setZoom(10);
      setSelectedAirfield(found);
      setSelectedFlight(null);
      setSelectedLiveUpdate(null);
    }
  };

  // Zoom controls
  const zoomIn = () => {
    const map = mapRef.current;
    if (map) {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined) {
        map.setZoom(currentZoom + 1);
      }
    }
  };
  const zoomOut = () => {
    const map = mapRef.current;
    if (map) {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined) {
        map.setZoom(currentZoom - 1);
      }
    }
  };

  // Date & Time Filter handlers
  const toggleDtfDropdown = () => setDtfOpen(!dtfOpen);
  const toggleDtfPanel = (panel: string) => {
    setDtfActiveTab(dtfActiveTab === panel ? null : panel);
  };
  const applyACLEDDateFilter = () => {
    // Implement date filtering for ACLED
    console.log('Apply ACLED date filter');
    setDtfOpen(false);
  };
  const resetACLEDFilter = () => {
    console.log('Reset ACLED filter');
  };
  const applyASNDateFilter = () => {
    console.log('Apply ASN date filter');
    setDtfOpen(false);
  };
  const resetASNFilter = () => {
    console.log('Reset ASN filter');
  };

  return (
    <div className="relative h-full w-full isolate" ref={mapContainerRef}>
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

            {/* Custom Popup - matches POC design exactly */}
            {selectedAirfield && (
              <div 
                className="absolute z-50"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto'
                }}
              >
                <div 
                  className="bg-bg-2 text-text font-body overflow-hidden border border-border"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    color: 'var(--text)',
                    width: '620px',
                    boxShadow: '0 4px 20px rgba(0,0,0,.4)',
                    borderRadius: '10px',
                    margin: 0,
                    padding: 0
                  }}
                >
                  {/* Image Container with Close Button */}
                  <div className="relative h-64 w-full overflow-hidden group">
                    <img src={selectedAirfield.image} alt={selectedAirfield.name} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setSelectedAirfield(null)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Header */}
                  <div style={{ padding: '10px 12px 0' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text)', marginBottom: '2px' }}>{selectedAirfield.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '1px' }}>ICAO: {selectedAirfield.code}</div>
                    <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{selectedAirfield.city.toUpperCase()}</div>

                    {/* Two-column layout */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '8px' }}>
                      {/* Left: Facility Information Table */}
                      <table style={{ flex: '0 0 auto', borderCollapse: 'collapse', fontSize: '11px', minWidth: '180px' }}>
                        <tbody>
                          <tr>
                            <td style={{ color: 'var(--text-2)', padding: '2px 8px 2px 0', whiteSpace: 'nowrap' }}>Time Zone</td>
                            <td style={{ color: 'var(--text)', fontWeight: '600', padding: '2px 0' }}>{selectedAirfield.timezone}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-2)', padding: '2px 8px 2px 0' }}>Category</td>
                            <td style={{ color: 'var(--text)', fontWeight: '600', padding: '2px 0' }}>{selectedAirfield.category}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-2)', padding: '2px 8px 2px 0' }}>Elevation</td>
                            <td style={{ color: 'var(--text)', fontWeight: '600', padding: '2px 0' }}>{selectedAirfield.elevation}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-2)', padding: '2px 8px 2px 0' }}>Runway</td>
                            <td style={{ color: 'var(--text)', fontWeight: '600', padding: '2px 0', fontSize: '10.5px' }}>{selectedAirfield.runways}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-2)', padding: '2px 8px 2px 0', whiteSpace: 'nowrap' }}>ATC / Airspace</td>
                            <td style={{ color: 'var(--text)', fontWeight: '600', padding: '2px 0', fontSize: '10.5px' }}>{selectedAirfield.atc}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-2)', padding: '2px 8px 2px 0', whiteSpace: 'nowrap' }}>Night Operations</td>
                            <td style={{ color: 'var(--text)', fontWeight: '600', padding: '2px 0' }}>{selectedAirfield.nightoperations}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-2)', padding: '2px 8px 2px 0', whiteSpace: 'nowrap' }}>Fuel / Facilities</td>
                            <td style={{ color: 'var(--text)', fontWeight: '600', padding: '2px 0', fontSize: '10.5px' }}>{selectedAirfield.fuel}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Right: Risk Assessment & Domain Scores */}
                      <div style={{ flex: '1', minWidth: 0 }}>
                        <div style={{ fontSize: '11px', color: 'var(--text)', marginBottom: '6px' }}>
                          Mean Impact Severity: <strong>{selectedAirfield.riskScore}/25</strong>&nbsp;
                          <span 
                            style={{
                              background: selectedAirfield.riskScore >= 21 ? '#dc2626' : selectedAirfield.riskScore >= 12 ? '#ea580c' : selectedAirfield.riskScore >= 6 ? '#d97706' : '#16a34a',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '1px 7px',
                              borderRadius: '3px',
                              display: 'inline-block'
                            }}
                          >
                            {selectedAirfield.riskScore >= 21 ? 'EXTREME' : selectedAirfield.riskScore >= 12 ? 'HIGH' : selectedAirfield.riskScore >= 6 ? 'MEDIUM' : 'LOW'}
                          </span>
                        </div>

                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                          <thead>
                            <tr>
                              <th style={{ fontSize: '9.5px', fontWeight: '600', color: 'var(--text-2)', textAlign: 'left', padding: '0 8px 4px 0', letterSpacing: '.04em' }}>Domain</th>
                              <th style={{ fontSize: '9.5px', fontWeight: '600', color: 'var(--text-2)', textAlign: 'right', padding: '0 0 4px', letterSpacing: '.04em' }}>Impact Severity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(selectedAirfield.domains).map(([key, domain]: [string, any]) => {
                              const domainBg = domain.score >= 21 ? '#dc2626' : domain.score >= 12 ? '#ea580c' : domain.score >= 6 ? '#d97706' : '#16a34a';
                              const domainLbl = domain.score >= 21 ? 'EXTREME' : domain.score >= 12 ? 'HIGH' : domain.score >= 6 ? 'MEDIUM' : 'LOW';
                              return (
                                <tr key={key}>
                                  <td style={{ padding: '4px 8px 4px 0', fontSize: '11px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>{key}</div>
                                    <div style={{ fontSize: '9px', color: 'var(--text-2)' }}>{domain.name}</div>
                                  </td>
                                  <td style={{ padding: '4px 0', textAlign: 'right' }}>
                                    <span 
                                      style={{
                                        display: 'inline-block',
                                        minWidth: '68px',
                                        padding: '2px 8px',
                                        borderRadius: '3px',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        color: '#fff',
                                        background: domainBg,
                                        textAlign: 'center'
                                      }}
                                    >
                                      {domainLbl}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div style={{ marginTop: '8px', paddingTop: '7px', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text)' }}>Additional Info</span>
                    </div>

                    {/* Button */}
                    <button 
                      onClick={() => openRiskAssessment(selectedAirfield)}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginTop: '8px',
                        marginBottom: '10px',
                        padding: '7px 0',
                        background: 'var(--accent)',
                        color: '#fff',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        letterSpacing: '.03em'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-h)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
                    >
                      Airport Risk Assessment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedFlight && (
              <div 
                className="absolute z-50"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto'
                }}
              >
                <div 
                  className="bg-bg-2 text-text font-body overflow-hidden border border-border"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    color: 'var(--text)',
                    width: '320px',
                    boxShadow: '0 4px 20px rgba(0,0,0,.4)',
                    borderRadius: '10px',
                    margin: 0,
                    padding: 0
                  }}
                >
                  {/* Close Button */}
                  <button 
                    onClick={() => setSelectedFlight(null)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      zIndex: 10,
                      background: 'rgba(0,0,0,0.6)',
                      border: 'none',
                      color: 'white',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✕
                  </button>
                  <div style={{ padding: '10px 14px 0' }}>
                    {/* Airline Badge */}
                    <div style={{ marginBottom: '6px' }}>
                      <span 
                        style={{
                          display: 'inline-block',
                          background: `${selectedFlight.color}22`,
                          color: selectedFlight.color,
                          border: `1px solid ${selectedFlight.color}55`,
                          fontSize: '9px',
                          fontWeight: '800',
                          padding: '1px 7px',
                          borderRadius: '3px',
                          letterSpacing: '.06em',
                          textTransform: 'uppercase'
                        }}
                      >
                        {selectedFlight.airline.toUpperCase()}
                      </span>
                    </div>

                    {/* Flight Number */}
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', letterSpacing: '.02em', marginBottom: '2px' }}>
                      {selectedFlight.cs}
                    </h3>

                    {/* Aircraft Type */}
                    <p style={{ fontSize: '10.5px', color: 'var(--text-2)', marginBottom: '10px' }}>
                      {selectedFlight.acFull || selectedFlight.ac}
                    </p>

                    {/* Route Display */}
                    <div style={{ background: 'var(--bg-2)', borderRadius: '6px', padding: '8px 10px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        {/* Origin */}
                        <div style={{ textAlign: 'left', minWidth: 0 }}>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)' }}>
                            {selectedFlight.origCode || selectedFlight.fr}
                          </div>
                          <div style={{ fontSize: '9.5px', color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                            {selectedFlight.origCity || selectedFlight.fr}
                          </div>
                        </div>

                        {/* Progress */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>✈</div>
                          <div style={{ height: '1px', background: 'var(--border)', margin: '2px 4px', position: 'relative' }}>
                            <div style={{ 
                              position: 'absolute', 
                              top: '-2px', 
                              left: '50%', 
                              width: '5px', 
                              height: '5px', 
                              background: selectedFlight.isKQ ? '#10b981' : '#818cf8', 
                              borderRadius: '50%', 
                              transform: 'translateX(-50%)' 
                            }}></div>
                          </div>
                          <div style={{ fontSize: '8.5px', color: 'var(--text-3)', marginTop: '2px' }}>En Route</div>
                        </div>

                        {/* Destination */}
                        <div style={{ textAlign: 'right', minWidth: 0 }}>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)' }}>
                            {selectedFlight.destCode || selectedFlight.to}
                          </div>
                          <div style={{ fontSize: '9.5px', color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                            {selectedFlight.destCity || selectedFlight.to}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Table */}
                    <table style={{ fontSize: '11px', width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0', width: '42%' }}>ETA</td>
                          <td style={{ fontWeight: '700', color: '#10b981' }}>{selectedFlight.eta} remaining</td>
                        </tr>
                        {selectedFlight.depTime ? (
                          <>
                            <tr>
                              <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Departed</td>
                              <td style={{ fontWeight: '600', color: 'var(--text)' }}>
                                {new Date(selectedFlight.depTime).toISOString().substr(11, 5)}Z
                              </td>
                            </tr>
                          </>
                        ) : null}
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Altitude</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>
                            FL{String(Math.round(selectedFlight.alt / 100)).padStart(3, '0')}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Est. Speed</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedFlight.speed} kt</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Heading</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedFlight.heading}°</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Flight Time</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>
                            {/* Estimate total flight time from ETA */}
                            {(() => {
                              const etaMatch = selectedFlight.eta.match(/(\d+)h?\s*(\d+)?m?/);
                              if (etaMatch) {
                                const hrs = parseInt(etaMatch[1] || '0');
                                const mins = parseInt(etaMatch[2] || '0');
                                return `${hrs}h ${String(mins).padStart(2, '0')}m total`;
                              }
                              return 'N/A';
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Full Path Button */}
                    <button 
                      onClick={() => toggleFlightPath(selectedFlight)}
                      className="mt-3 w-full rounded-md bg-accent py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent-h"
                      style={{
                        display: 'block',
                        width: '100%',
                        marginTop: '10px',
                        marginBottom: '10px',
                        padding: '7px 0',
                        background: 'var(--accent)',
                        color: '#fff',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        letterSpacing: '.03em'
                      }}
                    >
                      {drawnPaths[selectedFlight.cs] ? '✕ Clear Path' : '🗺 Full Path'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Update Popup - centered modal like airfields/flights */}
            {selectedLiveUpdate && (
              <div 
                className="absolute z-50"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto'
                }}
              >
                <div 
                  className="bg-bg-2 text-text font-body overflow-hidden border border-border"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    color: 'var(--text)',
                    width: '360px',
                    boxShadow: '0 4px 20px rgba(0,0,0,.4)',
                    borderRadius: '10px',
                    margin: 0,
                    padding: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 12px 0' }}>
                    <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.08em', color: SEVERITY_COLORS[selectedLiveUpdate.item.severity as keyof typeof SEVERITY_COLORS], marginBottom: '6px' }}>
                      {selectedLiveUpdate.category.toUpperCase()} &nbsp;·&nbsp; {selectedLiveUpdate.item.severity}
                    </div>
                    <button 
                      onClick={() => setSelectedLiveUpdate(null)}
                      style={{
                        background: 'var(--bg-3)',
                        border: 'none',
                        color: 'var(--text-2)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        padding: 0,
                        lineHeight: 1
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ padding: '8px 14px 12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', lineHeight: 1.35, marginBottom: '4px' }}>{selectedLiveUpdate.item.title}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-2)', lineHeight: 1.45, marginBottom: '6px' }}>{selectedLiveUpdate.item.detail}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>{selectedLiveUpdate.item.time}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ASN Incident Popup - centered modal matching POC design */}
            {selectedASN && (
              <div 
                className="absolute z-50"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto'
                }}
              >
                <div 
                  className="bg-bg-2 text-text font-body overflow-hidden border border-border"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    color: 'var(--text)',
                    width: '360px',
                    boxShadow: '0 4px 20px rgba(0,0,0,.4)',
                    borderRadius: '10px',
                    margin: 0,
                    padding: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 12px 0' }}>
                    <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.08em', color: '#ef4444', marginBottom: '6px' }}>
                      ASN INCIDENT
                    </div>
                    <button 
                      onClick={() => setSelectedASN(null)}
                      style={{
                        background: 'var(--bg-3)',
                        border: 'none',
                        color: 'var(--text-2)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        padding: 0,
                        lineHeight: 1
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ padding: '8px 14px 12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', lineHeight: 1.35, marginBottom: '6px' }}>
                      {selectedASN.cs} · {selectedASN.date}
                    </div>
                    <table style={{ fontSize: '11.5px', width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0', width: '40%' }}>Operator</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedASN.op}</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Aircraft</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedASN.ac}</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Fatalities</td>
                          <td style={{ fontWeight: '700', color: selectedASN.fat > 0 ? '#ef4444' : '#10b981' }}>{selectedASN.fat}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                      {selectedASN.desc}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACLED Security Events Popup - centered modal matching ASN design */}
            {selectedACLED && (
              <div 
                className="absolute z-50"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto'
                }}
              >
                <div 
                  className="bg-bg-2 text-text font-body overflow-hidden border border-border"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    color: 'var(--text)',
                    width: '360px',
                    boxShadow: '0 4px 20px rgba(0,0,0,.4)',
                    borderRadius: '10px',
                    margin: 0,
                    padding: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 12px 0' }}>
                    <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.08em', color: '#ef4444', marginBottom: '6px' }}>
                      ACLED EVENT
                    </div>
                    <button 
                      onClick={() => setSelectedACLED(null)}
                      style={{
                        background: 'var(--bg-3)',
                        border: 'none',
                        color: 'var(--text-2)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        padding: 0,
                        lineHeight: 1
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ padding: '8px 14px 12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', lineHeight: 1.35, marginBottom: '6px' }}>
                      {selectedACLED.event_type} &nbsp;·&nbsp; {selectedACLED.event_date}
                    </div>
                    <table style={{ fontSize: '11.5px', width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0', width: '40%' }}>Sub-event</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedACLED.sub_event_type || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Actor</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedACLED.actor1 || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Fatalities</td>
                          <td style={{ fontWeight: '700', color: selectedACLED.fatalities > 0 ? '#ef4444' : '#10b981' }}>{selectedACLED.fatalities}</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Location</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedACLED.location || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Country</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedACLED.country || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                      {selectedACLED.notes || 'No additional details available.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </GoogleMap>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-2 text-text-2">
            Loading Map...
          </div>
        )}

        {/* Zoom Controls - Top Left (before search box) */}
        <div style={{ position: 'absolute', top: '15px', left: '9px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={zoomIn}
            style={{ width: '36px', height: '36px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: '600', color: 'var(--text-2)', boxShadow: 'var(--shadow)' }}
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            style={{ width: '36px', height: '36px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: '600', color: 'var(--text-2)', boxShadow: 'var(--shadow)' }}
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* Search Box - Top Left (exact POC design) */}
        <div className="search-box" style={{ top: '15px', left: '50px', zIndex: 9999, display: 'flex', gap: '8px', background: 'var(--bg-2)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px' }}>
          <input
            type="text"
            id="searchInput"
            placeholder="Search airport or ICAO"
            style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid var(--border-2)', background: 'var(--bg-3)', color: 'var(--text)', width: '220px', fontSize: '12px' }}
            onKeyDown={(e) => e.key === 'Enter' && searchAirport()}
          />
          <button
            onClick={searchAirport}
            style={{ padding: '6px 10px', border: 'none', borderRadius: '5px', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-body)' }}
          >
            Search
          </button>
        </div>

        {/* Focus Toggle - Below Search (exact POC design) */}
        <div className="toggle-box" style={{ top: '70px', left: '50px', zIndex: 9999, background: 'var(--bg-2)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'var(--text)', fontSize: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" id="focusMode" onChange={toggleFocusMode} style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
            <span>Focus</span>
          </label>
        </div>

        {/* Date & Time Filter - Top Center (exact POC design) */}
        <div id="dtf-widget" style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 2147483647, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)' }}>
          <button
            id="dtf-trigger"
            onClick={toggleDtfDropdown}
            style={{ background: 'var(--bg-2)', border: '2px solid var(--accent)', borderRadius: '8px', padding: '8px 14px', color: 'var(--text-2)', fontSize: '12px', fontWeight: '600', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 18H5V9h14v12zM5 7V5h14v2H5zm2 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>
            <span>Date & Time Filter</span>
            <svg className="dtf-chev h-3 w-3 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div id="dtf-dropdown" style={{ 
              position: 'absolute', 
              top: 'calc(100% + 6px)', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              background: 'var(--bg-2)', 
              border: '1px solid var(--border)', 
              borderRadius: '10px', 
              boxShadow: '0 6px 24px rgba(0,0,0,.35)', 
              minWidth: '260px',
              display: dtfOpen ? 'block' : 'none'
            }}>
            <div className="dtf-menu-item" onClick={() => toggleDtfPanel('acled')}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
              ACLED Filter
              <svg className="dtf-item-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div id="dtf-panel-acled" className={`dtf-panel ${dtfActiveTab === 'acled' ? 'dtf-panel-show' : ''}`}>
              <div className="dtf-panel-title">ACLED Security Events</div>
              <div className="dtf-row">
                <span className="dtf-label">From</span>
                <input type="date" id="acledFrom" className="flex-1 px-2 py-1 bg-bg-2 border border-border-2 rounded text-text text-xs outline-none focus:border-accent" />
              </div>
              <div className="dtf-row">
                <span className="dtf-label">To</span>
                <input type="date" id="acledTo" className="flex-1 px-2 py-1 bg-bg-2 border border-border-2 rounded text-text text-xs outline-none focus:border-accent" />
              </div>
              <div className="dtf-actions">
                <button onClick={applyACLEDDateFilter} className="dtf-btn dtf-btn-apply">Apply</button>
                <button onClick={resetACLEDFilter} className="dtf-btn dtf-btn-reset">Reset</button>
              </div>
            </div>
            <div className="dtf-menu-item" onClick={() => toggleDtfPanel('asn')}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/></svg>
              ASN Filter
              <svg className="dtf-item-chev" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div id="dtf-panel-asn" className={`dtf-panel ${dtfActiveTab === 'asn' ? 'dtf-panel-show' : ''}`}>
              <div className="dtf-panel-title">ASN Aviation Incidents</div>
              <div className="dtf-row">
                <span className="dtf-label">From</span>
                <input type="date" id="asnFrom" className="flex-1 px-2 py-1 bg-bg-2 border border-border-2 rounded text-text text-xs outline-none focus:border-accent" />
              </div>
              <div className="dtf-row">
                <span className="dtf-label">To</span>
                <input type="date" id="asnTo" className="flex-1 px-2 py-1 bg-bg-2 border border-border-2 rounded text-text text-xs outline-none focus:border-accent" />
              </div>
              <div className="dtf-actions">
                <button onClick={applyASNDateFilter} className="dtf-btn dtf-btn-apply">Apply</button>
                <button onClick={resetASNFilter} className="dtf-btn dtf-btn-reset">Reset</button>
              </div>
            </div>
          </div>
        </div>

        {/* Layer Toggle Button */}
        <button
          id="layerToggleBtn"
          onClick={() => setShowLayerPanel(prev => !prev)}
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg-2)',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-2)',
            boxShadow: 'var(--shadow)',
            cursor: 'pointer',
            transition: 'background .15s, color .15s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}><path d="M3 6h18v2H3V6zm3 5h12v2H6v-2zm3 5h6v2H9v-2z"/></svg>
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
        {/* Risk Assessment Panel - Slides in from left */}
        <div 
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '560px',
            backgroundColor: 'var(--bg-2)',
            color: 'var(--text)',
            overflowY: 'auto',
            zIndex: 2147483647,
            transition: 'transform 0.35s ease',
            transform: showRiskPanel ? 'translateX(0)' : 'translateX(-100%)',
            boxShadow: '4px 0 24px rgba(0,0,0,.5)',
            borderRight: '1px solid var(--border)',
            borderTop: '1px solid var(--border)'
          }}
        >
          {showRiskPanel && riskPanelAirfield && (
            <div style={{ padding: '16px' }}>
              {/* Close Button */}
              <button
                onClick={() => setShowRiskPanel(false)}
                style={{
                  background: 'var(--bg-3)',
                  border: 'none',
                  color: 'var(--text-2)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  float: 'right',
                  marginBottom: '12px',
                  flexShrink: 0,
                  padding: 0
                }}
              >
                ✖
              </button>

              {/* Panel Header */}
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border)', clear: 'both' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text)', letterSpacing: '.04em', lineHeight: 1.3 }}>
                  {riskPanelAirfield.name.toUpperCase()} – {riskPanelAirfield.code}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-2)', marginTop: '3px', fontWeight: '600', letterSpacing: '.06em' }}>
                  {riskPanelAirfield.city.toUpperCase()}
                </div>
              </div>

              {/* Summary Info Table */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ color: 'var(--text-2)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', padding: '5px 12px 5px 0', verticalAlign: 'top', whiteSpace: 'nowrap', width: '38%' }}>Worst-Credible Domain</td>
                      <td style={{ color: 'var(--text)', fontWeight: '600', padding: '5px 0', verticalAlign: 'top' }}>{riskPanelAirfield.worstCredibleDomain || 'D2 – Airport Infrastructure & Assets'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ color: 'var(--text-2)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', padding: '5px 12px 5px 0', verticalAlign: 'top', whiteSpace: 'nowrap', width: '38%' }}>Mass Impact Severity</td>
                      <td style={{ color: 'var(--text)', fontWeight: '600', padding: '5px 0', verticalAlign: 'top' }}>
                        {(riskPanelAirfield.meanImpactSeverity !== undefined ? riskPanelAirfield.meanImpactSeverity.toFixed(3) : (riskPanelAirfield.riskScore / 16).toFixed(3))} &nbsp;
                        <span style={{ 
                          background: riskPanelAirfield.riskScore >= 21 ? '#dc2626' : riskPanelAirfield.riskScore >= 12 ? '#ea580c' : riskPanelAirfield.riskScore >= 6 ? '#d97706' : '#16a34a', 
                          color: '#fff', 
                          padding: '1px 7px', 
                          borderRadius: '3px', 
                          fontSize: '10.5px', 
                          fontWeight: '700', 
                          display: 'inline-block', 
                          marginLeft: '8px' 
                        }}>
                          {riskPanelAirfield.riskScore >= 21 ? 'EXTREME' : riskPanelAirfield.riskScore >= 12 ? 'HIGH' : riskPanelAirfield.riskScore >= 6 ? 'MEDIUM' : 'LOW'}
                        </span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ color: 'var(--text-2)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', padding: '5px 12px 5px 0', verticalAlign: 'top', whiteSpace: 'nowrap', width: '38%' }}>Status</td>
                      <td style={{ padding: '5px 0', verticalAlign: 'top' }}>
                        <div style={{ background: riskPanelAirfield.riskScore >= 21 ? '#dc2626' : riskPanelAirfield.riskScore >= 12 ? '#ea580c' : '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '11.5px', letterSpacing: '.06em', textAlign: 'center', display: 'block' }}>
                          {riskPanelAirfield.riskScore >= 21 ? 'DISRUPTED' : riskPanelAirfield.riskScore >= 12 ? 'ELEVATED' : 'OPERATIONAL'}
                        </div>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ color: 'var(--text-2)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', padding: '5px 12px 5px 0', verticalAlign: 'top', whiteSpace: 'nowrap', width: '38%' }}>Active Disruptions</td>
                      <td style={{ color: 'var(--text)', fontWeight: '600', padding: '5px 0', verticalAlign: 'top', fontSize: '11.5px' }}>
                        {riskPanelAirfield.activeDisruptions?.join(' / ') || 'Entry & Exit Mobility / Solicitation / Strike / Infrastructure Fragility / Low-Level Criminality'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text-2)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em', padding: '5px 12px 5px 0', verticalAlign: 'top', whiteSpace: 'nowrap', width: '38%' }}>Last Update</td>
                      <td style={{ color: 'var(--text)', fontWeight: '600', padding: '5px 0', verticalAlign: 'top' }}>{riskPanelAirfield.lastUpdate || '20 May 2026'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Threat Profile / Narrative */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>Operational Summary</div>
                <p style={{ fontSize: '12.5px', lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{riskPanelAirfield.threatProfile}</p>
              </div>

              {/* Domain-Based Impact Assessment */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>Domain-Based Impact Assessment</div>
                <p style={{ fontSize: '10.5px', color: 'var(--text-2)', margin: '4px 0 8px', lineHeight: 1.5 }}>Five domains, scored against impact severity. Each row represents one operational domain. The working formula shown is: <strong>Likelihood (1–5) × Impact (1–5)</strong> | Impact Severity Bands: Low = 1–5, Medium = 6–10, High = 12–20, Extreme = 25</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-3)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '11px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Category</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '11px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>L×I</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '11px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Impact Severity Band</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '11px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(riskPanelAirfield.domains).map(([key, domain]: [string, any], idx) => {
                      const assessment = riskPanelAirfield.domainImpactAssessment?.[idx];
                      const likelihood = assessment?.likelihoods || 1;
                      const impact = assessment?.impact || domain.score;
                      const liProduct = likelihood * impact;
                      const severityBand = domain.score >= 21 ? 'EXTREME' : domain.score >= 12 ? 'HIGH' : domain.score >= 6 ? 'MEDIUM' : 'LOW';
                      const bandColor = domain.score >= 21 ? '#dc2626' : domain.score >= 12 ? '#ea580c' : domain.score >= 6 ? '#d97706' : '#16a34a';
                      return (
                        <tr key={key} style={{ background: idx % 2 === 0 ? 'var(--bg-2)' : 'var(--bg-3)' }}>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', verticalAlign: 'top', color: 'var(--text)' }}>
                            <div style={{ fontWeight: '600' }}>{key} – {domain.name}</div>
                          </td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', verticalAlign: 'top', textAlign: 'center', fontFamily: 'monospace', fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {likelihood}×{impact}={liProduct}
                          </td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', verticalAlign: 'top', textAlign: 'center' }}>
                            <span style={{ background: bandColor, color: '#fff', padding: '2px 8px', borderRadius: '3px', fontSize: '10px', fontWeight: '700', display: 'inline-block', whiteSpace: 'nowrap' }}>
                              {severityBand}
                            </span>
                          </td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', verticalAlign: 'top', color: 'var(--text)', fontSize: '11px' }}>
                            {assessment?.rationale || 'Assessment data pending.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Servicing & Carriers */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>Servicing & Carriers</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-3)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Hub Carriers</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.servicingAndCarriers?.hubCarriers || 'See airport website'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Global Carriers</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.servicingAndCarriers?.globalCarriers || 'Limited international access'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-3)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Regional Feeders</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.servicingAndCarriers?.regionalFeeders || 'Regional operators — confirm with airport authority'}</td>
                    </tr>
                    <tr style={{ background: 'var(--bg-2)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Strategic Use</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.servicingAndCarriers?.strategicUse || 'Passenger hub, cargo, diplomatic and humanitarian operations'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Groundside & Personal Security */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>Groundside & Personal Security</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-3)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '11px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Segment</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '11px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Identified Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Airside / Landside</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.groundsideSecurityRisks?.airsideLandside || 'Elevated risk of unauthorised solicitation, profiling and distraction theft in the arrivals zone.'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-3)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Customs & Processing</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.groundsideSecurityRisks?.customsProcessing || 'Ongoing exposure to low-level corruption and informal payment requests; engage only with uniformed officials.'}</td>
                    </tr>
                    <tr style={{ background: 'var(--bg-2)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Ground Transport</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.groundsideSecurityRisks?.groundTransport || 'Significant risk of in-traffic robbery and carjacking at road access chokepoints; use pre-verified, secure transport only.'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Other Realities */}
              <div style={{ padding: '12px 18px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>Other Realities</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-3)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '11px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Factor</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700', fontSize: '11px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>Commentary</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Departure Timing</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.otherRealities?.departureTiming || '2–3 hour lead time recommended. Minor congestion and seasonal weather may affect processing times.'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-3)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Infrastructure Reliability</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.otherRealities?.infrastructureReliability || 'Infrastructure broadly reliable; minor seasonal maintenance gaps noted.'}</td>
                    </tr>
                    <tr style={{ background: 'var(--bg-2)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '600', whiteSpace: 'nowrap', width: '35%', color: 'var(--text-2)', fontSize: '11px' }}>Transit Risk</td>
                      <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{riskPanelAirfield.otherRealities?.transitRisk || 'Flight operations are stable; transit risk is moderate and manageable with standard precautions.'}</td>
                    </tr>
                  </tbody>
                </table>
</div>
              </div>
            )}

            {/* ASN Incident Popup - centered modal like live updates */}
            {selectedASN && (
              <div 
                className="absolute z-50"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto'
                }}
              >
                <div 
                  className="bg-bg-2 text-text font-body overflow-hidden border border-border"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    color: 'var(--text)',
                    width: '360px',
                    boxShadow: '0 4px 20px rgba(0,0,0,.4)',
                    borderRadius: '10px',
                    margin: 0,
                    padding: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 12px 0' }}>
                    <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.08em', color: '#ef4444', marginBottom: '6px' }}>
                      ASN INCIDENT
                    </div>
                    <button 
                      onClick={() => setSelectedASN(null)}
                      style={{
                        background: 'var(--bg-3)',
                        border: 'none',
                        color: 'var(--text-2)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        padding: 0,
                        lineHeight: 1
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ padding: '8px 14px 12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', lineHeight: 1.35, marginBottom: '6px' }}>
                      {selectedASN.cs} &nbsp;·&nbsp; {selectedASN.date}
                    </div>
                    <table style={{ fontSize: '11.5px', width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                      <tbody>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0', width: '40%' }}>Operator</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedASN.op}</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Aircraft</td>
                          <td style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedASN.ac}</td>
                        </tr>
                        <tr>
                          <td style={{ color: 'var(--text-2)', padding: '3px 0' }}>Fatalities</td>
                          <td style={{ fontWeight: '700', color: selectedASN.fat > 0 ? '#ef4444' : '#10b981' }}>{selectedASN.fat}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                      {selectedASN.desc}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>    </div>
  );
}