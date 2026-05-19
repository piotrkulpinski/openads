// Script bootstrap for the zero-build `<script src=".../embed.js">` integration.
// Built to an IIFE and synced to `apps/app/public/embed.js` (see tsdown.config
// + scripts/sync-embed.ts). The mount/iframe logic lives ONLY in
// `mountTierSelector` (./index) — this file just adds the `window.OpenAds`
// queue/singleton wrapper that the script snippet depends on.
import {
  mountTierSelector,
  type OpenAdsTierSelector,
  type OpenAdsTierSelectorOptions,
} from "./index"

type QueueItem = { method: "init" | "updateConfig" | "destroy"; args: Array<unknown> }

type OpenAdsGlobal = {
  q?: Array<QueueItem>
  init: (options?: Partial<OpenAdsTierSelectorOptions>) => OpenAdsTierSelector | undefined
  updateConfig: (options?: Partial<OpenAdsTierSelectorOptions>) => void
  destroy: () => void
}

declare global {
  interface Window {
    OpenAds?: OpenAdsGlobal
  }
}

;(window => {
  const document = window.document
  const currentScript = document.currentScript as HTMLScriptElement | null
  const appUrl = currentScript?.src ? new URL(currentScript.src).origin : window.location.origin

  const existing = window.OpenAds
  const queue = Array.isArray(existing?.q) ? existing.q : []

  let widget: OpenAdsTierSelector | null = null
  let pendingConfig: Partial<OpenAdsTierSelectorOptions> = {}

  const api: OpenAdsGlobal = {
    q: [],
    init(options = {}) {
      const merged = { ...pendingConfig, ...options }

      if (!merged.slug) {
        throw new Error("OpenAds: slug is required.")
      }
      if (!merged.container) {
        throw new Error("OpenAds: container is required.")
      }

      // Pass the script-origin appUrl explicitly so mountTierSelector never
      // falls back to its packaged DEFAULT_APP_URL constant.
      const resolved = {
        ...merged,
        appUrl: merged.appUrl || appUrl,
      } as OpenAdsTierSelectorOptions

      if (widget) {
        widget.updateConfig(resolved)
      } else {
        widget = mountTierSelector(resolved)
      }

      pendingConfig = {}
      return widget
    },
    updateConfig(options = {}) {
      if (!widget) {
        pendingConfig = { ...pendingConfig, ...options }
        return
      }

      widget.updateConfig(options)
    },
    destroy() {
      widget?.destroy()
      widget = null
      pendingConfig = {}
    },
  }

  window.OpenAds = api

  for (const item of queue) {
    const method = api[item.method]
    if (typeof method === "function") {
      ;(method as (...args: Array<unknown>) => unknown)(...item.args)
    }
  }
})(window)
