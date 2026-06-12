import { FieldType } from "@openads/db/client"
import { type FieldSchema, fieldSchema } from "@openads/db/schema"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { Switch } from "@openads/ui/switch"
import { useMutation } from "@tanstack/react-query"
import { type NavigateOptions, useNavigate } from "@tanstack/react-router"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { init } from "zod-empty"
import { FormButton } from "~/components/form-button"
import { useZodForm } from "~/hooks/use-zod-form"
import { handleMutationError } from "~/lib/handle-mutation-error"
import { orpc, queryClient, type RouterOutputs } from "~/lib/orpc"
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
  const navigate = useNavigate()
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

    await queryClient.invalidateQueries({
      queryKey: orpc.field.getAll.key({ input: { workspaceId } }),
    })
    form.reset({}, { keepValues: true })
    onSuccessCallback?.(data)
  }

  const onError = (error: unknown) => {
    handleMutationError({ error, form })
  }

  const createField = useMutation(orpc.field.create.mutationOptions({ onSuccess, onError }))
  const updateField = useMutation(orpc.field.update.mutationOptions({ onSuccess, onError }))
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
                <Select
                  value={field.value}
                  onValueChange={type => {
                    field.onChange(type)
                    // Clear inputs the new type hides so their stale values don't
                    // submit. Setting "" (not resetField) makes the partial update
                    // overwrite any previously stored value.
                    if (NO_DEFAULT.includes(type as FieldType)) form.setValue("default", "")
                    if (NO_PLACEHOLDER.includes(type as FieldType)) form.setValue("placeholder", "")
                  }}
                >
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
                  onChange={e => onChange(Number.parseInt(e.target.value, 10))}
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
            <FormItem direction="row" size="sm" className="col-span-full">
              <FormControl>
                <Switch checked={!!value} onCheckedChange={onChange} {...field} />
              </FormControl>
              <FormLabel>Required</FormLabel>
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
