import { IdentifySupportVisitor, Support, SupportProvider } from "@cossistant/react"
import "@cossistant/react/support.css"
import { env } from "~/env"
import { trpc } from "~/lib/trpc"

export function CossistantChat() {
  const { data: user } = trpc.user.me.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  })

  return (
    <SupportProvider publicKey={env.VITE_COSSISTANT_PUBLIC_KEY}>
      {user && (
        <IdentifySupportVisitor
          externalId={user.id}
          email={user.email ?? undefined}
          name={user.name}
          image={user.image}
        />
      )}

      <Support />
    </SupportProvider>
  )
}
