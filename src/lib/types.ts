export type Role = "admin" | "underwriter" | "operator";

export interface Company {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleLabel: string;
  company: Company;
  status: "active" | "invited" | "suspended";
  lastActive: string | null;
  createdAt: string;
  updatedAt: string;
}

// Server-side minimal user (from session cookie)
export type SessionUser = Pick<User, "name" | "email" | "role" | "company">;

export interface NavLeaf {
  key: string;
  label: string;
  href: string;
  icon: NavIconKey;
}

export type NavIconKey =
  | "overview"
  | "map"
  | "claims"
  | "newsfeed"
  | "countries"
  | "shield"
  | "notams"
  | "contacts"
  | "uploads"
  | "fleet"
  | "policies"
  | "users"
  | "companies"
  | "billing"
  | "stone";


export interface NavItem extends NavLeaf {
  children?: NavItem[];
}