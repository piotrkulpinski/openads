import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { PropsWithChildren } from "react"
import appCss from "~/styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Automate ad zone management, increase revenue and make advertisers happy – OpenAds",
      },
      {
        name: "description",
        content:
          "The simplest way to sell ads directly on your site. Define zones, set prices, embed a widget, and get paid via Stripe.",
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
        "data-domain": "openads.co",
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
