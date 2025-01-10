import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import Router from "./router"

import "./styles.css"

const root = document.getElementById("root")

if (root) {
  createRoot(root).render(
    <StrictMode>
      <Router />
    </StrictMode>,
  )
}
