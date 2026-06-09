/**
 * Server-side logger backed by pino.
 *
 * Writes pretty-formatted output to stdout in development and structured
 * JSON to a log file. The file destination uses pino's built-in async
 * write (sonic-boom) so logging never blocks the event loop.
 *
 * To swap in Sentry later, push `@sentry/pino-transport` into the
 * multistream array — every call site stays untouched.
 */

import { mkdirSync } from "node:fs"
import { dirname, isAbsolute, resolve } from "node:path"
import pino, { type Logger as PinoLogger, type StreamEntry } from "pino"
import pretty from "pino-pretty"
import type { Logger, LogContext, LogLevel } from "./types"
import { serializeError } from "./types"

export type ServerLoggerOptions = {
  /**
   * Service name used as the root binding (e.g. `"api"`, `"web"`).
   */
  name: string
  /**
   * Minimum level to emit. Defaults to `"info"` in production and
   * `"debug"` otherwise.
   */
  level?: LogLevel
  /**
   * File path for the structured JSON log. Relative paths resolve from
   * `process.cwd()`. Defaults to `logs/openads.log`.
   */
  destination?: string | false
  /**
   * Whether to emit pretty-printed logs to stdout. Defaults to `true`
   * when `NODE_ENV !== "production"`.
   */
  pretty?: boolean
  /**
   * Extra bindings merged into every entry.
   */
  base?: LogContext
}

const isProduction = () => process.env.NODE_ENV === "production"

const ensureDir = (filePath: string) => {
  mkdirSync(dirname(filePath), { recursive: true })
}

const buildStreams = (opts: ServerLoggerOptions): StreamEntry[] => {
  const streams: StreamEntry[] = []
  const usePretty = opts.pretty ?? !isProduction()

  if (usePretty) {
    streams.push({
      stream: pretty({
        colorize: true,
        translateTime: "SYS:HH:MM:ss.l",
        ignore: "pid,hostname",
        singleLine: false,
      }),
    })
  } else {
    // Always keep a stdout stream so container logs / `docker logs` still work.
    streams.push({ stream: process.stdout })
  }

  if (opts.destination !== false) {
    const dest = opts.destination ?? "logs/openads.log"
    const fullPath = isAbsolute(dest) ? dest : resolve(process.cwd(), dest)
    ensureDir(fullPath)
    streams.push({
      stream: pino.destination({
        dest: fullPath,
        sync: false,
        mkdir: true,
      }),
    })
  }

  return streams
}

const wrap = (pinoLogger: PinoLogger): Logger => {
  const emit = (level: LogLevel, message: string, context?: LogContext) => {
    if (!context) {
      pinoLogger[level](message)
      return
    }

    const { err, ...rest } = context
    const payload: Record<string, unknown> = { ...rest }

    if (err !== undefined) {
      payload.err = serializeError(err)
    }

    pinoLogger[level](payload, message)
  }

  return {
    trace: (message, context) => emit("trace", message, context),
    debug: (message, context) => emit("debug", message, context),
    info: (message, context) => emit("info", message, context),
    warn: (message, context) => emit("warn", message, context),
    error: (message, context) => emit("error", message, context),
    fatal: (message, context) => emit("fatal", message, context),
    child: bindings => wrap(pinoLogger.child(bindings)),
  }
}

export const createServerLogger = (opts: ServerLoggerOptions): Logger => {
  const level = opts.level ?? (isProduction() ? "info" : "debug")

  const pinoLogger = pino(
    {
      name: opts.name,
      level,
      base: { service: opts.name, ...opts.base },
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: label => ({ level: label }),
      },
    },
    pino.multistream(buildStreams(opts)),
  )

  return wrap(pinoLogger)
}

/**
 * Attaches process-level handlers that route uncaught errors into the
 * given logger. Safe to call once at app boot.
 */
export const installProcessErrorHandlers = (logger: Logger) => {
  process.on("uncaughtException", err => {
    logger.fatal("uncaughtException", { err })
  })

  process.on("unhandledRejection", reason => {
    logger.error("unhandledRejection", { err: reason })
  })
}
