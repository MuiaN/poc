---
name: Mock role-based auth pattern (no database)
description: How FRED BLACK gates three role-based dashboards behind login using only a mock user list and signed cookies — reusable for similar demo apps.
---

When a project needs believable login/logout and per-role route protection but
explicitly has no backend/database (mock-data-only apps), this pattern avoids
both a fake "trust the client" auth and a full backend build-out:

- One shared mock user list (with a role, company, status, and a single demo
  password shared by every account) is the only "database".
- Sessions are a signed `payload.signature` cookie using HMAC-SHA256 via the
  **Web Crypto API** (`crypto.subtle`), not `node:crypto` — Web Crypto works
  in both Next.js Route Handlers (Node runtime) and Middleware (Edge runtime)
  with one shared implementation, so there's no edge/node crypto split.
- `middleware.ts` (in `src/` when using a `src/app` layout) verifies the
  cookie and enforces that a session's role matches the route prefix being
  visited (e.g. an "operator" session hitting `/admin/*` gets redirected to
  its own dashboard, not shown an error page or let through).

**Why:** gives real login/logout/redirect/expiry UX and genuine per-role
route gating without inventing a database just to hold a handful of demo
accounts, and keeps auth logic in one place instead of duplicated per role.

**How to apply:** reuse this shape (mock user list + Web Crypto signed cookie
+ middleware role check) any time a multi-role demo app needs "looks real"
auth but a database is out of scope.
