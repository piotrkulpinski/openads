// Export our custom server and client creators
export * from "./server"
export * from "./client"

// Re-export commonly used types and functions from better-auth
export type { BetterAuthOptions, Session, User } from "better-auth"
export { betterAuth } from "better-auth"
export { createAuthClient } from "better-auth/react"