import { createQueryCell } from "~/lib/query-cell"

export const QueryCell = createQueryCell<Error>({
  pending: () => null,
  error: () => null,
})
