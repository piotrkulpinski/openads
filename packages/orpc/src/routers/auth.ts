import { publicProcedure } from "../index"

export const authRouter = {
  getSession: publicProcedure.handler(async ({ context: { auth } }) => {
    return auth
  }),
}
