import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "../../../api/src/trpc/index"

export const trpc = createTRPCReact<AppRouter>()

export function getBaseUrl() {
  return "http://localhost:3001"
}
