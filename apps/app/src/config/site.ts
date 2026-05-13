import { env } from "~/env"

export const siteConfig = {
  url: env.VITE_BASE_URL,
  name: "OpenAds",
  tagline: "Self-serve subscription advertising for publishers.",
  description:
    "OpenAds lets publishers sell advertising tiers directly, with built-in Stripe billing and an approval workflow.",

  // Command
  commandShortcuts: [{ key: "k", metaKey: true }] as const,
}
