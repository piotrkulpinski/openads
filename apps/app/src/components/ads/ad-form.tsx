import { cx } from "@openads/ui/cva"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Switch } from "@openads/ui/switch"
import { Textarea } from "@openads/ui/textarea"
import type { HTMLAttributes } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { FormButton } from "~/components/form-button"
import { type RouterOutputs, trpc } from "~/lib/trpc"

type CheckoutInfo = RouterOutputs["ad"]["public"]["getCheckoutInfo"]
type Field = CheckoutInfo["fields"][number]

const buildSchema = (fields: Field[]) => {
  const metaShape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    let schema: z.ZodTypeAny

    switch (field.type) {
      case "Url":
        schema = z.url()
        break
      case "Number":
        schema = z.coerce.number()
        break
      case "Switch":
        schema = z.boolean()
        break
      default:
        schema = z.string()
        break
    }

    if (!field.isRequired && field.type !== "Switch") {
      schema = schema.optional().or(z.literal(""))
    }

    if (field.isRequired && field.type !== "Switch") {
      schema = (schema as z.ZodString).min(1, { message: `${field.name} is required` })
    }

    metaShape[field.id] = schema
  }

  return z.object({
    name: z.string().trim().min(2, { message: "Name is too short" }),
    websiteUrl: z.url(),
    description: z.string().trim().max(280).optional(),
    buttonLabel: z.string().trim().max(40).optional(),
    meta: z.object(metaShape).optional().default({}),
  })
}

type AdFormProps = HTMLAttributes<HTMLFormElement> & {
  sessionId: string
  info: CheckoutInfo
  onSuccess?: () => void
}

export const AdForm = ({
  className,
  sessionId,
  info,
  onSuccess: onSuccessCallback,
  ...props
}: AdFormProps) => {
  const schema = buildSchema(info.fields)
  type FormValues = z.infer<typeof schema>

  const existing = info.existingAd
  const initialMeta = existing
    ? Object.fromEntries(existing.meta.map(m => [m.fieldId, m.value as string | number | boolean]))
    : {}

  const form = useForm<FormValues>({
    defaultValues: {
      name: existing?.name ?? "",
      websiteUrl: existing?.websiteUrl ?? "",
      description: existing?.description ?? "",
      buttonLabel: existing?.buttonLabel ?? "",
      meta: initialMeta,
    } as FormValues,
  })

  const submit = trpc.ad.public.createFromCheckout.useMutation({
    onSuccess: () => {
      toast.success("Ad submitted for review")
      onSuccessCallback?.()
    },
    onError: error => {
      toast.error(error.message)
    },
  })

  const onSubmit = (values: FormValues) => {
    const meta = Object.entries(values.meta ?? {})
      .filter(([_, v]) => v !== undefined && v !== "")
      .map(([fieldId, value]) => ({ fieldId, value }))

    submit.mutate({
      sessionId,
      name: values.name,
      websiteUrl: values.websiteUrl,
      description: values.description,
      buttonLabel: values.buttonLabel,
      meta,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cx("grid gap-4", className)}
        noValidate
        {...props}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product / brand name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Co." autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://acme.co" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="One sentence about what you offer."
                  maxLength={280}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buttonLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CTA button label (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Learn more" maxLength={40} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {info.fields.length > 0 && (
          <div className="grid gap-4 border-t pt-4">
            <p className="font-medium text-sm">Additional details</p>
            {info.fields.map(field => (
              <FormField
                key={field.id}
                control={form.control}
                name={`meta.${field.id}` as `meta.${string}`}
                render={({ field: input }) => (
                  <FormItem>
                    <FormLabel>
                      {field.name}
                      {field.isRequired && <span className="ml-1 text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>{renderMetaInput(field, input)}</FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        )}

        <FormButton isPending={submit.isPending} className="mt-2">
          Submit for review
        </FormButton>
      </form>
    </Form>
  )
}

function renderMetaInput(
  field: Field,
  input: { value: unknown; onChange: (value: unknown) => void; onBlur: () => void; name: string },
) {
  const placeholder = field.placeholder || undefined

  if (field.type === "Textarea") {
    return (
      <Textarea
        name={input.name}
        placeholder={placeholder}
        value={(input.value as string) ?? ""}
        onChange={input.onChange}
        onBlur={input.onBlur}
      />
    )
  }
  if (field.type === "Switch") {
    return <Switch checked={!!input.value} onCheckedChange={input.onChange} />
  }

  const type = field.type === "Number" ? "number" : field.type === "Url" ? "url" : "text"
  return (
    <Input
      type={type}
      name={input.name}
      placeholder={placeholder}
      value={(input.value as string | number | undefined) ?? ""}
      onChange={input.onChange}
      onBlur={input.onBlur}
    />
  )
}
