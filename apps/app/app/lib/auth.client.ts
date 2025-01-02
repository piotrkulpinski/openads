import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient({})

export const { signIn, signOut, useSession } = authClient
