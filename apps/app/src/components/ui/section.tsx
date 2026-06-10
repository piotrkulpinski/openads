import { cva, cx, type VariantProps } from "@openads/ui/cva"
import { Slot } from "radix-ui"
import { type ComponentProps, isValidElement } from "react"

const sectionVariants = cva({
  base: "flex flex-col gap-6 md:gap-8",
})

type SectionProps = ComponentProps<"div"> &
  VariantProps<typeof sectionVariants> & {
    /**
     * If set to `true`, the section will be rendered as its child element via Slot.
     * This child must be a valid React element.
     */
    asChild?: boolean
  }

const Section = ({ className, asChild = false, ...props }: SectionProps) => {
  const useAsChild = asChild && isValidElement(props.children)
  const Component = useAsChild ? Slot.Root : "section"

  return <Component className={cx(sectionVariants({ className }))} {...props} />
}

export { Section, sectionVariants }
