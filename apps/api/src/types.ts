import type { ContextVariableMap } from "hono"

export interface User {
  id: string
  email: string
}

export interface Context {
  req: {
    raw: Request & {
      headers: Headers
      variables: ContextVariableMap
    }
  }
  user?: User
}
