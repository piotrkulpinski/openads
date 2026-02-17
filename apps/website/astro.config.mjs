// @ts-check
import cloudflare from "@astrojs/cloudflare"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, envField } from "astro/config"

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      MAILERLITE_API_TOKEN: envField.string({ context: "server", access: "secret" }),
      PLAUSIBLE_DOMAIN: envField.string({ context: "client", access: "public" }),
      PLAUSIBLE_URL: envField.string({ context: "client", access: "public" }),
    },
  },
})
