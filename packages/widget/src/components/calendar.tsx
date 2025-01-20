import type { RouterOutputs } from "@openads/api/trpc"
import { format } from "date-fns"
import { useState } from "react"

interface CalendarProps {
  spot: RouterOutputs["spot"]["getAll"][number]
  onSelect: (dates: { from: Date; to: Date }) => void
}

export const Calendar = ({ spot, onSelect }: CalendarProps) => {
  const [selectedDates, setSelectedDates] = useState<{ from?: Date; to?: Date }>({})

  const handleDateClick = (date: Date) => {
    setSelectedDates(prev => {
      if (!prev.from) {
        return { from: date }
      }

      if (!prev.to && date > prev.from) {
        const newDates = { from: prev.from, to: date }
        onSelect(newDates)
        return {}
      }

      return { from: date }
    })
  }

  const renderCalendar = () => {
    const today = new Date()
    const days: Date[] = []

    // Generate next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      days.push(date)
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-sm font-medium py-1">
            {day}
          </div>
        ))}
        {days.map(date => {
          const isSelected =
            selectedDates.from &&
            (!selectedDates.to
              ? date.getTime() === selectedDates.from.getTime()
              : date >= selectedDates.from && date <= selectedDates.to)

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleDateClick(date)}
              className={`
                p-2 text-sm rounded-lg
                ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100"}
              `}
            >
              {format(date, "d")}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mt-4">
      {renderCalendar()}
      {selectedDates.from && !selectedDates.to && (
        <p className="mt-2 text-sm text-gray-500">Select end date</p>
      )}
    </div>
  )
}
