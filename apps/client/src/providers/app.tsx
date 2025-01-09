import { QueryClient, type QueryClientConfig, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { httpBatchLink } from "@trpc/client"
import { type PropsWithChildren, useMemo, useState } from "react"
import superjson from "superjson"
import { getBaseUrl, trpc } from "../lib/trpc"

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 30_000, // 30 seconds
    },
  },
}

export const TRPCProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))

  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          httpBatchLink({
            url: `${getBaseUrl()}/trpc`,
            fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
            transformer: superjson,
          }),
        ],
      }),
    [],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      </trpc.Provider>
    </QueryClientProvider>
  )
}
