import type { AppRouter } from "@openads/api/trpc"
import { createTRPCClient, httpBatchLink } from "@trpc/client"
import superjson from "superjson"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/trpc"

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: API_URL,
      headers: () => ({
        Origin: window.location.origin,
      }),
      transformer: superjson,
    }),
  ],
})
