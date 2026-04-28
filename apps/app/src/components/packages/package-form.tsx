import { type PackageSchema, packageSchema } from "@openads/db/schema"
import type { AppRouter } from "@openads/trpc/router"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Switch } from "@openads/ui/switch"
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

type PackageFormProps = HTMLAttributes<HTMLFormElement> & {
  zoneId: string
  pkg?: RouterOutputs["package"]["getAll"][number]
  nextUrl?: NavigateOptions<typeof router>
  onSuccess?: (data: RouterOutputs["package"]["create"]) => void
}

export const PackageForm = ({
  children,
  className,
  zoneId,
  pkg,
  nextUrl,
  onSuccess: onSuccessCallback,
  ...props
}: PackageFormProps) => {
  const utils = trpc.useUtils()
  const navigate = useNavigate()
  const handleError = useMutationErrorHandler()
  const isEditing = !!pkg?.id

  const form = useZodForm(packageSchema, {
    defaultValues: {
      ...init(packageSchema),
      zoneId,
      ...pkg,
    },
  })

  const onSuccess = async (data: RouterOutputs["package"]["create"]) => {
    if (nextUrl) navigate(nextUrl)

    toast.success(`Package ${isEditing ? "updated" : "created"} successfully`)

    await utils.package.getAll.invalidate({ zoneId })
    if (pkg?.id) await utils.package.getById.invalidate({ id: pkg.id, zoneId })

    form.reset({}, { keepValues: true })
    onSuccessCallback?.(data)
  }

  const onError = (error: TRPCClientErrorLike<AppRouter>) => {
    handleError({ error, form })
  }

  const createPackage = trpc.package.create.useMutation({ onSuccess, onError })
  const updatePackage = trpc.package.update.useMutation({ onSuccess, onError })
  const isPending = createPackage.isPending || updatePackage.isPending

  const onSubmit = (data: PackageSchema) => {
    if (isEditing) {
      return updatePackage.mutate({ ...data, id: pkg.id, zoneId })
    }
    return createPackage.mutate({ ...data, zoneId })
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

        <FormField
          control={form.control}
          name="isActive"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem className="col-span-full flex items-center justify-between gap-4 rounded-md border px-3 py-2">
              <FormLabel>Active</FormLabel>
              <FormControl>
                <Switch checked={!!value} onCheckedChange={onChange} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter className="col-span-full mt-2">
          <FormButton isPending={isPending}>{isEditing ? "Update" : "Create"} Package</FormButton>
          {children}
        </DialogFooter>
      </form>
    </Form>
  )
}
