import type { AppRouter, RouterInputs, RouterOutputs } from "@openads/api/trpc"
import { createTRPCReact } from "@trpc/react-query"

export const trpc = createTRPCReact<AppRouter>()

export function getBaseUrl() {
  return "http://localhost:3001"
}

export type { RouterInputs, RouterOutputs }
