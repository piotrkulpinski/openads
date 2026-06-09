import { env } from "~/env"

export const siteConfig = {
  url: env.VITE_BASE_URL,

  // OpenAds project marketing site — used for "Powered by OpenAds" attribution
  // (the project's own landing page, not the self-hoster's dashboard URL).
  webUrl: "https://openads.co",

  name: "OpenAds",
  tagline: "Self-serve subscription advertising for publishers.",
  description:
    "OpenAds lets publishers sell advertising tiers directly, with built-in Stripe billing and an approval workflow.",

  // Command
  commandShortcuts: [{ key: "k", metaKey: true }] as const,
}
