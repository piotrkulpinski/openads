import { zodResolver } from "@hookform/resolvers/zod"
import { type FieldValues, type UseFormProps, useForm } from "react-hook-form"
import type { z } from "zod"

export const useZodForm = <T extends z.ZodType<FieldValues, FieldValues>, TContext>(
  schema: T,
  props?: Omit<UseFormProps<z.input<T>, TContext, z.output<T>>, "resolver">,
) => {
  return useForm({
    resolver: zodResolver(schema),
    ...props,
  })
}
