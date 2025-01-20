import React from "react"
import { createRoot } from "react-dom/client"
import { Widget } from "./components/widget"
import type { WidgetConfig } from "./types"
import "./index.css"

const mount = (config: WidgetConfig) => {
  const container = document.getElementById("openads-widget")
  if (!container) return

  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <Widget {...config} />
    </React.StrictMode>,
  )
}

// Handle any queued commands
const queued = window.OpenAdsWidget?.q || []
window.OpenAdsWidget = (action: "init", config: WidgetConfig) => {
  if (action === "init") {
    mount(config)
  }
}

// Process any queued commands
for (const [action, config] of queued) {
  window.OpenAdsWidget?.(action as "init", config)
}
