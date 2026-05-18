import type { AppRouter, AppRouterClient, RouterInputs, RouterOutputs } from "@openads/orpc/router"
import { createORPCClient, ORPCError } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { env } from "~/env"

const link = new RPCLink({
  url: `${env.VITE_API_URL}/rpc`,
  fetch: (request, init) => fetch(request, { ...init, credentials: "include" }),
})

export const client: AppRouterClient = createORPCClient(link)

export const orpc: ReturnType<typeof createTanstackQueryUtils<AppRouterClient>> =
  createTanstackQueryUtils(client)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },

  queryCache: new QueryCache({
    onError: error => {
      // Unauthenticated state can be expected on public routes like /login.
      if (error instanceof ORPCError && error.code === "UNAUTHORIZED") return

      toast.error("Something went wrong. Please try again later.")
    },
  }),
})

export type { AppRouter, RouterInputs, RouterOutputs }
