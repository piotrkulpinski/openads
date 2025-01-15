import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { httpBatchLink } from "@trpc/client"
import { createTRPCQueryUtils } from "@trpc/react-query"
import { LoaderIcon } from "lucide-react"
import type { PropsWithChildren } from "react"
import superjson from "superjson"
import { getBaseUrl, trpc } from "~/lib/trpc"

// Import the generated route tree
import { routeTree } from "./routeTree.gen"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      // staleTime: 30_000, // 30 seconds
    },
  },
})

const client = trpc.createClient({
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
  client,
})

export const createRouter = () =>
  createTanStackRouter({
    routeTree,
    // defaultPreload: "intent",
    defaultStaleTime: Number.POSITIVE_INFINITY,
    context: { trpcUtils },
    defaultPendingComponent: () => <LoaderIcon className="animate-spin" />,
    Wrap: ({ children }: PropsWithChildren) => {
      return (
        <trpc.Provider client={client} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
      )
    },
  })

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
