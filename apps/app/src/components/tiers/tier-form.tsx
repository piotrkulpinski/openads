import { BillingInterval } from "@openads/db/client"
import { tierPriceSchema, tierSchema } from "@openads/db/schema"
import type { AppRouter } from "@openads/trpc/router"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { Stack } from "@openads/ui/stack"
import { Textarea } from "@openads/ui/textarea"
import { type NavigateOptions, useNavigate } from "@tanstack/react-router"
import type { TRPCClientErrorLike } from "@trpc/client"
import { PlusIcon, TrashIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useFieldArray } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { init } from "zod-empty"
import { FormButton } from "~/components/form-button"
import { CurrencySelect } from "~/components/tiers/currency-select"
import { WeightInfoDialog } from "~/components/tiers/weight-info-dialog"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { useZodForm } from "~/hooks/use-zod-form"
import { wholeToCents } from "~/lib/currency"
import type { RouterOutputs } from "~/lib/trpc"
import { trpc } from "~/lib/trpc"
import type { router } from "~/main"

// In-form representation of an initial price row. The visible field is `amountWhole`
// (integer whole units); we convert to cents at submit time so the wire / DB / Stripe
// see cents — see plan file `i-want-to-go-sunny-knuth.md`.
const initialPriceFormSchema = z.object({
  interval: z.enum(BillingInterval).default(BillingInterval.Month),
  intervalCount: z.number().int().positive().default(1),
  amountWhole: z.number().int().nonnegative(),
  currency: tierPriceSchema.shape.currency,
})

const tierFormSchema = tierSchema.extend({
  initialPrices: z.array(initialPriceFormSchema).default([]),
})

type TierFormValues = z.infer<typeof tierFormSchema>

const intervalLabels: Record<BillingInterval, string> = {
  [BillingInterval.Day]: "Per day",
  [BillingInterval.Week]: "Per week",
  [BillingInterval.Month]: "Per month",
  [BillingInterval.Year]: "Per year",
}

type TierFormProps = HTMLAttributes<HTMLFormElement> & {
  workspaceId: string
  tier?: RouterOutputs["tier"]["getAll"][number]
  nextUrl?: NavigateOptions<typeof router>
  onSuccess?: (data: RouterOutputs["tier"]["create"]) => void
}

export const TierForm = ({
  children,
  className,
  workspaceId,
  tier,
  nextUrl,
  onSuccess: onSuccessCallback,
  ...props
}: TierFormProps) => {
  const utils = trpc.useUtils()
  const navigate = useNavigate()
  const handleError = useMutationErrorHandler()
  const isEditing = !!tier?.id

  const form = useZodForm(tierFormSchema, {
    defaultValues: {
      ...init(tierFormSchema),
      // Sensible weight baseline: 1.0 means "served at parity with other tiers".
      weight: 1,
      ...tier,
      initialPrices: isEditing
        ? []
        : [
            {
              interval: BillingInterval.Month,
              intervalCount: 1,
              amountWhole: 0,
              currency: "usd",
            },
          ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "initialPrices",
  })

  const afterSuccess = async () => {
    if (nextUrl) navigate(nextUrl)
    toast.success(`Tier ${isEditing ? "updated" : "created"} successfully`)
    await utils.tier.getAll.invalidate({ workspaceId })
    if (tier?.id) await utils.tier.getById.invalidate({ id: tier.id, workspaceId })
    form.reset({}, { keepValues: true })
  }

  const onError = (error: TRPCClientErrorLike<AppRouter>) => {
    handleError({ error, form })
  }

  const createTier = trpc.tier.create.useMutation({
    onSuccess: async data => {
      await afterSuccess()
      onSuccessCallback?.(data)
    },
    onError,
  })
  const updateTier = trpc.tier.update.useMutation({
    onSuccess: async () => {
      await afterSuccess()
    },
    onError,
  })
  const isPending = createTier.isPending || updateTier.isPending

  const onSubmit = (data: TierFormValues) => {
    const { initialPrices, ...basics } = data

    if (isEditing) {
      return updateTier.mutate({ ...basics, id: tier.id, workspaceId })
    }

    return createTier.mutate({
      ...basics,
      workspaceId,
      initialPrices: initialPrices.map(({ amountWhole, ...rest }) => ({
        ...rest,
        amount: wholeToCents(amountWhole),
      })),
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cx("grid gap-4 sm:grid-cols-2", className)}
        noValidate
        {...props}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Silver"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  data-1p-ignore
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What advertisers get for this tier." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <Stack size="xs" className="w-full">
                <FormLabel>Weight</FormLabel>
                <WeightInfoDialog />
              </Stack>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  min={0.1}
                  placeholder="1.0"
                  onChange={e => onChange?.(Number.parseFloat(e.target.value))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Display order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  onChange={e => onChange?.(Number.parseInt(e.target.value, 10))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <div className="col-span-full grid gap-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <FormLabel className="text-base">Pricing</FormLabel>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                prefix={<PlusIcon />}
                onClick={() =>
                  append({
                    interval: BillingInterval.Month,
                    intervalCount: 1,
                    amountWhole: 0,
                    currency: "usd",
                  })
                }
              >
                Add interval
              </Button>
            </div>

            {fields.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded-md border p-3"
              >
                <FormField
                  control={form.control}
                  name={`initialPrices.${index}.interval`}
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
                  name={`initialPrices.${index}.amountWhole`}
                  render={({ field: { onChange, ...field } }) => {
                    const currency = form.watch(`initialPrices.${index}.currency`)?.toUpperCase()
                    return (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Price{currency ? ` (${currency})` : ""}
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
                    )
                  }}
                />

                <FormField
                  control={form.control}
                  name={`initialPrices.${index}.currency`}
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

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  prefix={<TrashIcon />}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  aria-label="Remove price"
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="col-span-full mt-2">
          <FormButton isPending={isPending}>{isEditing ? "Update" : "Create"} Tier</FormButton>
          {children}
        </DialogFooter>
      </form>
    </Form>
  )
}
