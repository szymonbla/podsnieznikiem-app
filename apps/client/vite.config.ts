import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

/**
 * Klient rozmawia z API pod `/api` — proxy zdejmuje ten prefiks i kieruje
 * żądanie na serwer Effecta. Dzięki temu w przeglądarce nie ma CORS-a,
 * a adres bazowy jest ten sam w dev i w teście (patrz `core/api.ts`).
 */
export default defineConfig({
  plugins: [react()],
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
