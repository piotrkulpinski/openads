import type { AppRouter, RouterInputs, RouterOutputs } from "@openads/trpc/router"
import { QueryClient } from "@tanstack/react-query"
import { createTRPCClient, httpBatchStreamLink, httpLink, type TRPCLink } from "@trpc/client"
import { createTRPCQueryUtils, createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"
import { env } from "~/env"

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>()

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

type UploadUserImageInput = RouterInputs["storage"]["uploadUserImage"]

const trpcUrl = `${env.VITE_API_URL}/trpc`

const fetchWithCredentials: typeof fetch = (url, options) =>
  fetch(url, { ...(options ?? {}), credentials: "include" })

const isUploadUserImageInput = (input: unknown): input is UploadUserImageInput => {
  if (!input || typeof input !== "object") {
    return false
  }

  const candidate = input as Record<string, unknown>
  return candidate.file instanceof File
}

const toFormData = (input: UploadUserImageInput) => {
  const formData = new FormData()
  formData.set("file", input.file)

  if (input.cacheControl) {
    formData.set("cacheControl", input.cacheControl)
  }

  if (input.contentType) {
    formData.set("contentType", input.contentType)
  }

  if (input.metadata && Object.keys(input.metadata).length > 0) {
    formData.set("metadata", JSON.stringify(input.metadata))
  }

  return formData
}

const uploadLink: TRPCLink<AppRouter> = runtime => {
  const uploadHttpLink = httpLink<AppRouter>({
    url: trpcUrl,
    fetch: fetchWithCredentials,
    transformer: superjson,
  })(runtime)

  return ({ op, next }) => {
    if (
      op.type === "mutation" &&
      op.path === "storage.uploadUserImage" &&
      isUploadUserImageInput(op.input)
    ) {
      return uploadHttpLink({
        op: {
          ...op,
          input: toFormData(op.input),
        },
        next,
      })
    }

    return next(op)
  }
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    uploadLink,
    httpBatchStreamLink({
      url: trpcUrl,
      fetch: fetchWithCredentials,
      transformer: superjson,
    }),
  ],
})

export const trpcUtils: ReturnType<typeof createTRPCQueryUtils<AppRouter>> = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
})

export type { RouterInputs, RouterOutputs }
