import { db } from "@openads/db"
import { headers } from "next/headers"
import { H3, H4 } from "~/components/heading"
import { auth } from "~/lib/auth/server"

type SpotsPageProps = {
  params: Promise<{ workspace: string }>
}

export default async function SpotsPage({ params }: SpotsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  const { workspace } = await params

  const spots = await db.spot.findMany({
    where: {
      workspace: {
        slug: workspace,
        users: { some: { userId: session?.user.id } },
      },
    },
  })

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
