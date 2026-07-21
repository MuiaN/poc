export interface ContactCard {
  org: string;
  country: string;
  group: "east" | "horn";
  flag: string;
  details?: string[];
  emergRows?: EmergRow[];
}

export interface EmergRow {
  type: "police" | "fire" | "medical" | "other";
  value: string;
}

export interface InsuranceContact {
  org: string;
  country: string;
  type: "broker" | "partner";
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
}

export interface MaintenanceContact {
  org: string;
  country: string;
  flag: string;
  group: "east" | "horn";
  phone: string;
  email: string;
  address: string;
}

export const civilContacts: ContactCard[] = [
  { org: "Kenya Civil Aviation Authority (KCAA)", country: "Kenya", group: "east", flag: "ke", details: ["+254 020 827 4075", "info@kcaa.or.ke", "Aviation House, Jomo Kenyatta International Airport (JKIA), Nairobi"] },
  { org: "Tanzania Civil Aviation Authority (TCAA)", country: "Tanzania", group: "east", flag: "tz", details: ["+255 222 198 100", "bansa@tcaa.go.tz", "Aviation House, Nyerere Road, Banana Ubungo Area, Dar es Salaam"] },
  { org: "Uganda Civil Aviation Authority (UCAA)", country: "Uganda", group: "east", flag: "ug", details: ["+256 414 352000 | +256 312 352000", "aviation@caa.co.ug", "UCAA Head Office, Entebbe International Airport, Entebbe"] },
  { org: "Rwanda Civil Aviation Authority (RCAA)", country: "Rwanda", group: "east", flag: "rw", details: ["+250 726 936 583", "info@caa.gov.rw", "SCNN 5 Rd, Kigali International Airport, Kigali"] },
  { org: "Burundi Civil Aviation Authority (BCAA)", country: "Burundi", group: "east", flag: "bi", details: ["+257 222 03100 | +257 222 03101", "aacburundi@gmail.com", "SCTP Building, Avenue de la Justice, Commune de la Gombe, Bujumbura"] },
  { org: "Civil Aviation Authority at DRC (CAA-DRC)", country: "DR Congo", group: "horn", flag: "cd", details: ["+243 812 237602", "info@aacdrc.org", "SCTP Building, Avenue de la Justice, Commune de la Gombe, Kinshasa"] },
  { org: "Somali Civil Aviation Authority (SCAA)", country: "Somalia", group: "horn", flag: "so", details: ["+252 1853675", "info@scaa.gov.so", "Aden Adde International Airport, Mogadishu"] },
  { org: "Ethiopian Civil Aviation Authority (ECAA)", country: "Ethiopia", group: "horn", flag: "et", details: ["+251 116 650 200", "contact@ecaa.gov.et", "Bole International Airport Area, P.O. Box 1755, Addis Ababa"] },
  { org: "South Sudan Civil Aviation Authority (SSCAA)", country: "South Sudan", group: "horn", flag: "ss", details: ["+211 912 150 047", "info@sscaa.gov.ss", "Juba International Airport Area, Juba, South Sudan"] },
  { org: "Sudan Civil Aviation Authority (SCAA)", country: "Sudan", group: "horn", flag: "sd", details: ["+249 183 795 000", "info@scaa.gov.sd", "Khartoum International Airport Area, Khartoum"] },
  { org: "Autorité de l'Aviation Civile de Djibouti (AACD)", country: "Djibouti", group: "horn", flag: "dj", details: ["+253 21 33 51 00", "contact@aacd.dj", "Aéroport International de Djibouti-Ambouli, BP 1877, Djibouti City"] },
  { org: "Eritrean Civil Aviation Authority (ECAA)", country: "Eritrea", group: "horn", flag: "er", details: ["+291 1 189121 | +291 1 181424", "—", "Asmara International Airport Area, Asmara"] },
];

