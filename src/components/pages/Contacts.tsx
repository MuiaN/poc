"use client";

import { useMemo, useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { 
  civilContacts, 
  emergencyContacts, 
  insuranceContacts, 
  maintenanceContacts,
  TABS,
  type TabKey,
  type ContactCard,
  type InsuranceContact,
  type MaintenanceContact,
  type EmergRow,
} from "@/data/contacts";

const FLAG_BASE = "https://flagcdn.com/w20";

const GROUP_LABELS = {
  east: "East Africa",
  horn: "Horn & Central Africa",
};

const INSURANCE_GROUP_LABELS = {
  broker: "Aviation Brokers",
  partner: "Partners",
};

const GROUP_ORDER = ["east", "horn"] as const;

const INSURANCE_GROUP_ORDER = ["broker", "partner"] as const;

function getGroupLabels(tab: TabKey): Record<string, string> {
  return tab === "insurance" ? INSURANCE_GROUP_LABELS : GROUP_LABELS;
}

function getGroupOrder(tab: TabKey) {
  return tab === "insurance" ? INSURANCE_GROUP_ORDER : GROUP_ORDER;
}

function getDefaultGroup(tab: TabKey): "east" | "horn" | "broker" | "partner" | "all" {
  return "all";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\+\d][\d\s\|]{6,}$/;
const URL_RE = /^(https?:\/\/|www\.)/i;

function guessDetailType(detail: string): "phone" | "email" | "url" | "location" {
  if (EMAIL_RE.test(detail.trim())) return "email";
  if (URL_RE.test(detail.trim())) return "url";
  if (PHONE_RE.test(detail.trim())) return "phone";
  return "location";
}

function BadgeCustom({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{ background: bg, color }} className="inline-block text-[10px] font-semibold px-2 py-[1px] rounded-[2px] whitespace-nowrap">
      {children}
    </span>
  );
}

function EmergIcon({ type }: { type: EmergRow["type"] }) {
  const icons = {
    police: { label: "P", class: "e-p" },
    fire: { label: "F", class: "e-f" },
    medical: { label: "M", class: "e-m" },
    other: { label: "+", class: "e-o" },
  };
  const { label, class: cls } = icons[type];
  return <div className={`e-icon ${cls}`}>{label}</div>;
}

function DetailIcon({ type }: { type: "phone" | "email" | "url" | "location" }) {
  const icons = {
    phone: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    email: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    url: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    location: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  };
  return <span className="ic">{icons[type]}</span>;
}

