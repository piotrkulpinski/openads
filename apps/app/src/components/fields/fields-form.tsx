import { useDebouncedCallback } from "@mantine/hooks"
import { FieldType } from "@openads/db/client"
import { fieldSchema } from "@openads/db/schema"
import { cx } from "@openads/ui/cva"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Switch } from "@openads/ui/switch"
import type { ComponentProps, HTMLAttributes } from "react"
import { useEffect } from "react"
import { init } from "zod-empty"
import { useFields } from "~/contexts/fields-context"
import { useZodForm } from "~/hooks/use-zod-form"
import type { RouterOutputs } from "~/lib/trpc"

type FieldsFormProps = ComponentProps<"div"> & {
  field: RouterOutputs["field"]["getAll"][number]
  index: number
}

export const FieldsForm = ({ className, field, ...props }: FieldsFormProps) => {
  const { onUpdateField } = useFields()
  const debouncedUpdate = useDebouncedCallback(onUpdateField, 250)

  const form = useZodForm(fieldSchema, {
    defaultValues: {
      ...init(fieldSchema),
      ...field,
    },
  })

  const excludeDefaultFor: FieldType[] = [FieldType.Switch]
  const excludePlaceholderFor: FieldType[] = [FieldType.Switch]

  useEffect(() => {
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => debouncedUpdate(values),
    })
  }, [form, debouncedUpdate])

  return (
    <Form {...form}>
      <form className={cx("grid gap-4 content-start sm:grid-cols-2", className)} {...props}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  // autoFocus={field.type === field.name}
                  data-1p-ignore
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {!excludeDefaultFor.includes(field.type) && (
          <FormField
            control={form.control}
            name="default"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Value</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!excludePlaceholderFor.includes(field.type) && (
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>This field is required</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
