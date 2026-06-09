/**
 * Browser-side logger. Batches structured entries and ships them to a
 * remote `/log` endpoint (typically served by `@openads/logger/server`
 * inside the API). Falls back to `navigator.sendBeacon` on `pagehide`
 * so we don't lose entries when the tab is closing.
 *
 * The browser logger never throws and never retries — if the endpoint
 * is unreachable we drop the batch to avoid feedback loops.
 */

import type { LogContext, Logger, LogLevel, RemoteLogEntry } from "./types"
import { serializeError } from "./types"

export type BrowserLoggerOptions = {
  /**
   * Absolute URL of the remote `/log` endpoint.
   * Pass `null` to disable remote shipping (useful in tests).
   */
  endpoint: string | null
  /**
   * Service name attached to every entry's `source.service`.
   */
  service: string
  /**
   * Build / deploy identifier for cross-referencing source maps.
   */
  release?: string
  /**
   * Minimum level to ship to the endpoint. Lower-severity entries
   * still hit the console but are not transmitted. Defaults to `"warn"`.
   */
  remoteLevel?: LogLevel
  /**
   * Minimum level for console output. Defaults to `"debug"` in dev
   * (when `import.meta.env?.DEV` is truthy) and `"warn"` otherwise.
   */
  consoleLevel?: LogLevel
  /**
   * Max entries buffered before a flush is forced. Default `20`.
   */
  batchSize?: number
  /**
   * Max time (ms) an entry sits in the buffer before flush. Default `3000`.
   */
  flushIntervalMs?: number
  /**
   * Extra context merged into every entry's `context`.
   */
  base?: LogContext
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
}

const isDev = (): boolean => {
  try {
    const meta = import.meta as unknown as { env?: { DEV?: boolean } } | undefined
    return Boolean(meta?.env?.DEV)
  } catch {
    return false
  }
}

const consoleMethodFor = (level: LogLevel): "log" | "info" | "warn" | "error" => {
  if (level === "fatal" || level === "error") return "error"
  if (level === "warn") return "warn"
  if (level === "info") return "info"
  return "log"
}

type InternalLoggerState = {
  buffer: RemoteLogEntry[]
  flushTimer: ReturnType<typeof setTimeout> | null
  installed: boolean
}

const createCore = (opts: BrowserLoggerOptions) => {
  const remoteThreshold = LEVEL_PRIORITY[opts.remoteLevel ?? "warn"]
  const consoleThreshold = LEVEL_PRIORITY[opts.consoleLevel ?? (isDev() ? "debug" : "warn")]
  const batchSize = opts.batchSize ?? 20
  const flushIntervalMs = opts.flushIntervalMs ?? 3000

  const state: InternalLoggerState = {
    buffer: [],
    flushTimer: null,
    installed: false,
  }

  const buildEntry = (
    level: LogLevel,
    message: string,
    context: LogContext | undefined,
    bindings: LogContext,
  ): RemoteLogEntry => {
    const merged: LogContext = { ...bindings, ...context }
    const { err, ...rest } = merged
    return {
      level,
      message,
      time: Date.now(),
      context: Object.keys(rest).length > 0 ? rest : undefined,
      err: err !== undefined ? serializeError(err) : undefined,
      source: {
        service: opts.service,
        release: opts.release,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      },
    }
  }

  const flush = (useBeacon = false) => {
    if (state.flushTimer != null) {
      clearTimeout(state.flushTimer)
      state.flushTimer = null
    }

    if (state.buffer.length === 0 || opts.endpoint == null) return

    const entries = state.buffer
    state.buffer = []
    const body = JSON.stringify({ entries })

    if (useBeacon && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      try {
        navigator.sendBeacon(opts.endpoint, new Blob([body], { type: "application/json" }))
        return
      } catch {
        // fall through to fetch
      }
    }

    // Fire-and-forget. We intentionally never retry to avoid feedback loops.
    fetch(opts.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      credentials: "include",
      keepalive: true,
    }).catch(() => {
      // Swallow: logging the logger's failure is a recipe for a loop.
    })
  }

  const scheduleFlush = () => {
    if (state.flushTimer != null) return
    state.flushTimer = setTimeout(() => flush(false), flushIntervalMs)
  }

  const installFlushHooks = () => {
    if (state.installed || typeof window === "undefined") return
    state.installed = true

    const onHide = () => flush(true)
    window.addEventListener("pagehide", onHide)
    window.addEventListener("beforeunload", onHide)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush(true)
    })
  }

  installFlushHooks()

  const emit = (
    level: LogLevel,
    message: string,
    context: LogContext | undefined,
    bindings: LogContext,
  ) => {
    const priority = LEVEL_PRIORITY[level]
    const entry = buildEntry(level, message, context, bindings)

    if (priority >= consoleThreshold && typeof console !== "undefined") {
      const method = consoleMethodFor(level)
      console[method](`[${entry.source?.service}] ${message}`, entry.context ?? "", entry.err ?? "")
    }

    if (priority >= remoteThreshold && opts.endpoint != null) {
      state.buffer.push(entry)
      if (state.buffer.length >= batchSize) {
        flush(false)
      } else {
        scheduleFlush()
      }
    }
  }

  return { emit, flush }
}

const buildLogger = (core: ReturnType<typeof createCore>, bindings: LogContext): BrowserLogger => ({
  trace: (message, context) => core.emit("trace", message, context, bindings),
  debug: (message, context) => core.emit("debug", message, context, bindings),
  info: (message, context) => core.emit("info", message, context, bindings),
  warn: (message, context) => core.emit("warn", message, context, bindings),
  error: (message, context) => core.emit("error", message, context, bindings),
  fatal: (message, context) => core.emit("fatal", message, context, bindings),
  child: extra => buildLogger(core, { ...bindings, ...extra }),
  flush: () => core.flush(false),
})

export type BrowserLogger = Logger & {
  /**
   * Forces an immediate flush of buffered entries.
   */
  flush: () => void
}

export const createBrowserLogger = (opts: BrowserLoggerOptions): BrowserLogger => {
  const core = createCore(opts)
  return buildLogger(core, opts.base ?? {})
}

/**
 * Installs window-level handlers that route uncaught errors and
 * unhandled promise rejections into the logger. Idempotent per logger.
 */
export const installGlobalErrorHandlers = (logger: Logger) => {
  if (typeof window === "undefined") return

  window.addEventListener("error", event => {
    logger.error(event.message || "window.error", {
      err: event.error ?? { message: event.message, stack: undefined },
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener("unhandledrejection", event => {
    logger.error("unhandledrejection", { err: event.reason })
  })
}

export { LOG_LEVELS } from "./types"
