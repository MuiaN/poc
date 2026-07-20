export type Role = "admin" | "underwriter" | "operator";

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
  company: string;
}

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