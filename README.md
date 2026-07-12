# Aviation Intelligence Platform

A full-stack web application built for aviation insurers and fleet operators in Eastern Africa. It provides real-time flight tracking, geopolitical risk assessment, country-level aviation profiles, NOTAM monitoring, and an invite-only user management system — all surfaced through a role-aware dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Pages & Modules](#pages--modules)
- [User Roles](#user-roles)
- [Authentication & Onboarding](#authentication--onboarding)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

---

## Overview

This platform is developed by **Stone Africa** as a specialised intelligence tool for the Eastern African aviation sector. The platform serves two distinct audiences:

- **Insurers (Underwriters)** — monitor fleet risk, manage policies, review claims, track incident intelligence, and invite new users.
- **Operators (Fleet Managers)** — view live flights, receive alerts, access country risk profiles, and upload operational documents.

The interface adapts its branding, navigation, and data access based on the authenticated user's role.

---

## Key Features

### Flight Intelligence
- Live flight tracking for Kenya Airways (KQ), Jambojet, Skyline Express, and UAE routes
- Interactive Leaflet map with real-time aircraft positions and heading indicators
- Flight history playback via date/time filter widget
- Flight detail modal with route, altitude, speed, and status data
- Sample track data for KQ202, KQ763, KQ_sample, AIC111, UAE770

### Risk Assessment
- Colour-coded country risk levels: Low / Medium / High / Extreme
- Animated pulsing dot overlays on the map for each risk location
- Donut chart summarising regional risk distribution
- Risk breakdown legend by country and category

### Country Intelligence Profiles
Full aviation intelligence profiles for **12 Eastern African countries**:

| Region | Countries |
|---|---|
| East Africa | Kenya, Tanzania, Uganda, Rwanda, Burundi |
| Horn & Central Africa | Ethiopia, Somalia, South Sudan, Sudan, DR Congo, Djibouti, Eritrea |

Each profile includes ICAO/IATA codes, aerodrome listings, active NOTAMs, incident history, regulatory status, and geopolitical risk context.

### NOTAMs
- Dedicated NOTAM page aggregating active notices across the region
- Filterable by country, aerodrome, and category

### Newsfeed
- Live aviation intelligence newsfeed with filterable categories
- Category filter dropdown (security, weather, regulatory, incidents, etc.)
- Unread badge count in the sidebar navigation

### Fleet Management (Operator View)
- Fleet overview table grouped by aircraft type with expand/collapse rows
- Per-aircraft status indicators: Active, Maintenance, AOG (Aircraft on Ground)
- Policy expiry countdowns with colour-coded urgency

### Insurance Management (Insurer View)
- Active policies table with coverage details and progress bars
- Claims management with status tracking and amounts
- Policy expiry alerts sorted by urgency

### Document Uploads
- Drag-and-drop file uploader supporting PDF, DOC, XLS, and image formats
- Document library with category filters, status badges, and per-file actions
- Upload categories: policies, claims, reports, certificates, maintenance logs

### Contacts
- Dedicated contacts directory page

### Billing
- Billing and subscription management page

### Stone Africa Integration
- Embedded Stone Africa partner page with branded splash screen
- Plays animated intro on every navigation visit

---

## Architecture

```
Browser (HTML/CSS/JS)
        │
        ├── Static files served by Express
        │       index.html      — main SPA shell
        │       login.html      — authentication entry point
        │       setup.html      — invite-based account creation
        │       verify.html     — email verification flow
        │       map.html        — Leaflet map (embedded as iframe)
        │       fleet.html      — fleet data page
        │       notams.html     — NOTAM listings
        │       contacts.html   — contacts directory
        │       policies.html   — policy management
        │       stone_africa.html — partner splash
        │       country_profiles/*.html — 12 country profile pages
        │
        └── Express API (server.js)
                │
                ├── /api/auth/*     — login, first-setup, demo-login, /me
                ├── /api/invite/*   — send & validate invite tokens
                └── PostgreSQL (pg pool)
                        ├── users table
                        └── invites table
```

The frontend is a **single-page application** (SPA) with client-side routing. `index.html` renders all dashboard pages and switches between them by toggling CSS classes — no page reloads. The `map.html` is loaded inside an `<iframe>` within the Dashboard page.

---

## Pages & Modules

### `index.html` — Main Dashboard Shell
The primary application file. Contains all dashboard views as hidden `<div class="page">` elements activated by `showPage()`. Includes:
- Sidebar with role-aware navigation
- Topbar with search, notifications, and user chip
- Overview page: KPI cards, risk map, recent flights table, alerts
- Newsfeed page: filterable intelligence feed
- Countries page: dynamically loaded country profile iframes
- Fleet page: expandable aircraft type table
- Insurance/Claims pages: insurer-only views
- Uploads page: drag-and-drop document manager
- Billing page
- Stone Africa page

### `map.html` — Live Flight Map
Standalone Leaflet map loaded as an iframe in the Dashboard view:
- Tile layer: CartoDB Dark Matter
- CSV flight data parsed with PapaParse
- Rotated aircraft markers via `leaflet-rotatedmarker`
- Date/time filter widget for historical playback
- Flight detail popup on marker click

### `login.html` — Authentication
- Email + password login form
- First-run detection: shows account creation form when DB is empty
- Demo access buttons (Insurer / Operator) for evaluations
- Redirects to `index.html` on success with JWT stored in `localStorage`

### `setup.html` — Invite-Based Registration
- Validates invite token on load via `/api/invite/validate`
- Collects username, display name, and password
- Calls `/api/auth/setup` to create the account and mark the invite as used

### `verify.html` — Email Verification
- Handles post-registration email verification flows

### `country_profiles/*.html` — Country Profiles
Each country has a self-contained HTML page loaded inside the main dashboard via iframe when the user selects a country from the sidebar. Countries covered:

`kenya.html`, `tanzania.html`, `uganda.html`, `rwanda.html`, `burundi.html`, `ethiopia.html`, `somalia.html`, `southsudan.html`, `sudan.html`, `drcongo.html`, `djibouti.html`, `eritrea.html`

### `theme.js` — Theme System
Loaded first in every page. Manages light/dark mode and exposes CSS custom properties used across all pages.

### `styles.css` — Global Styles
Shared stylesheet imported by all pages. Defines the design token system via CSS custom properties.

---

## User Roles

| Role | Label | Access |
|---|---|---|
| `insurer` | Underwriter | Full access: overview, map, claims, newsfeed, countries, fleet, NOTAMs, contacts, uploads, billing, invite users |
| `operator` | Fleet Manager | Limited access: overview, map, newsfeed, countries, fleet, NOTAMs, contacts, uploads, billing |

Role-specific UI elements use the `.insurer-only` CSS class to show/hide items. The sidebar branding also changes: insurers see the FRED BLACK logo; operators see the Kenya Airways logo and tagline.

---

## Authentication & Onboarding

### First-Run Setup
On first deployment with an empty database, `login.html` detects `needsSetup: true` from `/api/auth/setup-status` and shows an account creation form. The first account is always created as an `insurer`.

### Invite Flow
1. An authenticated insurer opens the Invite modal in the dashboard.
2. They enter an email and choose a role (insurer or operator).
3. The server generates a 32-byte random token, stores it with a 24-hour expiry, and emails an invite link.
4. If no email provider is configured, the invite link is returned in the API response for manual sharing (copy/paste via WhatsApp, etc.).
5. The recipient opens `setup.html?t=<token>`, which validates the token and lets them choose a username and password.
6. On submit, the account is created and the invite is consumed atomically in a transaction.

### Demo Access
Two demo accounts are seeded automatically on startup:
- `demo_insurer` — insurer role
- `demo_operator` — operator role

Demo login is available on `login.html` and calls `/api/auth/demo-login`. Disable by setting `DEMO_ENABLED=false`.

### JWT Tokens
- Signed with `JWT_SECRET`, expire in 7 days
- Stored in `localStorage` as `fb_token`
- Verified on every API call via `Authorization: Bearer <token>` header
- `index.html` calls `/api/auth/me` on load to rehydrate the user session

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Login with email + password |
| `POST` | `/api/auth/demo-login` | — | Demo login by role |
| `GET` | `/api/auth/setup-status` | — | Returns `needsSetup: true` if DB is empty |
| `POST` | `/api/auth/first-setup` | — | Creates the first insurer account (disabled once any user exists) |
| `POST` | `/api/auth/setup` | — | Creates account from a valid invite token |
| `POST` | `/api/auth/register` | — | Always returns 403 — self-registration is disabled |
| `GET` | `/api/auth/me` | Bearer | Returns the current user's profile |
| `POST` | `/api/invite/send` | Bearer (insurer only) | Generates an invite token and sends the email |
| `POST` | `/api/invite/validate` | — | Checks whether an invite token is still valid |

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `email` | TEXT UNIQUE | Lowercased on insert |
| `username` | TEXT UNIQUE | 3–24 chars, alphanumeric + underscore |
| `display_name` | TEXT | |
| `password_hash` | TEXT | bcrypt, cost 12 |
| `role` | TEXT | `insurer` or `operator` |
| `email_verified` | BOOLEAN | Always TRUE (verified via invite link) |
| `created_at` | TIMESTAMPTZ | |

### `invites`
| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `token` | TEXT UNIQUE | 32-byte hex |
| `email` | TEXT | Recipient email |
| `role` | TEXT | `insurer` or `operator` |
| `expires_at` | TIMESTAMPTZ | 24 hours from creation |
| `used_at` | TIMESTAMPTZ | NULL until redeemed |
| `created_at` | TIMESTAMPTZ | |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | `dev-secret-change-in-production` | Secret for signing JWTs — **change in production** |
| `NODE_ENV` | No | — | Set to `production` to enable SSL for DB connections |
| `PORT` | No | `10000` | HTTP server port |
| `APP_URL` | No | `http://localhost:<PORT>` | Public URL used in invite email links |
| `DEMO_ENABLED` | No | `true` | Set to `false` to disable demo login |
| `DEMO_PASSWORD` | No | `FredBlack-Demo-2026!` | Password for seeded demo accounts |
| `RESEND_API_KEY` | No | — | API key for [Resend](https://resend.com) email delivery (recommended) |
| `SMTP_HOST` | No | — | SMTP server hostname (alternative to Resend) |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_SECURE` | No | `false` | Set to `true` for port 465 TLS |
| `SMTP_USER` | No | — | SMTP username |
| `SMTP_PASS` | No | — | SMTP password |
| `EMAIL_FROM` | No | `"FRED BLACK" <noreply@fredblack.app>` | From address used in invite emails |

If neither `RESEND_API_KEY` nor `SMTP_HOST` is set, the server runs in **console-only mode** — invite links are printed to stdout and returned in the API response body so they can be shared manually.

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database (local or hosted, e.g. Render, Neon, Supabase)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file in the project root
# (see Environment Variables above for all options)
DATABASE_URL=postgres://user:password@localhost:5432/fredblack
JWT_SECRET=your-local-dev-secret
PORT=10000

# 3. Start the development server (auto-restarts on file changes)
npm run dev

# 4. Open the app
# http://localhost:10000
# On first load, the login page will prompt you to create the first admin account.
```

### Production

```bash
npm start
```

Ensure `NODE_ENV=production` and a valid `DATABASE_URL` with SSL support are set. The database tables are created automatically on startup via `initDB()`.

---

## Project Structure

```
Aviation Intelligence Platform/
├── server.js                   # Express server — auth API, invite system, static file serving
├── package.json
├── .env                        # Not committed — local environment variables
│
├── index.html                  # Main SPA dashboard shell
├── login.html                  # Login & first-run setup
├── setup.html                  # Invite-based account creation
├── verify.html                 # Email verification
├── map.html                    # Leaflet flight map (embedded as iframe)
├── fleet.html                  # Fleet data
├── notams.html                 # NOTAM listings
├── contacts.html               # Contacts directory
├── policies.html               # Policy management
├── stone_africa.html           # Stone Africa partner page
│
├── styles.css                  # Global design tokens and shared styles
├── theme.js                    # Light/dark theme manager (loaded first on every page)
│
├── country_profiles/
│   ├── kenya.html
│   ├── tanzania.html
│   ├── uganda.html
│   ├── rwanda.html
│   ├── burundi.html
│   ├── ethiopia.html
│   ├── somalia.html
│   ├── southsudan.html
│   ├── sudan.html
│   ├── drcongo.html
│   ├── djibouti.html
│   └── eritrea.html
│
├── kq_flights_live.json        # Kenya Airways live flight data
├── jambojet_flights_live.json  # Jambojet live flight data
├── skyline_flights_live.json   # Skyline Express live flight data
├── kq202_track.json            # KQ202 track sample
├── kq763_track.json            # KQ763 track sample
├── kq_track_sample.json        # KQ general track sample
├── aic111_track.json           # AIC111 track sample
└── uae770_track.json           # UAE770 track sample
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js >= 18 |
| Web framework | Express 4 |
| Database | PostgreSQL via `pg` (node-postgres) |
| Auth | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`) |
| Email | Nodemailer (Resend SMTP or custom SMTP) |
| Frontend | Vanilla HTML/CSS/JavaScript (no framework) |
| Maps | Leaflet.js with CartoDB Dark Matter tiles |
| CSV parsing | PapaParse |
| Charts | Chart.js 4 |
| Fonts | Google Fonts — Inter, Syne, Barlow Condensed |
| Deployment | Render (configured for port 10000) |

---

## Notes

- **Self-registration is permanently disabled.** All accounts must be created either by the first-setup flow or via an insurer's invite. Calls to `POST /api/auth/register` always return 403.
- **Email verification is implicit.** Because users must click an invite link to reach the setup page, their email is considered verified on account creation.
- **Race condition protection.** The account creation endpoint re-validates the invite token inside a database transaction with a `BEGIN/COMMIT` block to prevent double-redemption.
- **Demo accounts** are seeded idempotently on every server start — safe to redeploy without duplicating them.

---

*© 2026 Stone Africa · Aviation Intelligence*
