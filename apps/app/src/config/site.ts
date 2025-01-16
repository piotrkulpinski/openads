import { env } from "~/env"

export const siteConfig = {
  url: env.VITE_BASE_URL,
  name: "OpenAds",
  tagline: "Automate ad spot management, increase revenue and make advertisers happy.",
  description:
    "OpenAds is an ad spot management platform, crafted to simplify the process of selling ad spots on your websites.",

  // Command
  commandShortcuts: [{ key: "k", metaKey: true }] as const,
}
