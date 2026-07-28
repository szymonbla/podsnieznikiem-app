import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { createQueryClient } from "./query"
import { createAppRouter } from "./router"
import "./style/index.css"

const container = document.getElementById("root")
if (container === null) {
  throw new Error("Brak elementu #root — sprawdź index.html")
}

const router = createAppRouter()
const queryClient = createQueryClient()

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
