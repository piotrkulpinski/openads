# OpenAlternative Ad Migration

OpenAlternative currently fetches ad content on the server and tracks engagement in the client.
OpenAds should keep that shape:

- Server components that call `findAdForPlacement` should move to `@openads/sdk` and call
  `client.getAd({ weightGte })`.
- Sponsor grids that call `findActiveAds` should call `client.getAds({ weightGte, count })`.
- Client links that use `AdLink` should call `recordClick`, or use `useOpenAdsTracking` in React.
- Impression tracking stays browser-side because it depends on actual viewport visibility.

Example server fetch:

```tsx
import { createOpenAdsClient } from "@openads/sdk"

const openads = createOpenAdsClient({
  workspaceSlug: "openalternative",
  apiUrl: process.env.OPENADS_API_URL,
})

export const AdCard = async () => {
  const ad = await openads.getAd({
    weightGte: 2.5,
    request: { cache: "no-store" },
  })

  if (!ad) return null

  return <a href={ad.websiteUrl}>{ad.name}</a>
}
```

Recommended OpenAlternative field preset:

- `description` (`Textarea`)
- `buttonLabel` (`Text`)
- `bannerUrl` (`Image` or `Url`)
