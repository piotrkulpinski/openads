import { cva, cx, type VariantProps } from "@openads/ui/cva"
import type { HTMLAttributes } from "react"

const headingVariants = cva({
  base: "font-semibold tracking-tight text-balance",

  variants: {
    size: {
      h1: "text-[clamp(2rem,6vw+1rem,3.75rem)]/[1.05]",
      h2: "text-[clamp(1.75rem,5vw+0.5rem,2.25rem)]/tight",
      h3: "text-xl/snug",
    },
  },

  defaultVariants: {
    size: "h2",
  },
})

export type HeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, "size"> &
  VariantProps<typeof headingVariants>

export const Heading = ({ className, size = "h2", ...props }: HeadingProps) => {
  const Comp = size ?? "h2"
  return <Comp className={cx(headingVariants({ size, className }))} {...props} />
}

export const H1 = (props: HeadingProps) => <Heading size="h1" {...props} />
export const H2 = (props: HeadingProps) => <Heading size="h2" {...props} />
export const H3 = (props: HeadingProps) => <Heading size="h3" {...props} />
