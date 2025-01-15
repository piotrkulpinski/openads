import { createFileRoute } from "@tanstack/react-router"
import { H3 } from "~/components/heading"
import { CreateSpotForm } from "~/components/spots/create-spot-form"

export const Route = createFileRoute("/$workspace/spots/new")({
  component: SpotsNewPage,
})

function SpotsNewPage() {
  return (
    <>
      <H3>New Ad Spot</H3>
      <CreateSpotForm className="mt-4" />
    </>
  )
}
