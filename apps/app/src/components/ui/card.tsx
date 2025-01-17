import { type VariantProps, cva, cx } from "@openads/ui/cva"
import { Slot } from "@radix-ui/react-slot"
import { type ComponentProps, type HTMLAttributes, isValidElement } from "react"
import { sectionVariants } from "~/components/ui/section"

const cardVariants = cva({
  base: "relative flex flex-col bg-white border rounded-md overflow-clip hover:[&[href]]:z-10 hover:[&[href]]:border-ring",
})

const cardPanelVariants = cva({
  base: "border-t first:border-t-0",

  variants: {
    size: {
      md: "p-4 md:p-6",
      lg: "p-6 md:p-8",
    },
    theme: {
      white: "",
      gray: "bg-accent",
    },
    sticky: {
      true: "sticky z-30 first:top-0 last:bottom-0",
    },
    scrollable: {
      true: "flex-1 overflow-y-scroll overscroll-contain",
    },
  },

  defaultVariants: {
    size: "md",
    theme: "white",
    sticky: false,
    scrollable: false,
  },
})

const cardRowVariants = cva({
  base: "flex justify-between",

  variants: {
    size: {
      md: "md:py-4",
      lg: "md:py-6",
    },
    gap: {
      sm: "gap-3 md:gap-x-4",
      md: "gap-4 md:gap-x-6",
    },
    direction: {
      row: "flex-row flex-wrap items-center",
      column: "flex-col",
      rowReverse: "flex-row-reverse flex-wrap items-center",
      columnReverse: "flex-col-reverse",
    },
  },

  defaultVariants: {
    size: "md",
    gap: "md",
    direction: "row",
  },
})

export type CardProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> & {
    /**
     * If set to `true`, the button will be rendered as a child within the component.
     * This child component must be a valid React component.
     */
    asChild?: boolean
  }

const CardRoot = ({ asChild = false, className, ...props }: CardProps) => {
  const useAsChild = asChild && isValidElement(props.children)
  const Component = useAsChild ? Slot : "div"

  return <Component className={cx(cardVariants({ className }))} {...props} />
}

export type CardPanelProps = ComponentProps<"div"> &
  VariantProps<typeof cardPanelVariants> & {
    /**
     * If set to `true`, the button will be rendered as a child within the component.
     * This child component must be a valid React component.
     */
    asChild?: boolean
  }

const CardPanel = ({
  className,
  asChild,
  size,
  theme,
  sticky,
  scrollable,
  ...props
}: CardPanelProps) => {
  const useAsChild = asChild && isValidElement(props.children)
  const Component = useAsChild ? Slot : "div"

  return (
    <Component
      className={cx(cardPanelVariants({ size, theme, sticky, scrollable, className }))}
      {...props}
    />
  )
}

const CardSection = ({
  className,
  size,
  ...props
}: CardPanelProps & VariantProps<typeof sectionVariants>) => {
  return <CardPanel size={size} className={cx(sectionVariants({ className }))} {...props} />
}

const CardRow = ({
  className,
  size,
  gap,
  direction,
  theme = "gray",
  ...props
}: CardPanelProps & VariantProps<typeof cardRowVariants>) => {
  return (
    <CardPanel
      theme={theme}
      size={size}
      className={cx(cardRowVariants({ size, gap, direction, className }))}
      {...props}
    />
  )
}

const Card = Object.assign(CardRoot, {
  Panel: CardPanel,
  Section: CardSection,
  Row: CardRow,
})

export { CardRoot, CardPanel, CardSection, CardRow, Card }
