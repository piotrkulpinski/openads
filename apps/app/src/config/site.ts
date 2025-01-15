import { env } from "~/env"

export const siteConfig = {
  url: env.VITE_BASE_URL,
  name: "OpenAds",
  tagline: "A platform for creating and managing ads for your business.",
  description:
    "OpenAds is a platform for creating and managing ads for your business. It's easy to use and helps you collect leads from your website.",

  // Command
  commandShortcuts: [{ key: "k", metaKey: true }] as const,
}
