import type { AppRouter, RouterInputs, RouterOutputs } from "@openads/api/trpc"
import { QueryClient } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"

export const trpc = createTRPCReact<AppRouter>()

export function getBaseUrl() {
  return "http://localhost:3001"
}

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
      url: `${getBaseUrl()}/trpc`,
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
