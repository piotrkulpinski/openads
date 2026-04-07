import baseConfig from "@dirstack/kodeks/oxfmt"
import { defineConfig } from "oxfmt"

export default defineConfig({
  ...baseConfig,
  ignorePatterns: ["*.{md,mdx}", "*.gen.ts", "apps/app/public/embed.js"],
})
