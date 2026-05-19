import { defineConfig } from "tsdown"

export default defineConfig([
  // Published library entry (ESM + types) — what npm consumers import.
  {
    entry: ["src/index.ts"],
    clean: true,
    dts: {
      resolve: true,
    },
    hash: false,
    minify: false,
    sourcemap: true,
    treeshake: true,
    unbundle: true,
    outExtensions: () => {
      return {
        js: ".js",
        dts: ".d.ts",
      }
    },
  },
  // Script bootstrap: a single minified IIFE synced to apps/app/public/embed.js.
  {
    entry: ["src/embed.ts"],
    clean: false,
    format: ["iife"],
    dts: false,
    hash: false,
    minify: true,
    sourcemap: false,
    treeshake: true,
    unbundle: false,
    outExtensions: () => {
      return {
        js: ".js",
      }
    },
  },
])
