import { cva, cx, type VariantProps } from "@openads/ui/cva"
import { Slot } from "radix-ui"
import { type ComponentProps, type HTMLAttributes, isValidElement } from "react"

const sectionVariants = cva({
  base: "@container/section flex flex-col gap-6 md:gap-8",
})

type SectionProps = ComponentProps<"div"> &
  VariantProps<typeof sectionVariants> & {
    /**
     * If set to `true`, the button will be rendered as a child within the component.
     * This child component must be a valid React component.
     */
    asChild?: boolean
  }

const Section = ({ className, asChild = false, ...props }: SectionProps) => {
  const useAsChild = asChild && isValidElement(props.children)
  const Component = useAsChild ? Slot.Root : "section"

  return <Component className={cx(sectionVariants({ className }))} {...props} />
}

export { Section, sectionVariants }
