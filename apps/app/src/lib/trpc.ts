import type { AppRouter, RouterInputs, RouterOutputs } from "@openads/trpc/router"
import { QueryCache, QueryClient } from "@tanstack/react-query"
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client"
import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query"
import { toast } from "sonner"
import superjson from "superjson"
import { env } from "~/env"

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>()

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },

  queryCache: new QueryCache({
    onError: () => toast.error("Something went wrong. Please try again later."),
  }),
})

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchStreamLink({
      url: `${env.VITE_API_URL}/trpc`,
      fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
      transformer: superjson,
    }),
  ],
})

export const trpcUtils: ReturnType<typeof createTRPCQueryUtils<AppRouter>> = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
})

export type { RouterInputs, RouterOutputs }
