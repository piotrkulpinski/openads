import type { AppRouter } from "@openads/trpc/router"
import type { TRPCClientErrorLike } from "@trpc/client"

import { createQueryCell } from "~/lib/query-cell"

export const QueryCell = createQueryCell<TRPCClientErrorLike<AppRouter>>({
  pending: () => null,
  error: () => null,
})
