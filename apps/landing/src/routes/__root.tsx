import { getDomain } from "@dirstack/utils"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import type { PropsWithChildren } from "react"
import { env } from "~/env"
import appCss from "~/styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Self-serve subscription advertising for publishers – OpenAds",
      },
      {
        name: "description",
        content:
          "The simplest way to sell advertising on your site. Define tiers, embed a widget, approve creatives, and get paid via Stripe.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", media: "(prefers-color-scheme: light)" },
      { rel: "icon", href: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    scripts: [
      {
        defer: true,
        "data-domain": getDomain(env.VITE_BASE_URL),
        src: "https://p.kulp.in/js/script.js",
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: PropsWithChildren) {
  return (
    <html lang="en" id="waitlist">
      <head>
        <HeadContent />
      </head>

      <body className="flex flex-col w-full min-h-dvh bg-background text-foreground font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
