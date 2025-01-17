import type { AppRouter, RouterInputs, RouterOutputs } from "@openads/api/trpc"
import { QueryClient } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"
import { env } from "~/env"

export const trpc = createTRPCReact<AppRouter>()

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      // staleTime: 30_000, // 30 seconds
    },
  },
})

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${env.VITE_API_URL}/trpc`,
      fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
      transformer: superjson,
    }),
  ],
})

export const trpcUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
})

export type { RouterInputs, RouterOutputs }
