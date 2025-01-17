import { type VariantProps, cva, cx } from "@openads/ui/cva"
import { isReactElement } from "@openads/ui/helpers"
import { Slot } from "@radix-ui/react-slot"
import type { HTMLAttributes } from "react"

const sectionVariants = cva({
  base: "@container/section flex flex-col gap-6 md:gap-8",
})

type SectionProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants> & {
    /**
     * If set to `true`, the button will be rendered as a child within the component.
     * This child component must be a valid React component.
     */
    asChild?: boolean
  }

const Section = ({ className, asChild = false, ...props }: SectionProps) => {
  const useAsChild = asChild && isReactElement(props.children)
  const Component = useAsChild ? Slot : "section"

  return <Component className={cx(sectionVariants({ className }))} {...props} />
}

export { Section, sectionVariants }
