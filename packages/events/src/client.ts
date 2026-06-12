import { OpenPanel } from "@openpanel/web"

const isProd = process.env.NODE_ENV === "production"

let op: OpenPanel | undefined

// Idempotent — React StrictMode and hot reload would otherwise double-init.
export const initAnalytics = (clientId: string) => {
  if (typeof window === "undefined" || op) return op

  op = new OpenPanel({
    clientId,
    trackScreenViews: isProd,
    trackOutgoingLinks: isProd,
    trackAttributes: true,
  })

  return op
}
