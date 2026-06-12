import { SupportProvider } from "@cossistant/react"
import { initAnalytics } from "@openads/events/client"
import { TooltipProvider } from "@openads/ui/tooltip"
import { createRootRouteWithContext, Outlet, redirect, useLocation } from "@tanstack/react-router"
import { useEffect } from "react"
import { Toaster } from "~/components/toaster"
import { siteConfig } from "~/config/site"
import { env } from "~/env"
import type { orpc, queryClient } from "~/lib/orpc"

export type RouterAppContext = {
  orpc: typeof orpc
  queryClient: typeof queryClient
}

const isEmbedPath = (pathname: string) => pathname === "/embed" || pathname.startsWith("/embed/")

// Only `/embed` is intended to be framed. Other routes must refuse to render
// inside a frame to prevent clickjacking on authenticated actions. CSP
// `frame-ancestors` requires a response header, which a static SPA can't set,
// so we enforce it in-document and bust out.
function useFrameBuster() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (typeof window === "undefined") return
    if (isEmbedPath(pathname)) return
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

  useEffect(() => {
    if (env.VITE_OPENPANEL_CLIENT_ID) initAnalytics(env.VITE_OPENPANEL_CLIENT_ID)
  }, [])

  return (
    <SupportProvider publicKey={env.VITE_COSSISTANT_PUBLIC_KEY}>
      <TooltipProvider delayDuration={100}>
        <Outlet />

        <Toaster />
      </TooltipProvider>
    </SupportProvider>
  )
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  beforeLoad: async ({ context: { orpc, queryClient }, location: { pathname, searchStr } }) => {
    if (pathname === "/login" || isEmbedPath(pathname) || pathname.startsWith("/advertise/")) {
      return
    }

    const session = await queryClient.fetchQuery(orpc.auth.getSession.queryOptions())

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
