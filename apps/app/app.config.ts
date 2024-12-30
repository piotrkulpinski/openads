import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { defineConfig } from "@tanstack/start/config"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  vite: {
    plugins: [
      TanStackRouterVite(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
})
