import "./styles.css"
import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { LoaderIcon } from "lucide-react"
import type { PropsWithChildren } from "react"
import { createRoot } from "react-dom/client"
import { ErrorRoute } from "~/components/errors/error"
import { NotFoundRoute } from "~/components/errors/not-found"
import { logger } from "~/lib/logger"
import { orpc, queryClient } from "~/lib/orpc"
import { routeTree } from "~/routeTree.gen"

const router = createRouter({
  routeTree,
  defaultPendingMinMs: 0,
  defaultStaleTime: Number.POSITIVE_INFINITY,
  context: { orpc, queryClient },
  defaultNotFoundComponent: NotFoundRoute,
  defaultErrorComponent: ErrorRoute,
  defaultPendingComponent: () => <LoaderIcon className="animate-spin mx-auto mt-[5vh]" />,
  Wrap: ({ children }: PropsWithChildren) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  },
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// Reload when a deployed build invalidates the current route chunk.
window.addEventListener("vite:preloadError", () => {
  window.location.reload()
})

const rootElement = document.getElementById("app")
if (rootElement && !rootElement.innerHTML) {
  createRoot(rootElement, {
    onCaughtError: (error, info) =>
      logger.error("react caught error", { err: error, componentStack: info.componentStack }),
    onUncaughtError: (error, info) =>
      logger.error("react uncaught error", { err: error, componentStack: info.componentStack }),
    onRecoverableError: (error, info) =>
      logger.warn("react recoverable error", { err: error, componentStack: info.componentStack }),
  }).render(<RouterProvider router={router} />)
}
