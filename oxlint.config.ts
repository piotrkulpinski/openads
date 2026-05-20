import baseConfig from "@dirstack/kodeks/oxlint-tanstack"
import { defineConfig } from "oxlint"

export default defineConfig({
  ...baseConfig,
  ignorePatterns: ["apps/app/public/embed.js"],
})
