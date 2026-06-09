import { IdentifySupportVisitor, Support } from "@cossistant/react"
import { useQuery } from "@tanstack/react-query"
import { orpc } from "~/lib/orpc"

export const CossistantChat = () => {
  const { data: user } = useQuery(
    orpc.user.me.queryOptions({ staleTime: Number.POSITIVE_INFINITY }),
  )

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
