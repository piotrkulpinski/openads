import { H3 } from "~/components/heading"
import { CreateSpotForm } from "~/components/spots/create-spot-form"

export default function SpotsNewPage() {
  return (
    <>
      <H3>New Ad Spot</H3>
      <CreateSpotForm className="mt-4" />
    </>
  )
}
