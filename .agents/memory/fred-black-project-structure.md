---
name: FRED BLACK project structure
description: Where the aviation-intelligence-platform frontend rebuild's data and reference material live.
---

This repo is a Next.js + Tailwind rebuild of an imported static-HTML POC
("FRED BLACK", an aviation intelligence platform for East African insurers
and operators). Key layout decisions:

- `reference-poc/` holds the entire original POC (HTML pages, styles.css,
  Express server, raw CSV/GeoJSON datasets) untouched, as a design and mock
  data donor. It is not imported or run by the Next.js app.
- Mock data embedded as JS arrays or HTML tables in the POC was extracted
  once into `data-src/*.json` (via regex + `eval`, or cheerio for HTML card
  markup) and then copied into `src/data/*.json`, which is what the actual
  app imports. If mock data ever looks wrong or incomplete, check
  `reference-poc/` for the original source before inventing new data.
- Three dashboards (`/admin`, `/underwriters`, `/operators`) share one set of
  page components (`src/components/pages/*.tsx`) parameterized by a `role`
  prop; per-role differences (which nav items show, admin-only
  Users/Companies pages) are centralized in `src/lib/nav.ts`.
- The original POC's interactive Leaflet map and huge ACLED conflict CSVs
  were intentionally *not* ported — replaced with a flight-list table — since
  they were out of scope for a frontend-only first pass. See replit.md for
  the full list of known limitations.
