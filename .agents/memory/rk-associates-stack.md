---
name: RK Associates stack
description: Key runtime facts about the RK Associates real estate app on Replit
---

**Why:** Needed for cross-artifact communication and debugging without re-discovery.

**How to apply:** Use these when debugging routing, proxy, or port issues.

- API server (`artifacts/api-server`): Express + Mongoose, runs on port **8080** (Replit-assigned), `trust proxy 1` required for rate-limiter behind Replit's reverse proxy
- Frontend (`artifacts/rk-associates`): Vite + React, port **22342**; Vite dev server proxies `/api → http://localhost:8080` in `vite.config.ts`
- No PostgreSQL / Drizzle used; app is MongoDB-only. The `@workspace/db` package is still in the monorepo but is not imported by the mongo server path
- Secrets: MONGODB_CONNECTION_STRING, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, WHATSAPP_NUMBER — all set
- Tailwind v4 with `@theme {}` block (not tailwind.config.js). Custom colors: navy #1a2a3a, gold #c9a74b, beige #f5f0eb, slate #2c3e50
- react-leaflet v5 (React 19 compatible) — v4 will error with React 19 peer dep conflict
