import { Provider as Analytics } from "@openads/events/client"
import { TooltipProvider } from "@openads/ui/tooltip"
import { TanstackDevtools } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { Toaster } from "~/components/toaster"
import { siteConfig } from "~/config/site"
import { env } from "~/env"
import type { trpcUtils } from "~/lib/trpc"

export type RouterAppContext = {
  trpcUtils: typeof trpcUtils
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  beforeLoad: async ({ context, location: { pathname, searchStr } }) => {
    if (["/login", "/embed"].includes(pathname)) {
      return
    }

    const session = await context.trpcUtils.auth.getSession.fetch()

    if (!session?.user) {
      const callbackURL = new URL(pathname + searchStr, siteConfig.url).toString()

      throw redirect({
        to: "/login",
        search: { callbackURL },
      })
    }
  },

  component: () => (
    <TooltipProvider delayDuration={100}>
      <Outlet />

      <Analytics clientId={env.VITE_OPENPANEL_CLIENT_ID} />
      <Toaster />

      <TanstackDevtools
        config={{ position: "bottom-left" }}
        plugins={[
          { name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
          { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
        ]}
      />
    </TooltipProvider>
  ),
})
