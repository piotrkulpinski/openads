# @openads/sdk

Universal headless SDK for fetching and tracking [OpenAds](https://openads.co) publisher
ads. Zero dependencies; runs in any JS runtime with `fetch` (browser, Node, edge, workers).

## Install

```sh
npm install @openads/sdk
```

## Usage

```ts
import { createOpenAdsClient } from "@openads/sdk"

const openads = createOpenAdsClient({
  workspaceSlug: "your-workspace",
  // apiUrl defaults to the OpenAds production API
})

// Fetch the single ad currently serving for a placement.
const ad = await openads.getAd({ weightGte: 2.5 })

// Fetch several ads for a grid (rotation-aware; pass excludeIds to dedupe).
const ads = await openads.getAds({ count: 5, excludeIds: ad ? [ad.id] : [] })

// Record events.
if (ad) {
  await openads.recordImpression(ad.id)
  await openads.recordClick(ad.id)
}
```

`getAd` resolves to `OpenAdsAd | null`; `getAds` to `OpenAdsAd[]` (empty when nothing
is eligible — the SDK never throws on "no ads").

### Next.js

Pass `request.next` for App Router caching:

```ts
const ad = await openads.getAd({ request: { next: { revalidate: 60 } } })
```

## Errors

Non-2xx responses throw `OpenAdsApiError` (`{ status, body }`). The `body` is the
OpenAds API error envelope:

```jsonc
{ "defined": false, "code": "NOT_FOUND", "status": 404, "message": "Workspace not found." }
```

Input-validation failures use HTTP **422** with `code: "INPUT_VALIDATION_FAILED"` and a
`data.fieldErrors` / `data.formErrors` map.

## API reference

OpenAPI spec and interactive docs are served at `/v1/openapi.json` and `/v1/docs` on the
OpenAds API. For React bindings see [`@openads/react`](https://www.npmjs.com/package/@openads/react).
