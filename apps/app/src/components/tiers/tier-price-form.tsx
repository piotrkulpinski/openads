import { BillingInterval } from "@openads/db/client"
import { tierPriceSchema } from "@openads/db/schema"
import { cx } from "@openads/ui/cva"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { useMutation } from "@tanstack/react-query"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { FormButton } from "~/components/form-button"
import { CurrencySelect } from "~/components/tiers/currency-select"
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

export const intervalLabels: Record<BillingInterval, string> = {
  [BillingInterval.Day]: "Per day",
  [BillingInterval.Week]: "Per week",
  [BillingInterval.Month]: "Per month",
  [BillingInterval.Year]: "Per year",
}

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

  const currencyLabel = form.watch("currency")?.toUpperCase()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cx("grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2", className)}
        noValidate
        {...props}
      >
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Interval</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(BillingInterval).map(value => (
                      <SelectItem key={value} value={value}>
                        {intervalLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amountWhole"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel className="text-xs">
                Price{currencyLabel ? ` (${currencyLabel})` : ""}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="19"
                  onChange={e => onChange?.(Number.parseInt(e.target.value, 10))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Currency</FormLabel>
              <FormControl>
                <CurrencySelect value={field.value} onValueChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormButton size="sm" isPending={createPrice.isPending}>
          Add
        </FormButton>
      </form>
    </Form>
  )
}
