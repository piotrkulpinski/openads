import { SupportProvider } from "@cossistant/react"
import { Provider as Analytics } from "@openads/events/client"
import { TooltipProvider } from "@openads/ui/tooltip"
import { createRootRouteWithContext, Outlet, redirect, useLocation } from "@tanstack/react-router"
import { useEffect } from "react"
import { Toaster } from "~/components/toaster"
import { siteConfig } from "~/config/site"
import { env } from "~/env"
import type { trpcUtils } from "~/lib/trpc"

export type RouterAppContext = {
  trpc: typeof trpcUtils
}

// Only `/embed` is intended to be framed. Other routes must refuse to render
// inside a frame to prevent clickjacking on authenticated actions. CSP
// `frame-ancestors` requires a response header, which a static SPA can't set,
// so we enforce it in-document and bust out.
function useFrameBuster() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (typeof window === "undefined") return
    if (pathname === "/embed" || pathname.startsWith("/embed/")) return
    if (window.top === window.self) return
    try {
      // Same-origin parent or unrestricted sandbox — we can take over the top.
      window.top!.location.href = window.location.href
    } catch {
      // Cross-origin parent refuses navigation; blank the doc so there's
      // nothing for an overlay to click through to.
      document.body.innerHTML = ""
    }
  }, [pathname])
}

function RootComponent() {
  useFrameBuster()

  return (
    <SupportProvider publicKey={env.VITE_COSSISTANT_PUBLIC_KEY}>
      <TooltipProvider delayDuration={100}>
        <Outlet />

        <Analytics clientId={env.VITE_OPENPANEL_CLIENT_ID} />
        <Toaster />
      </TooltipProvider>
    </SupportProvider>
  )
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  beforeLoad: async ({ context: { trpc }, location: { pathname, searchStr } }) => {
    if (
      pathname === "/login" ||
      pathname === "/embed" ||
      pathname.startsWith("/embed/") ||
      pathname.startsWith("/advertise/")
    ) {
      return
    }

    const session = await trpc.auth.getSession.fetch()

    if (!session?.user) {
      const callbackURL = new URL(pathname + searchStr, siteConfig.url).toString()

      throw redirect({
        to: "/login",
        search: { callbackURL },
      })
    }
  },

  component: RootComponent,
})
