import { LoaderIcon } from "lucide-react"
import { Slot } from "radix-ui"
import type { ComponentProps, ReactNode } from "react"
import { Children, isValidElement } from "react"
import { cva, cx, type VariantProps } from "../lib/cva"
import { boxVariants } from "./box"
import { Slottable } from "./slottable"

const buttonVariants = cva({
  base: [
    "group/button inline-flex items-center justify-center border-transparent! font-medium text-[0.8125rem]/tight text-start rounded-md overflow-clip hover:z-10 hover:border-transparent",
    "disabled:opacity-60 disabled:pointer-events-none",
  ],

  variants: {
    variant: {
      fancy: "bg-primary text-primary-foreground hover:opacity-90",
      primary: "text-background bg-foreground hover:opacity-90",
      secondary:
        "border-border! bg-background text-secondary-foreground hover:bg-card hover:border-ring!",
      soft: "bg-muted text-secondary-foreground hover:bg-muted/75 hover:text-foreground hover:outline-none",
      ghost: "text-secondary-foreground hover:bg-muted hover:text-foreground hover:outline-none",
      destructive: "bg-destructive text-white hover:bg-destructive/90",
    },
    size: {
      sm: "px-2 py-1.5 gap-[0.66ch]",
      md: "px-3 py-2 gap-[0.75ch]",
      lg: "px-4 py-2.5 gap-[1ch] rounded-lg sm:text-sm/tight",
    },
    isPending: {
      true: "[&>*:not(.animate-spin)]:text-transparent select-none",
    },
  },

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

const buttonAffixVariants = cva({
  base: "shrink-0 first:-ml-[0.21425em] last:-mr-[0.21425em] [svg]:my-[0.077em] [svg]:size-[1.1em] [svg]:opacity-75",
})

export type ButtonProps = Omit<ComponentProps<"button">, "size" | "prefix"> &
  VariantProps<typeof buttonVariants> &
  VariantProps<typeof boxVariants> & {
    /**
     * If set to `true`, the button will be rendered as a child within the component.
     * This child component must be a valid React component.
     */
    asChild?: boolean

    /**
     * If set to `true`, the button will be rendered in the pending state.
     */
    isPending?: boolean

    /**
     * The slot to be rendered before the label.
     */
    prefix?: ReactNode

    /**
     * The slot to be rendered after the label.
     */
    suffix?: ReactNode
  }

const Button = ({
  children,
  className,
  disabled,
  asChild,
  isPending,
  prefix,
  suffix,
  variant,
  size,
  hover = true,
  focus = true,
  ...props
}: ButtonProps) => {
  const useAsChild = asChild && isValidElement(children)
  const Comp = useAsChild ? Slot.Root : "button"

  return (
    <Comp
      disabled={disabled ?? isPending}
      className={cx(
        boxVariants({ hover, focus }),
        buttonVariants({ variant, size, isPending, className }),
      )}
      {...props}
    >
      <Slottable child={children} asChild={asChild}>
        {child => (
          <>
            <Slot.Root className={buttonAffixVariants()}>{prefix}</Slot.Root>

            {Children.count(child) > 0 && (
              <Slot.Root className="flex-1 truncate only:text-center has-[div]:contents">
                {isValidElement(child) ? child : <span>{child}</span>}
              </Slot.Root>
            )}

            <Slot.Root className={buttonAffixVariants()}>{suffix}</Slot.Root>

            {!!isPending && <LoaderIcon className="absolute size-[1.25em] animate-spin" />}
          </>
        )}
      </Slottable>
    </Comp>
  )
}

export { Button, buttonVariants }
