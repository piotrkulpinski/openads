import { LoaderIcon } from "lucide-react"
import { Slot } from "radix-ui"
import { Children, type ComponentProps, type ReactNode, isValidElement } from "react"
import { type VariantProps, cva, cx } from "../lib/cva"
import { Slottable } from "./slottable"

const buttonVariants = cva({
  base: "group/button relative shrink-0 min-w-0 inline-flex items-center justify-center border rounded-md text-sm leading-none font-medium focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",

  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border-input bg-background hover:bg-muted hover:text-accent-foreground",
      ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
      link: "border-transparent text-primary underline-offset-4 hover:underline",
    },

    size: {
      sm: "px-3 py-1.5 gap-[0.66ch] rounded-md text-xs leading-none",
      md: "px-4 py-2 gap-[0.75ch]",
      lg: "px-6 py-2.5 gap-[1ch] rounded-md",
    },

    isAffixOnly: {
      true: "",
    },

    isPending: {
      true: "[&>*:not(.animate-spin)]:text-transparent select-none",
    },
  },

  compoundVariants: [
    // Is affix only
    { size: "sm", isAffixOnly: true, class: "px-2" },
    { size: "md", isAffixOnly: true, class: "px-2" },
    { size: "lg", isAffixOnly: true, class: "px-2.5" },
  ],

  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

const buttonAffixVariants = cva({
  base: "shrink-0 size-[1.1em] opacity-75",
})

type ButtonProps = Omit<ComponentProps<"button">, "size" | "prefix"> &
  VariantProps<typeof buttonVariants> & {
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
  variant,
  size,
  asChild,
  isPending,
  prefix,
  suffix,
  ...props
}: ButtonProps) => {
  const useAsChild = asChild && isValidElement(children)
  const Component = useAsChild ? Slot.Root : "button"

  // Determine if the button has affix only.
  const isAffixOnly = Children.count(children) === 0 && (!prefix || !suffix)

  return (
    <Component
      className={cx(buttonVariants({ variant, size, isPending, isAffixOnly, className }))}
      {...props}
    >
      <Slottable child={children} asChild={asChild}>
        {child => (
          <>
            <Slot.Root
              className={buttonAffixVariants({ className: !isAffixOnly && "ml-[-0.5ch]" })}
              aria-hidden="true"
            >
              {prefix}
            </Slot.Root>

            {Children.count(child) !== 0 && <span className="truncate">{child}</span>}

            <Slot.Root
              className={buttonAffixVariants({ className: !isAffixOnly && "mr-[-0.5ch]" })}
              aria-hidden="true"
            >
              {suffix}
            </Slot.Root>

            {!!isPending && <LoaderIcon className="absolute size-[1.25em] animate-spin" />}
          </>
        )}
      </Slottable>
    </Component>
  )
}

export { Button, buttonVariants, type ButtonProps }
