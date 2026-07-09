---
name: RK Associates mobile API pattern
description: How the mobile app hits the API — not using generated client, uses hand-written fetch.
---

The mobile app (`artifacts/rk-associates-mobile`) uses **Mode B**: a hand-written `lib/api.ts` using native `fetch` rather than the `@workspace/api-client-react` generated hooks.

**Why:** The web app also uses a hand-written axios `api.ts` (not the generated client), so the mobile mirrors that pattern for consistency. The generated client package is present in package.json but unused.

**How to apply:** When adding new API calls in the mobile app, add them to `lib/api.ts` and define the response types inline — do NOT add generated hook calls or update the OpenAPI spec for mobile-only features.

Base URL: `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
