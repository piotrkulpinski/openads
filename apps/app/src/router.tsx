import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { LoaderIcon } from "lucide-react"
import type { PropsWithChildren } from "react"
import { NotFound } from "~/components/not-found"
import { queryClient, trpc, trpcClient, trpcUtils } from "~/lib/trpc"

// Import the generated route tree
import { routeTree } from "./routeTree.gen"

export const createRouter = () =>
  createTanStackRouter({
    routeTree,
    // defaultPreload: "intent",
    defaultStaleTime: Number.POSITIVE_INFINITY,
    context: { trpcUtils },
    defaultNotFoundComponent: () => <NotFound />,
    defaultPendingComponent: () => <LoaderIcon className="animate-spin" />,
    Wrap: ({ children }: PropsWithChildren) => {
      return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
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
