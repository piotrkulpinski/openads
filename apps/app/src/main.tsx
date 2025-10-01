import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { LoaderIcon } from "lucide-react"
import type { PropsWithChildren } from "react"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ErrorRoute } from "~/components/errors/error"
import { NotFoundRoute } from "~/components/errors/not-found"
import { queryClient, trpc, trpcClient, trpcUtils } from "~/lib/trpc"
import { routeTree } from "~/routeTree.gen"
import "./styles.css"

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPendingMinMs: 0,
  defaultStaleTime: Number.POSITIVE_INFINITY,
  context: { trpc: trpcUtils },
  defaultNotFoundComponent: NotFoundRoute,
  defaultErrorComponent: ErrorRoute,
  defaultPendingComponent: () => <LoaderIcon className="animate-spin mx-auto mt-[5vh]" />,
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
    router: typeof router
  }
}

// reloads the app if there is an error fetching an outdated chunk due to a new build deployed
window.addEventListener("vite:preloadError", () => {
  window.location.reload()
})

// Render the app
const rootElement = document.getElementById("app")
if (rootElement && !rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
