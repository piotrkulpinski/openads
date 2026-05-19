// Copies the built IIFE (dist/embed.iife.js) to the static asset that apps/app
// serves at GET /embed.js, prepending a "do not edit" banner. Runs as the last
// step of `@openads/browser` build, so embed.js is regenerated whenever the
// package is built (turbo build / changeset:publish), never during dev.
import { readFile, writeFile } from "node:fs/promises"
import * as path from "node:path"
import process from "node:process"

const packageDir = path.resolve(import.meta.dirname, "..")
const builtFile = path.join(packageDir, "dist", "embed.iife.js")
const destFile = path.resolve(packageDir, "..", "..", "apps", "app", "public", "embed.js")

const banner =
  "// Generated from @openads/browser/src/embed.ts — do not edit.\n" +
  "// Regenerate: bun run --filter @openads/browser build\n"

const built = await readFile(builtFile, "utf8")
await writeFile(destFile, `${banner}${built.trimEnd()}\n`)

process.stdout.write(`synced embed.js → ${path.relative(process.cwd(), destFile)}\n`)
