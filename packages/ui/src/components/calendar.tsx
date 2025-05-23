"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { DayPicker } from "react-day-picker"
import { buttonVariants } from "./button"

const Calendar = ({ classNames, ...props }: ComponentProps<typeof DayPicker>) => {
  const buttonClasses = buttonVariants({
    variant: "ghost",
    className: "text-xs p-1 pointer-events-auto",
  })

  return (
    <DayPicker
      weekStartsOn={1}
      classNames={{
        months: "relative flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 sm:gap-y-0",
        month: "group/month space-y-4 w-full",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 z-10 flex items-center justify-between gap-x-1 pointer-events-none",
        button_previous: buttonClasses,
        button_next: buttonClasses,
        month_grid: "w-full border-collapse gap-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground/50 rounded-md min-w-8 w-full font-normal text-xs",
        week: "group/week flex mt-2",
        day: "group/day relative w-full text-center text-[0.8125rem]/none rounded-md focus-within:z-20",
        day_button:
          "relative w-full p-1.5 cursor-pointer rounded-md hover:bg-muted group-data-[selected]/day:hover:bg-transparent",
        selected: "bg-primary text-primary-foreground",
        range_middle: "!bg-muted !text-foreground rounded-none",
        today:
          "font-semibold after:absolute after:inset-x-1/2 after:bottom-1 after:h-0.5 after:w-5 after:-translate-x-1/2 after:rounded-[2px] after:bg-current after:pointer-events-none",
        outside: "opacity-40",
        disabled: "opacity-40 pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className="size-4" />
          }
          return <ChevronRightIcon className="size-4" />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
