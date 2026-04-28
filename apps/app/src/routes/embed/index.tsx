import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { z } from "zod"

const defaultValues = {
  workspaceId: "",
  zoneId: "",
  theme: "auto",
} as const

export const Route = createFileRoute("/embed/")({
  validateSearch: z.object({
    workspaceId: z.string().default(defaultValues.workspaceId),
    zoneId: z.string().default(defaultValues.zoneId),
    theme: z.enum(["auto", "light", "dark"]).catch(defaultValues.theme),
  }),

  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },

  component: AdEmbed,
})

// Implemented in M5 — weighted ad rotation per zone, IntersectionObserver impressions, click beacon.
function AdEmbed() {
  const { workspaceId, zoneId } = Route.useSearch()

  if (!workspaceId || !zoneId) {
    return (
      <div className="grid h-screen place-items-center">
        <p className="text-center text-muted-foreground">
          Missing <code>workspaceId</code> or <code>zoneId</code> search param.
        </p>
      </div>
    )
  }

  return (
    <div className="grid h-screen place-items-center">
      <p className="text-center text-muted-foreground">Ad serving rebuild in progress.</p>
    </div>
  )
}
