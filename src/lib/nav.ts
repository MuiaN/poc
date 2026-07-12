import type { NavLeaf, Role } from "./types";

/** Base path for each role's dashboard. */
export const ROLE_BASE: Record<Role, string> = {
  admin: "/admin",
  underwriter: "/underwriters",
  operator: "/operators",
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  underwriter: "Underwriter",
  operator: "Fleet Manager",
};

/** Nav items available to each role — mirrors the sidebar of the original POC,
 *  with the Admin role receiving every item plus platform administration. */
export function getNav(role: Role): NavLeaf[] {
  const base = ROLE_BASE[role];
  const common: NavLeaf[] = [
    { key: "overview", label: "Overview", href: `${base}`, icon: "overview" },
    { key: "map", label: "Live Map", href: `${base}/map`, icon: "map" },
  ];

  const claims: NavLeaf = { key: "claims", label: "Claims", href: `${base}/claims`, icon: "claims" };
  const policies: NavLeaf = { key: "policies", label: "Policies", href: `${base}/policies`, icon: "policies" };
  const fleet: NavLeaf = { key: "fleet", label: "Fleet Register", href: `${base}/fleet`, icon: "fleet" };

  const rest: NavLeaf[] = [
    { key: "newsfeed", label: "Newsfeed", href: `${base}/newsfeed`, icon: "newsfeed" },
    { key: "countries", label: "Country Profiles", href: `${base}/countries`, icon: "countries" },
    { key: "notams", label: "NOTAMs", href: `${base}/notams`, icon: "notams" },
    { key: "contacts", label: "Contacts", href: `${base}/contacts`, icon: "contacts" },
    { key: "uploads", label: "Uploads", href: `${base}/uploads`, icon: "uploads" },
  ];

  if (role === "admin") {
    return [
      ...common,
      claims,
      policies,
      fleet,
      ...rest,
      { key: "companies", label: "Companies", href: `${base}/companies`, icon: "companies" },
      { key: "users", label: "Users & Invites", href: `${base}/users`, icon: "users" },
      { key: "billing", label: "Billing", href: `${base}/billing`, icon: "billing" },
    ];
  }

  if (role === "underwriter") {
    return [...common, claims, policies, fleet, ...rest, { key: "billing", label: "Billing", href: `${base}/billing`, icon: "billing" }];
  }

  // operator
  return [...common, fleet, ...rest, { key: "billing", label: "Billing", href: `${base}/billing`, icon: "billing" }];
}
