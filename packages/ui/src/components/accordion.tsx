"use client"

import { ChevronDownIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Accordion = ({ ...props }: ComponentProps<typeof AccordionPrimitive.Root>) => {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

const AccordionItem = ({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) => {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cx("border-b", className)}
      {...props}
    />
  )
}

const AccordionTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) => {
  return (
    <AccordionPrimitive.Header className="flex w-full">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cx(
          "flex flex-1 items-start justify-between gap-4 rounded-md p-4 m-1 text-left text-sm font-medium transition-all hover:bg-muted [&[data-state=open]>svg]:rotate-180 sm:text-base",
          "outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 sm:size-5" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

const AccordionContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) => {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden w-full border-t text-sm text-pretty"
      {...props}
    >
      <div className={cx("p-5", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
