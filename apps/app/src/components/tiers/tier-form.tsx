import { BillingInterval } from "@openads/db/client"
import { tierSchema } from "@openads/db/schema"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Label } from "@openads/ui/label"
import { Stack } from "@openads/ui/stack"
import { Textarea } from "@openads/ui/textarea"
import { useMutation } from "@tanstack/react-query"
import { type NavigateOptions, useNavigate } from "@tanstack/react-router"
import { PlusIcon, TrashIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useFieldArray } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { init } from "zod-empty"
import { FormButton } from "~/components/form-button"
import { TierPriceFields } from "~/components/tiers/tier-price-fields"
import { tierPriceFormSchema } from "~/components/tiers/tier-price-form"
import { WeightInfoDialog } from "~/components/tiers/weight-info-dialog"
import { useZodForm } from "~/hooks/use-zod-form"
import { wholeToCents } from "~/lib/currency"
import { handleMutationError } from "~/lib/handle-mutation-error"
import { orpc, queryClient, type RouterOutputs } from "~/lib/orpc"

const tierFormSchema = tierSchema.extend({
  initialPrices: z.array(tierPriceFormSchema).default([]),
})

type TierFormValues = z.infer<typeof tierFormSchema>

const MAX_FEATURES = 15

type TierFormProps = HTMLAttributes<HTMLFormElement> & {
  workspaceId: string
  tier?: RouterOutputs["tier"]["getAll"][number]
  nextUrl?: NavigateOptions
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
  const navigate = useNavigate()
  const isEditing = !!tier?.id

  const form = useZodForm(tierFormSchema, {
    defaultValues: {
      ...init(tierFormSchema),
      // 1.0 means "served at parity with other tiers".
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

  const features = form.watch("features") ?? []

  const appendFeature = () => {
    form.setValue("features", [...features, ""], { shouldDirty: true })
  }

  const removeFeature = (index: number) => {
    form.setValue(
      "features",
      features.filter((_, i) => i !== index),
      { shouldDirty: true },
    )
  }

  const afterSuccess = async () => {
    if (nextUrl) navigate(nextUrl)
    toast.success(`Tier ${isEditing ? "updated" : "created"} successfully`)
    await queryClient.invalidateQueries({
      queryKey: orpc.tier.getAll.key({ input: { workspaceId } }),
    })
    if (tier?.id) {
      await queryClient.invalidateQueries({
        queryKey: orpc.tier.getById.key({ input: { id: tier.id, workspaceId } }),
      })
    }
    form.reset({}, { keepValues: true })
  }

  const onError = (error: unknown) => {
    handleMutationError({ error, form })
  }

  const createTier = useMutation(
    orpc.tier.create.mutationOptions({
      onSuccess: async data => {
        await afterSuccess()
        onSuccessCallback?.(data)
      },
      onError,
    }),
  )
  const updateTier = useMutation(
    orpc.tier.update.mutationOptions({
      onSuccess: async () => {
        await afterSuccess()
      },
      onError,
    }),
  )
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
                  onChange={e => onChange(Number.parseFloat(e.target.value))}
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
                  onChange={e => onChange(Number.parseInt(e.target.value, 10))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-full grid gap-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">Features</Label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<PlusIcon />}
              disabled={features.length >= MAX_FEATURES}
              onClick={appendFeature}
            >
              Add feature
            </Button>
          </div>

          <p className="text-muted-foreground text-xs">
            Start with <code>✓</code> for a positive feature, <code>•</code> for a neutral one, or{" "}
            <code>✗</code> for a negative one. No prefix renders as neutral.
          </p>

          {features.length > 0 && (
            <div className="grid gap-2">
              {features.map((_, index) => (
                <FormField
                  // Index keys are fine here: the feature list is never reordered.
                  key={index}
                  control={form.control}
                  name={`features.${index}`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <div className="grid w-full grid-cols-[1fr_auto] items-start gap-2">
                        <FormControl>
                          <Input placeholder="✓ Sidebar slot on every page" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          prefix={<TrashIcon />}
                          onClick={() => removeFeature(index)}
                          aria-label="Remove feature"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="col-span-full grid gap-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Pricing</Label>
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
                <TierPriceFields
                  control={form.control}
                  names={{
                    interval: `initialPrices.${index}.interval`,
                    amountWhole: `initialPrices.${index}.amountWhole`,
                    currency: `initialPrices.${index}.currency`,
                  }}
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
