import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import type { ComponentProps, HTMLAttributes } from "react"
import { toast } from "sonner"
import { StripeIcon } from "~/components/icons/stripe"
import { ConfirmModal } from "~/components/modals/confirm-modal"
import { type RouterOutputs, trpc } from "~/lib/trpc"

type StripeConnectButtonsProps = ComponentProps<"div"> & {
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
          <hr />

          <p
            className={cx(
              "text-sm",
              workspace.stripeConnectStatus === "pending"
                ? "text-yellow-500"
                : "text-muted-foreground",
            )}
          >
            {workspace.stripeConnectStatus === "pending"
              ? "Please complete your Stripe onboarding to start receiving payments."
              : "Your Stripe account is connected and ready to receive payments."}
          </p>

          <ConfirmModal
            title="Disconnect from Stripe?"
            label="Disconnect"
            description="Are you sure you want to disconnect from Stripe? This will close your Stripe account. You won't be able to create new charges, log in to your dashboard, or access your Stripe financial data."
            onConfirm={() => disconnectAccount.mutate({ workspaceId: workspace.id })}
            confirmText={workspace.slug}
          >
            <Button
              variant="destructive"
              isPending={disconnectAccount.isPending}
              prefix={<StripeIcon className="size-4" />}
            >
              Disconnect Stripe
            </Button>
          </ConfirmModal>
        </>
      )}
    </div>
  )
}
