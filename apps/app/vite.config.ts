import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  server: { port: Number.parseInt(process.env.PORT ?? "5183") },
  plugins: [tsconfigPaths(), tailwindcss(), TanStackRouterVite({ quoteStyle: "double" }), react()],
  build: {
    rollupOptions: {
      output: {
        // manualChunks: {
        //   react: ["react", "react-dom"],
        // },
        // manualChunks(id) {
        //   if (id.includes("node_modules")) {
        //     return id.toString().split("node_modules/")[1]?.split("/")[0]?.toString()
        //   }
        // },
      },
    },
  },
})
