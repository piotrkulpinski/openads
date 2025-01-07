import { router } from "~/trpc"
import { userRouter } from "~/trpc/user"

export const appRouter = router({
  user: userRouter,
})

export type AppRouter = typeof appRouter
