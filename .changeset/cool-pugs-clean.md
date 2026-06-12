---
"@openads/sdk": patch
"@openads/react": patch
---

Add `OpenAdsSerializableRequestOptions` and use it for the React bindings' `request` props so the compiler enforces the JSON-serializability contract the hooks memoize on. The headless SDK keeps full `RequestInit` support (including `signal` and `Headers`). Also deduplicate `getAd`/`recordImpression`/`recordClick` internals — no behavior change.
