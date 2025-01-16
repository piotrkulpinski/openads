import { createFileRoute } from "@tanstack/react-router"
import { H3 } from "~/components/heading"
import { SpotForm } from "~/components/spots/spot-form"

export const Route = createFileRoute("/$workspace/spots/new")({
  component: SpotsNewPage,
})

function SpotsNewPage() {
  return (
    <>
      <H3>New Ad Spot</H3>
      <SpotForm className="mt-4" nextUrl={{ from: Route.fullPath, to: ".." }} />
    </>
  )
}
