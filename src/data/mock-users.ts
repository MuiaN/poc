import type { Role } from "@/lib/types";

export type UserStatus = "active" | "invited" | "suspended";

export interface MockUser {
  name: string;
  email: string;
  /** Shared demo password for every account — this is mock auth, not production security. */
  password: string;
  role: Role;
  roleLabel: "Admin" | "Underwriter" | "Operator";
  company: string;
  status: UserStatus;
  lastActive: string;
}

export const DEMO_PASSWORD = "fredblack2026";

/** Single source of truth for demo accounts — used by the login page and the
 *  Admin "Users & Invites" screen. */
export const MOCK_USERS: MockUser[] = [
  { name: "Amina Wafula", email: "amina.wafula@fredblack.africa", password: DEMO_PASSWORD, role: "admin", roleLabel: "Admin", company: "FRED BLACK", status: "active", lastActive: "2026-07-12" },
  { name: "Albert Mwangi", email: "a.mwangi@fredblack.africa", password: DEMO_PASSWORD, role: "underwriter", roleLabel: "Underwriter", company: "FRED BLACK", status: "active", lastActive: "2026-07-11" },
  { name: "Simon Bekele", email: "s.bekele@fredblack.africa", password: DEMO_PASSWORD, role: "underwriter", roleLabel: "Underwriter", company: "FRED BLACK", status: "active", lastActive: "2026-07-10" },
  { name: "John Otieno", email: "j.otieno@kenya-airways.com", password: DEMO_PASSWORD, role: "operator", roleLabel: "Operator", company: "Kenya Airways", status: "active", lastActive: "2026-07-12" },
  { name: "Peter Uwase", email: "p.uwase@rwandair.com", password: DEMO_PASSWORD, role: "operator", roleLabel: "Operator", company: "RwandAir", status: "invited", lastActive: "—" },
  { name: "David Haile", email: "d.haile@ethiopianairlines.com", password: DEMO_PASSWORD, role: "operator", roleLabel: "Operator", company: "Ethiopian Airlines", status: "active", lastActive: "2026-07-09" },
  { name: "Frank Kamau", email: "f.kamau@fly540.com", password: DEMO_PASSWORD, role: "operator", roleLabel: "Operator", company: "Fly540", status: "suspended", lastActive: "2026-05-02" },
];

export function findUserByEmail(email: string): MockUser | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find((u) => u.email.toLowerCase() === normalized);
}

/** One representative active account per role, for the login page's quick-fill demo cards. */
export const DEMO_LOGINS: MockUser[] = [
  MOCK_USERS.find((u) => u.role === "admin" && u.status === "active")!,
  MOCK_USERS.find((u) => u.role === "underwriter" && u.status === "active")!,
  MOCK_USERS.find((u) => u.role === "operator" && u.status === "active")!,
];
