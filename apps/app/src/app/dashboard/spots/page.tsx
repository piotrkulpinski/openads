import { useParams } from "react-router"
import { H3, H4 } from "~/components/heading"
import { trpc } from "~/lib/trpc"

export default function SpotsPage() {
  const { workspace } = useParams() as { workspace: string }
  const { data: spots } = trpc.spot.getAll.useQuery({ workspace }, { initialData: [] })

  return (
    <>
      <H3>Ad Spots</H3>

      <div className="grid grid-cols-2 gap-4">
        {spots.map(spot => (
          <div key={spot.id}>
            <H4>{spot.name}</H4>
          </div>
        ))}
      </div>
    </>
  )
}
