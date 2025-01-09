import { router } from "~/trpc"
import { userRouter } from "~/trpc/user"
import { workspaceRouter } from "~/trpc/workspace"

export const appRouter = router({
  user: userRouter,
  workspace: workspaceRouter,
})

export type AppRouter = typeof appRouter
