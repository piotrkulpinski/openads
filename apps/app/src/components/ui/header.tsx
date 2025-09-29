import { cva, cx, type VariantProps } from "@openads/ui/cva"
import { Stack } from "@openads/ui/stack"
import { Slot } from "radix-ui"
import { type ComponentProps, isValidElement } from "react"
import { Heading, type HeadingProps } from "~/components/ui/heading"
import { Prose } from "~/components/ui/prose"

const headerVariants = cva({
  base: "@container/header flex flex-wrap items-center w-full min-w-0",

  variants: {
    alignment: {
      left: "justify-between text-start",
      center: "justify-center text-center",
      right: "justify-end text-end",
    },
    gap: {
      sm: "gap-y-2 gap-x-6",
      lg: "gap-y-3 gap-x-6 lg:gap-x-12",
    },
    separated: {
      true: "my-6 md:mt-8 first:mt-0 last:mb-0 only:m-0",
    },
    sticky: {
      true: "lg:sticky lg:top-16 lg:z-10",
    },
  },

  defaultVariants: {
    alignment: "left",
    gap: "lg",
    separated: false,
    sticky: false,
  },
})

type HeaderProps = ComponentProps<"div"> &
  VariantProps<typeof headerVariants> & {
    /**
     * If set to `true`, the button will be rendered as a child within the component.
     * This child component must be a valid React component.
     */
    asChild?: boolean
  }

const Header = ({
  className,
  alignment = "left",
  gap,
  separated,
  sticky,
  asChild,
  ...props
}: HeaderProps) => {
  const useAsChild = asChild && isValidElement(props.children)
  const Component = useAsChild ? Slot.Root : "div"

  return (
    <Component
      className={cx(headerVariants({ alignment, gap, separated, sticky, className }))}
      {...props}
    />
  )
}

const HeaderTitle = ({ size = "h3", ...props }: HeadingProps) => {
  return <Heading size={size} {...props} />
}

const HeaderDescription = ({ ...props }: ComponentProps<typeof Prose>) => {
  return (
    <div className="w-full">
      <Prose {...props} />
    </div>
  )
}

const HeaderActions = ({ className, ...props }: ComponentProps<typeof Stack>) => {
  return <Stack className={cx("-my-0.5", className)} {...props} />
}

export { Header, HeaderTitle, HeaderDescription, HeaderActions }
