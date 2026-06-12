import { BillingInterval } from "@openads/db/client"
import { tierPriceSchema } from "@openads/db/schema"
import { cx } from "@openads/ui/cva"
import { Form } from "@openads/ui/form"
import { useMutation } from "@tanstack/react-query"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { FormButton } from "~/components/form-button"
import { TierPriceFields } from "~/components/tiers/tier-price-fields"
import { useZodForm } from "~/hooks/use-zod-form"
import { wholeToCents } from "~/lib/currency"
import { handleMutationError } from "~/lib/handle-mutation-error"
import { orpc, queryClient } from "~/lib/orpc"

// Visible form schema uses whole units; the submit handler converts to cents.
// Currency is borrowed from the canonical tierPriceSchema so the allow-list stays
// in one place.
export const tierPriceFormSchema = z.object({
  interval: z.enum(BillingInterval).default(BillingInterval.Month),
  intervalCount: z.number().int().positive().default(1),
  amountWhole: z.number().int().nonnegative(),
  currency: tierPriceSchema.shape.currency,
})

type TierPriceFormValues = z.infer<typeof tierPriceFormSchema>

type TierPriceFormProps = HTMLAttributes<HTMLFormElement> & {
  workspaceId: string
  tierId: string
  onSuccess?: () => void
}

export const TierPriceForm = ({
  className,
  workspaceId,
  tierId,
  onSuccess: onSuccessCallback,
  ...props
}: TierPriceFormProps) => {
  const form = useZodForm(tierPriceFormSchema, {
    defaultValues: {
      interval: BillingInterval.Month,
      intervalCount: 1,
      amountWhole: 0,
      currency: "usd",
    },
  })

  const createPrice = useMutation(
    orpc.tierPrice.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Price added")
        await queryClient.invalidateQueries({
          queryKey: orpc.tier.getById.key({ input: { id: tierId, workspaceId } }),
        })
        form.reset()
        onSuccessCallback?.()
      },
      onError: error => {
        handleMutationError({ error, form })
      },
    }),
  )

  const onSubmit = ({ amountWhole, ...rest }: TierPriceFormValues) => {
    createPrice.mutate({
      ...rest,
      amount: wholeToCents(amountWhole),
      tierId,
      workspaceId,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cx("grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2", className)}
        noValidate
        {...props}
      >
        <TierPriceFields
          control={form.control}
          names={{ interval: "interval", amountWhole: "amountWhole", currency: "currency" }}
        />

        <FormButton size="sm" isPending={createPrice.isPending}>
          Add
        </FormButton>
      </form>
    </Form>
  )
}
