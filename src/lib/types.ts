export type Role = "admin" | "underwriter" | "operator";

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
  | "notams"
  | "contacts"
  | "uploads"
  | "fleet"
  | "policies"
  | "users"
  | "companies"
  | "billing"
  | "stone";
