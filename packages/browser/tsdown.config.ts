import { defineConfig } from "tsdown"

export default defineConfig({
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
})
