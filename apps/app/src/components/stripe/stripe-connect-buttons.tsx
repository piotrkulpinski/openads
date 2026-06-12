import { StripeConnectStatus } from "@openads/db/client"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { useMutation } from "@tanstack/react-query"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { StripeIcon } from "~/components/icons/stripe"
import { ConfirmModal } from "~/components/modals/confirm-modal"
import { logger } from "~/lib/logger"
import { orpc, queryClient, type RouterOutputs } from "~/lib/orpc"

type StripeConnectButtonsProps = ComponentProps<"div"> & {
  workspace: NonNullable<RouterOutputs["workspace"]["getById"]>
}

export const StripeConnectButtons = ({ workspace, ...props }: StripeConnectButtonsProps) => {
  const isConnectPending = workspace.stripeConnectStatus === StripeConnectStatus.Pending

  const connectAccount = useMutation(
    orpc.stripe.connect.create.mutationOptions({
      onSuccess: data => {
        queryClient.invalidateQueries({
          queryKey: orpc.workspace.getById.key({ input: { id: workspace.id } }),
        })
        window.location.href = data.url
      },

      onError: error => {
        logger.error("stripe.connect.create failed", { err: error, workspaceId: workspace.id })
        toast.error("Failed to connect with Stripe")
      },
    }),
  )

  const disconnectAccount = useMutation(
    orpc.stripe.connect.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.workspace.getById.key({ input: { id: workspace.id } }),
        })
      },

      onError: error => {
        logger.error("stripe.connect.delete failed", { err: error, workspaceId: workspace.id })
        toast.error("Failed to disconnect from Stripe")
      },
    }),
  )

  return (
    <div {...props}>
      {!workspace.stripeConnectId ? (
        <Button
          size="lg"
          onClick={() => connectAccount.mutate({ workspaceId: workspace.id })}
          isPending={connectAccount.isPending}
          prefix={<StripeIcon className="size-4" />}
          className="min-w-48"
        >
          Connect with Stripe
        </Button>
      ) : (
        <>
          <hr />

          <p
            className={cx(
              "text-sm",
              isConnectPending ? "text-yellow-500" : "text-muted-foreground",
            )}
          >
            {isConnectPending
              ? "Please finish connecting Stripe before advertisers can pay you."
              : "Your Stripe account is connected. Advertisers will pay through this account."}
          </p>

          <ConfirmModal
            title="Disconnect from Stripe?"
            label="Disconnect"
            description="Are you sure you want to disconnect OpenAds from Stripe? Your Stripe account stays open, but OpenAds will no longer be able to create ad subscriptions for this workspace."
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
