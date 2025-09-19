import type { ComponentProps } from "react"
import { cx, type VariantProps } from "../lib/cva"
import { Box } from "./box"
import { inputVariants } from "./input"

type TextareaProps = Omit<ComponentProps<"textarea">, "size"> & VariantProps<typeof inputVariants>

const Textarea = ({ className, size, ...props }: TextareaProps) => {
  return (
    <Box focus>
      <textarea
        className={cx(
          inputVariants({ size, className }),
          "leading-normal! resize-none field-sizing-content",
        )}
        {...props}
      />
    </Box>
  )
}

export { Textarea }
