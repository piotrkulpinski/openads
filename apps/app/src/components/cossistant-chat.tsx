import { IdentifySupportVisitor, Support } from "@cossistant/react"
import { useQuery } from "@tanstack/react-query"
import { orpc } from "~/lib/orpc"

export const CossistantChat = () => {
  const { data: user } = useQuery(orpc.user.me.queryOptions())

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

      <Support.Root>
        <Support.Trigger
          aria-hidden="true"
          className="pointer-events-none fixed right-4 bottom-4 size-px overflow-hidden border-0 bg-transparent p-0 opacity-0"
          tabIndex={-1}
        />

        <Support.Content align="end" collisionPadding={16} side="top" sideOffset={16} />
      </Support.Root>
    </>
  )
}