function CivilCard({ contact, accentBg, accentText }: { 
  contact: ContactCard; 
  accentBg: string; 
  accentText: string; 
}) {
  return (
    <Card className="p-3.5 border-l-[3px]" style={{ borderLeftColor: "var(--accent)" }}>
      <div className="flex items-start gap-2 mb-1">
        <div className="card-flag flex-shrink-0 mt-0.5">
          <img src={`${FLAG_BASE}/${contact.flag}.png`} alt="" className="flag-code" width="22" height="15" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[12.5px] text-text leading-snug mb-0.5">{contact.org}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-2">{contact.country}</div>
        </div>
        <BadgeCustom bg={accentBg} color={accentText}>Civil</BadgeCustom>
      </div>
      <div className="border-t border-border my-1.5" />
      <div className="flex flex-col gap-1 text-[12px] text-text">
        {contact.details?.map((d, i) => {
          const type = guessDetailType(d);
          return (
            <div key={i} className="flex items-start gap-1.5">
              <DetailIcon type={type} />
              <span>
                {type === "email" && <a href={`mailto:${d}`} className="text-accent text-[11.5px] hover:underline">{d}</a>}
                {type !== "email" && d}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EmergencyCard({ contact, accentBg, accentText }: { 
  contact: ContactCard; 
  accentBg: string; 
  accentText: string; 
}) {
  return (
    <Card className="p-3.5 border-l-[3px]" style={{ borderLeftColor: "var(--accent)" }}>
      <div className="flex items-start gap-2 mb-1">
        <div className="card-flag flex-shrink-0 mt-0.5">
          <img src={`${FLAG_BASE}/${contact.flag}.png`} alt="" className="flag-code" width="22" height="15" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[12.5px] text-text leading-snug mb-0.5">{contact.org}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-2">{contact.country}</div>
        </div>
        <BadgeCustom bg={accentBg} color={accentText}>Emergency</BadgeCustom>
      </div>
      <div className="border-t border-border my-1.5" />
      <div className="flex flex-col gap-1">
        {contact.emergRows?.map((row, i) => (
          <div key={i} className="grid grid-cols-[18px_1fr] gap-1.5 items-start">
            <EmergIcon type={row.type} />
            <span className={row.type === "other" ? "e-note" : "e-val text-danger font-bold"}>{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InsuranceCard({ contact, accentBg, accentText }: { 
  contact: InsuranceContact; 
  accentBg: string; 
  accentText: string; 
}) {
  return (
    <Card className="p-3.5 border-l-[3px]" style={{ borderLeftColor: "var(--accent)" }}>
      <div className="flex gap-2.5 mb-1.5">
        <div className="w-10 h-10 flex-shrink-0 border border-border rounded-[3px] flex items-center justify-center overflow-hidden bg-bg-3">
          <span className="text-[10px] font-bold text-text-2">{contact.org.slice(0, 2)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[13px] text-text leading-snug">{contact.org}</div>
          {contact.country && (
            <div className="text-[11px] font-semibold text-success mt-0.5">Insurance Broker</div>
          )}
        </div>
      </div>
      {contact.type === "partner" && (
        <div className="partners-sep text-[11px] font-bold text-success uppercase tracking-wide border-t border-border pt-2 mt-1">Partners</div>
      )}
      <div className="text-[12px] leading-relaxed text-text-2 space-y-1">
        {contact.phone && <div><span className="font-semibold text-danger">{contact.phone}</span></div>}
        {contact.email && <div><a href={contact.email.includes("@") ? `mailto:${contact.email}` : contact.email} className="text-accent hover:underline text-[11.5px]">{contact.email}</a></div>}
        {contact.address && <div className="text-[11px] text-text-2">{contact.address}</div>}
      </div>
    </Card>
  );
}

function MaintenanceCard({ contact, accentBg, accentText }: { 
  contact: MaintenanceContact; 
  accentBg: string; 
  accentText: string; 
}) {
  return (
    <Card className="p-3.5 border-l-[3px]" style={{ borderLeftColor: "var(--accent)" }}>
      <div className="flex items-start gap-2 mb-1">
        <div className="card-flag flex-shrink-0 mt-0.5">
          <img src={`${FLAG_BASE}/${contact.flag}.png`} alt="" className="flag-code" width="22" height="15" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[12.5px] text-text leading-snug mb-0.5">{contact.org}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-2">{contact.country}</div>
        </div>
      </div>
      <div className="border-t border-border my-1.5" />
      <div className="flex flex-col gap-1 text-[12px] text-text">
        <div className="flex items-start gap-1.5">
          <DetailIcon type="phone" />
          <span className="font-semibold text-danger">{contact.phone}</span>
        </div>
        <div className="flex items-start gap-1.5">
          <DetailIcon type="email" />
          <a href={`mailto:${contact.email}`} className="text-accent text-[11.5px] hover:underline">{contact.email}</a>
        </div>
        <div className="flex items-start gap-1.5">
          <DetailIcon type="location" />
          <span className="text-[11px] text-text-2">{contact.address}</span>
        </div>
      </div>
    </Card>
  );
}

export function Contacts() {
  const [activeTab, setActiveTab] = useState<TabKey>("civil");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<"east" | "horn" | "all" | "broker" | "partner">(getDefaultGroup("civil"));

  const tabConfig = TABS.find(t => t.key === activeTab)!;
  const accentColors: Record<TabKey, { color: string; bg: string; text: string }> = {
    civil: { color: "var(--accent)", bg: "var(--accent-dim)", text: "var(--accent)" },
    emergency: { color: "var(--danger)", bg: "var(--danger-dim)", text: "var(--danger)" },
    insurance: { color: "var(--success)", bg: "var(--success-dim)", text: "var(--success)" },
    maintenance: { color: "var(--warn)", bg: "var(--warn-dim)", text: "var(--warn)" },
  };
  const { color: accentColor, bg: accentBg, text: accentText } = accentColors[activeTab];

  let contacts: ContactCard[] | InsuranceContact[] | MaintenanceContact[] = [];
  let showGroupFilter = false;
  let searchFields: string[] = [];
  const groupOrder = getGroupOrder(activeTab);
  const groupLabels = getGroupLabels(activeTab);
  const defaultGroup = getDefaultGroup(activeTab);

  if (activeTab === "civil") {
    contacts = civilContacts;
    showGroupFilter = true;
    searchFields = ["org", "country"];
  } else if (activeTab === "emergency") {
    contacts = emergencyContacts;
    showGroupFilter = true;
    searchFields = ["org", "country"];
  } else if (activeTab === "insurance") {
    contacts = insuranceContacts;
    showGroupFilter = true;
    searchFields = ["org", "country"];
  } else {
    contacts = maintenanceContacts;
    showGroupFilter = true;
    searchFields = ["org", "country"];
  }

  const filteredContacts = useMemo(() => {
    let result = contacts as (ContactCard | InsuranceContact | MaintenanceContact)[];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(c => 
        searchFields.some(f => {
          const val = (c as any)[f];
          return val?.toLowerCase().includes(q);
        })
      );
    }

    if (showGroupFilter && group !== "all") {
      if (activeTab === "insurance") {
        result = result.filter(c => (c as InsuranceContact).type === group);
      } else {
        result = result.filter(c => (c as ContactCard).group === group);
      }
    }

    return result;
  }, [contacts, search, group, showGroupFilter, activeTab]);

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        title="Aviation Contacts Directory"
        action={
          <div className="search-wrap relative" style={{ flex: "0 0 240px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-9 top-1/2 -translate-y-1/2 pointer-events-none text-text-3">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="search-input"
              type="text"
              placeholder="Search country or organisation…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[12.5px] border border-border-2 rounded-md bg-bg-3 text-text placeholder:text-text-3 focus:outline-none focus:border-accent font-body"
            />
          </div>
        }
      />
      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { 
              setActiveTab(t.key); 
              setSearch(""); 
              setGroup(getDefaultGroup(t.key));
            }}
            className={`tab-btn ${activeTab === t.key ? `active-${t.key}` : ""}`}
          >
            {t.label} <span className="tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {showGroupFilter && (
        <div className="controls-row">
          <div className="group-toggle">
            {groupOrder.map(g => (
              <button
                key={g}
                onClick={() => setGroup(group === g ? defaultGroup : g)}
                className={`group-btn ${group === g ? "active" : ""}`}
              >
                {getGroupLabels(activeTab)[g]}
              </button>
            ))}
          </div>
          <span className="result-count">
            {filteredContacts.length} {filteredContacts.length === 1 ? "result" : "results"}
          </span>
        </div>
      )}

      <div className="cards-grid">
        {filteredContacts.length === 0 ? (
          <div className="col-span-3 no-results">
            No contacts match your search.
          </div>
        ) : (
          filteredContacts.map((c, i) => {
            if (activeTab === "civil") {
              return <CivilCard key={i} contact={c as ContactCard} accentBg={accentBg} accentText={accentText} />;
            }
            if (activeTab === "emergency") {
              return <EmergencyCard key={i} contact={c as ContactCard} accentBg={accentBg} accentText={accentText} />;
            }
            if (activeTab === "insurance") {
              return <InsuranceCard key={i} contact={c as InsuranceContact} accentBg={accentBg} accentText={accentText} />;
            }
            return <MaintenanceCard key={i} contact={c as MaintenanceContact} accentBg={accentBg} accentText={accentText} />;
          })
        )}
      </div>
    </div>
  );
}