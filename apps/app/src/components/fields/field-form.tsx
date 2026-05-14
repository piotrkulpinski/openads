import { FieldType } from "@openads/db/client"
import { type FieldSchema, fieldSchema } from "@openads/db/schema"
import type { AppRouter } from "@openads/trpc/router"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { Switch } from "@openads/ui/switch"
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

type FieldFormProps = HTMLAttributes<HTMLFormElement> & {
  workspaceId: string
  field?: RouterOutputs["field"]["getAll"][number]
  nextUrl?: NavigateOptions<typeof router>
  onSuccess?: (data: RouterOutputs["field"]["create"]) => void
}

const fieldTypeLabels: Record<FieldType, string> = {
  [FieldType.Text]: "Text",
  [FieldType.Textarea]: "Long text",
  [FieldType.Url]: "URL",
  [FieldType.Number]: "Number",
  [FieldType.Switch]: "Switch",
  [FieldType.Image]: "Image",
}

// FieldTypes that don't accept a default value or placeholder (e.g. Switch).
const NO_DEFAULT: FieldType[] = [FieldType.Switch]
const NO_PLACEHOLDER: FieldType[] = [FieldType.Switch, FieldType.Image]

export const FieldForm = ({
  children,
  className,
  workspaceId,
  field,
  nextUrl,
  onSuccess: onSuccessCallback,
  ...props
}: FieldFormProps) => {
  const utils = trpc.useUtils()
  const navigate = useNavigate()
  const handleError = useMutationErrorHandler()
  const isEditing = !!field?.id

  const form = useZodForm(fieldSchema, {
    defaultValues: {
      ...init(fieldSchema),
      ...field,
    },
  })

  const onSuccess = async (data: RouterOutputs["field"]["create"]) => {
    if (nextUrl) navigate(nextUrl)

    toast.success(`Field ${isEditing ? "updated" : "created"} successfully`)

    await utils.field.getAll.invalidate({ workspaceId })
    form.reset({}, { keepValues: true })
    onSuccessCallback?.(data)
  }

  const onError = (error: TRPCClientErrorLike<AppRouter>) => {
    handleError({ error, form })
  }

  const createField = trpc.field.create.useMutation({ onSuccess, onError })
  const updateField = trpc.field.update.useMutation({ onSuccess, onError })
  const isPending = createField.isPending || updateField.isPending

  const onSubmit = (data: FieldSchema) => {
    if (isEditing) {
      return updateField.mutate({ ...data, id: field.id, workspaceId })
    }
    return createField.mutate({ ...data, workspaceId })
  }

  const currentType = form.watch("type") ?? FieldType.Text

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
                  placeholder="Tagline"
                  autoCapitalize="none"
                  autoComplete="off"
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(FieldType).map(type => (
                      <SelectItem key={type} value={type}>
                        {fieldTypeLabels[type]}
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

        {!NO_DEFAULT.includes(currentType) && (
          <FormField
            control={form.control}
            name="default"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default value</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!NO_PLACEHOLDER.includes(currentType) && (
          <FormField
            control={form.control}
            name="placeholder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placeholder</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="isRequired"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem direction="row" className="col-span-full w-full">
              <FormLabel>Required</FormLabel>
              <FormControl>
                <Switch
                  checked={!!value}
                  onCheckedChange={onChange}
                  className="ml-auto"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter className="col-span-full mt-2">
          <FormButton isPending={isPending}>{isEditing ? "Update" : "Create"} Field</FormButton>
          {children}
        </DialogFooter>
      </form>
    </Form>
  )
}
