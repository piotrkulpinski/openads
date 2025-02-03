import { Button } from "@openads/ui/button"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { StripeIcon } from "~/components/icons/stripe"
import { type RouterOutputs, trpc } from "~/lib/trpc"

type StripeConnectButtonsProps = HTMLAttributes<HTMLElement> & {
  workspace: NonNullable<RouterOutputs["workspace"]["getBySlug"]>
  onSuccess?: () => void
}

export const StripeConnectButtons = ({
  className,
  workspace,
  onSuccess,
}: StripeConnectButtonsProps) => {
  const utils = trpc.useUtils()

  // TODO Add a workspace provider from onboarding to make is simpler

  const connectAccount = trpc.stripe.connect.create.useMutation({
    onSuccess: data => {
      utils.workspace.getBySlug.invalidate({ slug: workspace.slug })
      onSuccess?.()
      window.location.href = data.url
    },

    onError: error => {
      console.error(error)
      toast.error("Failed to connect with Stripe")
    },
  })

  const disconnectAccount = trpc.stripe.connect.delete.useMutation({
    onSuccess: () => {
      utils.workspace.getBySlug.invalidate({ slug: workspace.slug })
      onSuccess?.()
    },

    onError: error => {
      console.error(error)
      toast.error("Failed to disconnect with Stripe")
    },
  })

  return (
    <div className={className}>
      {!workspace.stripeConnectId ? (
        <Button
          size="lg"
          onClick={() => connectAccount.mutate({ workspaceId: workspace.id })}
          isPending={connectAccount.isPending}
          prefix={<StripeIcon className="size-4" />}
        >
          Connect with Stripe
        </Button>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Your Stripe account is connected and ready to receive payments.
            {workspace.stripeConnectStatus === "pending" && (
              <span className="block text-yellow-600 mt-2">
                Please complete your Stripe onboarding to start receiving payments.
              </span>
            )}
          </p>

          <Button
            variant="destructive"
            onClick={() => disconnectAccount.mutate({ workspaceId: workspace.id })}
            isPending={disconnectAccount.isPending}
            prefix={<StripeIcon className="size-4" />}
          >
            Disconnect Stripe
          </Button>
        </>
      )}
    </div>
  )
}
