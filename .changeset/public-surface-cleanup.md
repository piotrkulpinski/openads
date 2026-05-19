---
"@openads/sdk": minor
"@openads/react": minor
"@openads/browser": minor
---

Simplify the public surface.

- **Breaking (`@openads/sdk`):** `GET /v1/workspaces/{slug}/ads/current` now returns
  `{ ads }` only — the redundant top-level `ad` field (always `ads[0]`) was removed.
  `client.getAd()` is unchanged for consumers (it now derives `ads[0] ?? null`
  internally); only integrators reading the raw `ad` field off the REST response need
  to switch to `ads[0]`.
- `OpenAdsRequestOptions.next` is now typed (`{ revalidate?: number | false; tags?: string[] }`)
  instead of `unknown`.
- The `/v1` field `type` is now a documented enum in the OpenAPI spec, and the error
  envelope (`{ defined, code, status, message, data }`, 422 for validation) is
  documented; a README ships with `@openads/sdk`.
- `@openads/react`: no API change (rides the fixed-group version bump).
- `@openads/browser`: no API change. `apps/app/public/embed.js` is now generated from
  `src/embed.ts` instead of being hand-maintained, eliminating the drift between the
  package and the served script.
