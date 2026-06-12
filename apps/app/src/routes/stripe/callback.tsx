import { Button } from "@openads/ui/button"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Loader2Icon } from "lucide-react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { orpc } from "~/lib/orpc"

export const Route = createFileRoute("/stripe/callback")({
  validateSearch: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),

  component: StripeCallbackPage,
})

function StripeCallbackPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const hasSubmitted = useRef(false)

  const completeConnection = useMutation(
    orpc.stripe.connect.callback.mutationOptions({
      onSuccess: ({ workspaceId }) => {
        toast.success("Stripe connected")
        navigate({ to: "/$workspaceId/settings/general", params: { workspaceId } })
      },
    }),
  )

  const searchError = search.error
    ? (search.error_description ?? "Stripe connection was cancelled.")
    : !search.code || !search.state
      ? "Missing Stripe connection details."
      : null

  const errorMessage = searchError ?? completeConnection.error?.message ?? null

  // `mutate` is referentially stable, so the effect only re-fires on real
  // param changes — the ref guards against StrictMode's double invoke.
  const { mutate } = completeConnection

  useEffect(() => {
    if (hasSubmitted.current || searchError || !search.code || !search.state) return
    hasSubmitted.current = true

    mutate({ code: search.code, state: search.state })
  }, [mutate, search.code, search.state, searchError])

  return (
    <div className="grid h-screen place-items-center px-6">
      <div className="grid max-w-sm gap-4 text-center">
        {!errorMessage ? (
          <>
            <Loader2Icon className="mx-auto size-8 animate-spin text-muted-foreground" />
            <h1 className="font-semibold text-xl">Connecting Stripe</h1>
            <p className="text-muted-foreground text-sm">This usually takes a few seconds.</p>
          </>
        ) : (
          <>
            <h1 className="font-semibold text-xl">Stripe connection failed</h1>
            <p className="text-muted-foreground text-sm">{errorMessage}</p>
            <Button asChild>
              <Link to="/">Go back</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
