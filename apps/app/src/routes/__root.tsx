import { SupportProvider } from "@cossistant/react"
import { Provider as Analytics } from "@openads/events/client"
import { TooltipProvider } from "@openads/ui/tooltip"
import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router"
import { CossistantChat } from "~/components/cossistant-chat"
import { Toaster } from "~/components/toaster"
import { siteConfig } from "~/config/site"
import { env } from "~/env"
import type { trpcUtils } from "~/lib/trpc"

export type RouterAppContext = {
  trpc: typeof trpcUtils
}

function RootComponent() {
  return (
    <SupportProvider publicKey={env.VITE_COSSISTANT_PUBLIC_KEY}>
      <TooltipProvider delayDuration={100}>
        <Outlet />

        <Analytics clientId={env.VITE_OPENPANEL_CLIENT_ID} />
        <Toaster />
        <CossistantChat />
      </TooltipProvider>
    </SupportProvider>
  )
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  beforeLoad: async ({ context: { trpc }, location: { pathname, searchStr } }) => {
    if (["/login", "/embed"].includes(pathname)) {
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
