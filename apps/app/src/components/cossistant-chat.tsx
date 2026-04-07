import { IdentifySupportVisitor, Support } from "@cossistant/react"
import { trpc } from "~/lib/trpc"

export function CossistantChat() {
  const { data: user } = trpc.user.me.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  })

  return (
    <>
      {user && (
        <IdentifySupportVisitor
          externalId={user.id}
          email={user.email ?? undefined}
          name={user.name}
          image={user.image}
        />
      )}

      <Support side="bottom" align="end" />
    </>
  )
}
