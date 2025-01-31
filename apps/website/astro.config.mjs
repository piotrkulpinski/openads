// @ts-check
import vercel from "@astrojs/vercel"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, envField } from "astro/config"

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  experimental: {
    responsiveImages: true,
    svg: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      MAILERLITE_API_TOKEN: envField.string({ context: "server", access: "secret" }),
    },
  },
})