export const emergencyContacts: ContactCard[] = [
  { org: "Emergency Services", country: "Kenya", group: "east", flag: "ke", emergRows: [
    { type: "police", value: "999" },
    { type: "fire", value: "112" },
    { type: "medical", value: "911" },
    { type: "other", value: "Kenya Red Cross: 1199 · St John Ambulance: +254 722 125285 | +254 733 930000" },
  ]},
  { org: "Emergency Services", country: "Tanzania", group: "east", flag: "tz", emergRows: [
    { type: "police", value: "112 | 111" },
    { type: "fire", value: "—" },
    { type: "medical", value: "114" },
    { type: "other", value: "Tanzania Red Cross Society: +255 080 075 0153" },
  ]},
  { org: "Emergency Services", country: "Uganda", group: "east", flag: "ug", emergRows: [
    { type: "police", value: "999 | 112" },
    { type: "fire", value: "—" },
    { type: "medical", value: "912" },
    { type: "other", value: "Uganda Red Cross Society: +256 800 100066 · St John Ambulance Uganda: +256 414 258001" },
  ]},
  { org: "Emergency Services", country: "Rwanda", group: "east", flag: "rw", emergRows: [
    { type: "police", value: "112" },
    { type: "fire", value: "111" },
    { type: "medical", value: "912" },
    { type: "other", value: "Rwanda Red Cross Society: +250 788 123600 | +250 255 105260 · Hotline: 2100" },
  ]},
  { org: "Emergency Services", country: "Burundi", group: "east", flag: "bi", emergRows: [
    { type: "police", value: "112" },
    { type: "fire", value: "118" },
    { type: "medical", value: "—" },
    { type: "other", value: "Burundi Red Cross: +257 222 218870 | +257 222 18871 · Hotline: 109" },
  ]},
  { org: "Emergency Services", country: "DR Congo", group: "horn", flag: "cd", emergRows: [
    { type: "police", value: "112 | 117" },
    { type: "fire", value: "118" },
    { type: "medical", value: "—" },
    { type: "other", value: "Kinshasa – DRC Red Cross: +243 822 388209 | +243 998 225234" },
  ]},
  { org: "Emergency Services", country: "Somalia", group: "horn", flag: "so", emergRows: [
    { type: "police", value: "888" },
    { type: "fire", value: "—" },
    { type: "medical", value: "999" },
    { type: "other", value: "Somali Red Crescent Society: 446 | +252 615 866606" },
  ]},
  { org: "Emergency Services", country: "Ethiopia", group: "horn", flag: "et", emergRows: [
    { type: "police", value: "991 | 911" },
    { type: "fire", value: "931" },
    { type: "medical", value: "907" },
    { type: "other", value: "—" },
  ]},
  { org: "Emergency Services", country: "South Sudan", group: "horn", flag: "ss", emergRows: [
    { type: "police", value: "999" },
    { type: "fire", value: "—" },
    { type: "medical", value: "—" },
    { type: "other", value: "South Sudan Red Cross: +211 926 255358 | +211 927 580870" },
  ]},
  { org: "Emergency Services", country: "Sudan", group: "horn", flag: "sd", emergRows: [
    { type: "police", value: "999" },
    { type: "fire", value: "—" },
    { type: "medical", value: "—" },
    { type: "other", value: "Sudanese Red Crescent Society: +249 183 772011" },
  ]},
  { org: "Emergency Services", country: "Djibouti", group: "horn", flag: "dj", emergRows: [
    { type: "police", value: "999" },
    { type: "fire", value: "18" },
    { type: "medical", value: "119" },
    { type: "other", value: "Gendarmerie: +253 21352222 · Red Crescent Society: +253 21351252 | +253 21362528" },
  ]},
  { org: "Emergency Services", country: "Eritrea", group: "horn", flag: "er", emergRows: [
    { type: "police", value: "127" },
    { type: "fire", value: "116" },
    { type: "medical", value: "134" },
    { type: "other", value: "—" },
  ]},
];

export const insuranceContacts: InsuranceContact[] = [
  { org: "Price Forbes", country: "Speciality Insurance Broker", type: "broker", phone: "—", email: "www.priceforbes.com", address: "The Minster Building, 21 Mincing Lane, London, England" },
  { org: "Fred Black Insurance Brokers Ltd", country: "", type: "broker", phone: "+254 718 792430 | +254 790 498445", email: "info@fredblack.net", address: "Ground Floor, Bay Court Office Block, Watermark Business Park, Karen, Nairobi" },
  { org: "Stone Africa IOC", country: "", type: "partner", phone: "+254 116 043568 | +254 030 7903866", email: "info@stone-africa.co", address: "Annex B, Watermark Business Park, Karen, Nairobi" },
];

export const maintenanceContacts: MaintenanceContact[] = [
  { org: "Kenya Airways Engineering", country: "Kenya", group: "east", flag: "ke", phone: "+254 020 327 4000", email: "engineering@kenya-airways.com", address: "Kenya Airways Engineering Base, JKIA, Nairobi" },
  { org: "Precision Air Technical Services", country: "Tanzania", group: "east", flag: "tz", phone: "+255 22 213 0800", email: "technical@precisionairtz.com", address: "Julius Nyerere International Airport, Terminal 1, Dar es Salaam" },
  { org: "Air Tanzania Engineering", country: "Tanzania", group: "east", flag: "tz", phone: "+255 22 284 0204", email: "engineering@airtanzania.co.tz", address: "Julius Nyerere International Airport, Dar es Salaam" },
  { org: "Uganda Airlines Technical Services", country: "Uganda", group: "east", flag: "ug", phone: "+256 200 525 000", email: "technical@ugandaairlines.co.ug", address: "Entebbe International Airport, Entebbe" },
  { org: "RwandAir Technical Operations", country: "Rwanda", group: "east", flag: "rw", phone: "+250 252 588 521", email: "technical@rwandair.com", address: "Kigali International Airport (RwandAir Maintenance Base), Kigali" },
  { org: "Ethiopian Airlines MRO", country: "Ethiopia", group: "horn", flag: "et", phone: "+251 116 178 000", email: "mro@ethiopianairlines.com", address: "Ethiopian Airlines Maintenance Base, Bole International Airport, Addis Ababa" },
  { org: "Congo Airways Technical", country: "DR Congo", group: "horn", flag: "cd", phone: "+243 81 698 1000", email: "technique@congoairways.com", address: "N'Djili International Airport, Kinshasa" },
  { org: "Sudan Airways Engineering", country: "Sudan", group: "horn", flag: "sd", phone: "+249 183 784 000", email: "engineering@sudanairways.com", address: "Khartoum International Airport Area, Khartoum · Operations affected since 2023" },
];

export const TABS = [
  { key: "civil", label: "Civil Aviation Authorities", count: civilContacts.length },
  { key: "emergency", label: "Emergency Contacts", count: emergencyContacts.length },
  { key: "insurance", label: "Insurance Brokers & Partners", count: insuranceContacts.length },
  { key: "maintenance", label: "MRO & Engineering Systems", count: maintenanceContacts.length },
] as const;

export type TabKey = (typeof TABS)[number]["key"];