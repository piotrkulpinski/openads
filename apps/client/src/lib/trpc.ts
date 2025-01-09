import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter, RouterInputs, RouterOutputs } from "../../../api/src/trpc/index"

export const trpc = createTRPCReact<AppRouter>()

export function getBaseUrl() {
  return "http://localhost:3001"
}

export type { RouterInputs, RouterOutputs }
