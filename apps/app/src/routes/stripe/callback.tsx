import { Button } from "@openads/ui/button"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Loader2Icon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { trpc } from "~/lib/trpc"

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const completeConnection = trpc.stripe.connect.callback.useMutation({
    onSuccess: ({ workspaceId }) => {
      toast.success("Stripe connected")
      navigate({ to: "/$workspaceId/settings/general", params: { workspaceId } })
    },
    onError: error => {
      setErrorMessage(error.message)
    },
  })

  useEffect(() => {
    if (hasSubmitted.current) return
    hasSubmitted.current = true

    if (search.error) {
      setErrorMessage(search.error_description ?? "Stripe connection was cancelled.")
      return
    }

    if (!search.code || !search.state) {
      setErrorMessage("Missing Stripe connection details.")
      return
    }

    completeConnection.mutate({ code: search.code, state: search.state })
  }, [completeConnection, search])

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
