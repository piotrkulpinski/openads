import { removeProtocol } from "@primoui/utils"
import tailwindcss from "@tailwindcss/vite"
import tanstackRouter from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    server: {
      port: Number.parseInt(env.PORT ?? "5183", 10),
      allowedHosts: env.VITE_BASE_URL ? [removeProtocol(env.VITE_BASE_URL)] : [],
    },

    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      tanstackRouter({ target: "react", quoteStyle: "double", autoCodeSplitting: true }),
      react(),
    ],

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
  }
})
