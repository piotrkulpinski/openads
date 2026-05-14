import { type TierSchema, tierSchema } from "@openads/db/schema"
import type { AppRouter } from "@openads/trpc/router"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Textarea } from "@openads/ui/textarea"
import { type NavigateOptions, useNavigate } from "@tanstack/react-router"
import type { TRPCClientErrorLike } from "@trpc/client"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { init } from "zod-empty"
import { FormButton } from "~/components/form-button"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { useZodForm } from "~/hooks/use-zod-form"
import type { RouterOutputs } from "~/lib/trpc"
import { trpc } from "~/lib/trpc"
import type { router } from "~/main"

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

  const form = useZodForm(tierSchema, {
    defaultValues: {
      ...init(tierSchema),
      ...tier,
    },
  })

  const onSuccess = async (data: RouterOutputs["tier"]["create"]) => {
    if (nextUrl) navigate(nextUrl)

    toast.success(`Tier ${isEditing ? "updated" : "created"} successfully`)

    await utils.tier.getAll.invalidate({ workspaceId })
    if (tier?.id) await utils.tier.getById.invalidate({ id: tier.id, workspaceId })

    form.reset({}, { keepValues: true })
    onSuccessCallback?.(data)
  }

  const onError = (error: TRPCClientErrorLike<AppRouter>) => {
    handleError({ error, form })
  }

  const createTier = trpc.tier.create.useMutation({ onSuccess, onError })
  const updateTier = trpc.tier.update.useMutation({ onSuccess, onError })
  const isPending = createTier.isPending || updateTier.isPending

  const onSubmit = (data: TierSchema) => {
    if (isEditing) {
      return updateTier.mutate({ ...data, id: tier.id, workspaceId })
    }
    return createTier.mutate({ ...data, workspaceId })
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
              <FormLabel>Weight</FormLabel>
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
          name="priceMonthly"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Price (cents / month)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="14700"
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
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="usd" autoCapitalize="none" {...field} />
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

        <DialogFooter className="col-span-full mt-2">
          <FormButton isPending={isPending}>{isEditing ? "Update" : "Create"} Tier</FormButton>
          {children}
        </DialogFooter>
      </form>
    </Form>
  )
}
