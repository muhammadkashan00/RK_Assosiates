# RK Associates — Real Estate Platform (MERN)

A production-oriented real estate listing platform built on the **MERN** stack
(MongoDB, Express, React, Node) as an npm-workspaces monorepo.

- **Modern Elegance with Classical Refinement** — navy + gold theme, serif display type.
- Public listings with search/filter, image galleries, video tours, and an
  interactive **Leaflet coverage-area polygon** for every property.
- **Secure WhatsApp inquiry** — the business number is never sent to the client;
  the server records a lead and returns a `wa.me` deep link.
- **Properties Near You** — opt-in geolocation matched against property coverage
  areas via MongoDB `$geoIntersects` (GeoJSON + `2dsphere` index).
- **Self-hosted, privacy-friendly analytics** — page visits with anonymized IPs.
- **Admin panel** — JWT auth with brute-force lockout, one-click property
  creation with map polygon drawing, Cloudinary image/video upload,
  publish/unpublish, leads inbox, and an analytics dashboard.

## Project structure

```
.
├── server/            # Express API (ESM)
│   └── src/
│       ├── config/    # env, db, cloudinary
│       ├── models/    # Property, User, Lead, Visit
│       ├── middleware/# auth, rate limiting, upload, error
│       ├── controllers/
│       ├── routes/
│       └── scripts/   # seedAdmin.js
└── client/            # Vite + React + TypeScript + Tailwind
    └── src/
        ├── components/ (layout, property, map)
        ├── pages/      (public + admin)
        ├── hooks/      (auth, visit tracking)
        └── lib/        (api client, formatters)
```

## Environment variables

Set these in the Vercel project (or a local `.env`):

| Variable                     | Purpose                                       |
| ---------------------------- | --------------------------------------------- |
| `MONGODB_CONNECTION_STRING`  | MongoDB Atlas connection URI                  |
| `JWT_SECRET`                 | Secret for signing admin JWTs                 |
| `WHATSAPP_NUMBER`            | Business WhatsApp number (server-side only)   |
| `CLOUDINARY_CLOUD_NAME`      | Cloudinary account                            |
| `CLOUDINARY_API_KEY`         | Cloudinary API key                            |
| `CLOUDINARY_API_SECRET`      | Cloudinary API secret                         |
| `SEED_ADMIN_EMAIL`           | (optional) admin email for the seed script    |
| `SEED_ADMIN_PASSWORD`        | (optional) admin password for the seed script |
| `CLIENT_ORIGIN`              | (prod) comma-separated allowed CORS origins   |
| `VITE_API_URL`               | (prod client) backend origin, e.g. `https://api.example.com` |

> **MongoDB Atlas note:** add your server's IP (or `0.0.0.0/0` for testing) to
> the cluster's Network Access allow-list, or the API cannot connect.

## Getting started

```bash
npm install          # installs both workspaces

# 1) Seed the first admin (prints a generated password if none provided)
SEED_ADMIN_EMAIL=admin@rkassociates.com SEED_ADMIN_PASSWORD='choose-a-strong-one' npm run seed

# 2) Run both API (:5000) and client (:3000) with the Vite /api proxy
npm run dev
```

Then open `http://localhost:3000`. The admin panel is at `/admin/login`.

## Production

- **API:** deploy `server/` to any Node host (Render, Railway, Fly, a VM).
  Set `NODE_ENV=production` and the env vars above.
- **Client:** `npm run build` outputs `client/dist/` — deploy to Vercel/static
  host. Set `VITE_API_URL` to the deployed API origin.
