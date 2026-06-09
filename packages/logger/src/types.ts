/**
 * Shared logger types used by both the server and browser entrypoints.
 *
 * The interface is intentionally narrower than pino's so that swapping
 * the implementation (e.g. to Sentry, OpenTelemetry, or a noop in tests)
 * doesn't ripple through call sites.
 */

export const LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

/**
 * Structured context attached to a log entry. `err` is treated specially:
 * when present, the implementation serializes name/message/stack and
 * surfaces them as first-class fields.
 */
export type LogContext = Record<string, unknown> & {
  err?: unknown
}

export type Logger = {
  trace(message: string, context?: LogContext): void
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  fatal(message: string, context?: LogContext): void
  /**
   * Returns a new logger with the given bindings merged into every entry.
   * Use for request/workspace scoping.
   */
  child(bindings: LogContext): Logger
}

/**
 * Wire format for entries shipped from the browser to the server.
 * Validated by the API route before being re-emitted server-side.
 */
export type RemoteLogEntry = {
  level: LogLevel
  message: string
  time: number
  context?: LogContext
  err?: SerializedError
  source?: {
    url?: string
    userAgent?: string
    service?: string
    release?: string
  }
}

export type SerializedError = {
  name: string
  message: string
  stack?: string
  cause?: SerializedError
}

export const serializeError = (input: unknown): SerializedError | undefined => {
  if (input == null) return undefined

  if (input instanceof Error) {
    return {
      name: input.name,
      message: input.message,
      stack: input.stack,
      cause: input.cause != null ? serializeError(input.cause) : undefined,
    }
  }

  if (typeof input === "object") {
    const obj = input as Record<string, unknown>
    const name = typeof obj.name === "string" ? obj.name : "Error"
    const message = typeof obj.message === "string" ? obj.message : JSON.stringify(input)
    const stack = typeof obj.stack === "string" ? obj.stack : undefined
    return { name, message, stack }
  }

  return { name: "Error", message: String(input) }
}
