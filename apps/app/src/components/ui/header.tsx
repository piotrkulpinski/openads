import { cva, cx, type VariantProps } from "@openads/ui/cva"
import { Slot } from "radix-ui"
import { type ComponentProps, type HTMLAttributes, isValidElement, type ReactNode } from "react"
import { Heading, type HeadingProps } from "~/components/ui/heading"
import { Prose } from "~/components/ui/prose"
import { Stack } from "~/components/ui/stack"

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

const headerDescriptionVariants = cva({
  base: "w-full",
})

type HeaderRootProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof headerVariants> & {
    /**
     * If set to `true`, the button will be rendered as a child within the component.
     * This child component must be a valid React component.
     */
    asChild?: boolean
  }

export type HeaderProps = Omit<HeaderRootProps & HeadingProps, "title"> & {
  /**
   * Represents the title displayed on the Header.
   */
  title?: ReactNode

  /**
   * Represents the description displayed on the Header.
   */
  description?: string
}

const HeaderRoot = ({
  className,
  alignment = "left",
  gap,
  separated,
  sticky,
  asChild = false,
  ...props
}: HeaderRootProps) => {
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

const HeaderDescription = ({
  className,
  ...props
}: ComponentProps<typeof Prose> & VariantProps<typeof headerDescriptionVariants>) => {
  return (
    <div className="w-full">
      <Prose className={cx(headerDescriptionVariants({ className }))} {...props} />
    </div>
  )
}

const HeaderBase = ({
  children,
  title,
  description,
  size = "h3",
  alignment = "left",
  gap = "lg",
  separated = false,
  ...props
}: HeaderProps) => {
  return (
    <HeaderRoot alignment={alignment} gap={gap} separated={separated} {...props}>
      {title && <HeaderTitle size={size}>{title}</HeaderTitle>}
      {children && <Stack>{children}</Stack>}
      {description && <HeaderDescription>{description}</HeaderDescription>}
    </HeaderRoot>
  )
}

const Header = Object.assign(HeaderBase, {
  Root: HeaderRoot,
  Title: HeaderTitle,
  Description: HeaderDescription,
})

export { HeaderRoot, HeaderTitle, HeaderDescription, Header }
