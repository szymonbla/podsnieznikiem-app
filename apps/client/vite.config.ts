import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

/**
 * The client talks to the API under `/api` — the proxy strips that prefix and
 * forwards the request to the Effect server. That keeps CORS out of the
 * browser and makes the base URL the same in dev and in test
 * (see `core/api.ts`).
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /* The alias the shadcn/ui generator expects — components import from `@/…`. */
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
})
