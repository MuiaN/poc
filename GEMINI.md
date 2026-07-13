# FRED BLACK — Aviation Intelligence Platform (Frontend)

## Overview
FRED BLACK is an aviation intelligence platform for insurers and operators
active in Eastern Africa. This repo currently contains a **frontend-only
rebuild** of the original static HTML/CSS/JS proof-of-concept, built with
**Next.js 14 (App Router, TypeScript) + Tailwind CSS**.

The app ships three separate role-based dashboards, each its own route group:

- `/admin` — Administrator: full platform oversight, superset of the other
  two dashboards, plus company & user management (mock CRUD, no backend yet).
- `/underwriters` — Underwriter: claims, policies, fleet, risk & regional
  intelligence for insurance underwriting teams.
- `/operators` — Operator (Kenya Airways is the sample tenant): live fleet
  status, maintenance schedules, and regional intelligence for airline
  operators.

The landing page (`/`) is a simple chooser between the three dashboards —
there is no authentication yet (see follow-ups).

## Project structure
- `reference-poc/` — the **original imported POC**, preserved untouched as a
  design/data reference. It is a static multi-page app (`index.html`,
  `fleet.html`, `policies.html`, `notams.html`, `contacts.html`,
  `country_profiles/*.html`) with an Express server, plus large raw datasets
  (`data/*.csv`, GeoJSON). Not used at runtime by the Next.js app.
- `data-src/` — intermediate JSON extracted from the POC's embedded JS
  arrays and HTML tables (via one-off Node/regex/cheerio scripts) before
  being copied into the app.
- `src/data/*.json` + `src/data/index.ts` — the mock data actually consumed
  by the Next.js app (fleet, claims, policies, newsfeed, contacts, live
  flight schedules). This is a straight port of the POC's mock data — no
  backend/API calls are made.
- `src/components/pages/*.tsx` — one shared page component per feature
  (Overview, Fleet, Claims, Policies, Newsfeed, Countries, Notams, Contacts,
  Uploads, Billing, Users, Companies, Map). Each accepts a `role` prop where
  behavior differs by role; thin route files under `src/app/<role>/...`
  import and render them.
- `src/components/{Sidebar,Topbar,DashboardShell,ui,icons}.tsx` — shared
  design-system primitives (Card, KpiCard, Badge, Button, DataTable, etc.)
  and layout chrome, translating the POC's `styles.css` design tokens
  (colors, radii, shadows, dark/light theme) into Tailwind (see
  `tailwind.config.ts` and CSS variables in `src/app/globals.css`).
- `src/lib/nav.ts` — per-role sidebar navigation config (this is where the
  Admin role's "superset" behavior and extra Companies/Users/Billing items
  are defined).

## Running
`npm run dev` (bound to `0.0.0.0:5000`, wired to the `Start application`
workflow).

## Known limitations / not yet implemented
- No backend, database, or authentication — all data is static mock JSON.
- The interactive map (Leaflet in the POC) has been replaced with a live
  flight list; no geographic rendering yet.
- The large ACLED conflict-incident CSVs and airspace GeoJSON in
  `reference-poc/data/` were not ported (too large / out of scope for a
  frontend-only pass).
- Admin's Companies/Users pages are mock UI only — no real CRUD or linking
  persists anything.

## User preferences
- Rebuild the frontend fresh in Next.js + Tailwind rather than evolving the
  static POC in place; the POC is kept as an isolated reference only.
- Three dashboards must live in separate route groups/folders (Admin,
  Underwriters, Operators), with Admin as a strict superset of the other two.
