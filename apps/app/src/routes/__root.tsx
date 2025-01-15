import { Provider as Analytics } from "@openads/events/client"
import { TooltipProvider } from "@openads/ui/tooltip"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Outlet, createRootRouteWithContext, redirect } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Toaster } from "~/components/toaster"
import { siteConfig } from "~/config/site"
import { env } from "~/env"
import type { trpcUtils } from "~/router"

export type RouterAppContext = {
  trpcUtils: typeof trpcUtils
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  loader: async ({ context, location }) => {
    if (location.pathname === "/login") {
      return
    }

    const session = await context.trpcUtils.auth.getSession.fetch()

    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { callbackURL: `${siteConfig.url}${location.pathname}` },
      })
    }
  },

  component: () => (
    <TooltipProvider delayDuration={250}>
      <Outlet />

      <Analytics clientId={env.VITE_OPENPANEL_CLIENT_ID} />
      <Toaster />

      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </TooltipProvider>
  ),
})
