import { RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createRouter } from "./router"

import "./styles.css"

// Set up a Router instance
const router = createRouter()
const root = document.getElementById("root")

if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
