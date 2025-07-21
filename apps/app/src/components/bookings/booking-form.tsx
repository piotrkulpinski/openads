import { zodResolver } from "@hookform/resolvers/zod"
import type { AppRouter } from "@openads/api/trpc"
import type { BookingSchema } from "@openads/db/schema"
import { bookingSchema } from "@openads/db/schema"
import { Button } from "@openads/ui/button"
import { Calendar } from "@openads/ui/calendar"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@openads/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import type { NavigateOptions } from "@tanstack/react-router"
import { type createRouter, useNavigate } from "@tanstack/react-router"
import type { TRPCClientErrorLike } from "@trpc/client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { FormButton } from "~/components/form-button"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import type { RouterOutputs } from "~/lib/trpc"
import { trpc } from "~/lib/trpc"

type BookingFormProps = HTMLAttributes<HTMLFormElement> & {
  workspaceId: string

  /**
   * The spot to edit
   */
  booking?: RouterOutputs["booking"]["getAll"][number]

  /**
   * Allows to redirect to a url after the mutation is successful
   */
  nextUrl?: NavigateOptions<ReturnType<typeof createRouter>>

  /**
   * A callback to call when the mutation is successful
   */
  onSuccess?: (data: RouterOutputs["booking"]["create"]) => void
}

export const BookingForm = ({
  children,
  className,
  workspaceId,
  booking,
  nextUrl,
  onSuccess: onSuccessCallback,
  ...props
}: BookingFormProps) => {
  const utils = trpc.useUtils()
  const navigate = useNavigate()
  const handleError = useMutationErrorHandler()
  const isEditing = !!booking?.id

  const spotsQuery = trpc.spot.getAll.useQuery({ workspaceId })

  const form = useForm<BookingSchema>({
    resolver: zodResolver(bookingSchema),
    values: booking,
    defaultValues: {
      startsAt: new Date(),
      endsAt: new Date(),
      amount: 0,
      currency: "usd",
      status: "pending",
      spotId: "",
    },
  })

  const onSuccess = async (data: RouterOutputs["booking"]["create"]) => {
    // If we have a nextUrl, navigate to it
    nextUrl && navigate(nextUrl)

    // Show a success toast
    toast.success(`Booking ${isEditing ? "updated" : "created"} successfully`)

    // Invalidate the bookings cache
    await utils.booking.getAll.invalidate({ workspaceId })
    await utils.booking.getById.invalidate({ id: booking?.id, workspaceId })

    // Reset the `isDirty` state of the form while keeping the values for optimistic UI
    form.reset({}, { keepValues: true })

    // Call the callback if provided
    onSuccessCallback?.(data)
  }

  const onError = (error: TRPCClientErrorLike<AppRouter>) => {
    handleError({ error, form })
  }

  const createBooking = trpc.booking.create.useMutation({ onSuccess, onError })
  const updateBooking = trpc.booking.update.useMutation({ onSuccess, onError })
  const isPending = createBooking.isPending || updateBooking.isPending

  // Handle the form submission
  const onSubmit = (data: BookingSchema) => {
    if (isEditing) {
      return updateBooking.mutate({ ...data, id: booking.id, workspaceId })
    }

    return createBooking.mutate({ ...data, workspaceId })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cx("grid gap-4", className)}
        noValidate
        {...props}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>

                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        prefix={<CalendarIcon />}
                        className="w-full justify-start text-left font-normal"
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>

                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        prefix={<CalendarIcon />}
                        className="w-full justify-start text-left font-normal"
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="spotId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spot</FormLabel>

              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a spot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {spotsQuery.data?.map(spot => (
                    <SelectItem key={spot.id} value={spot.id}>
                      {spot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>

              <FormControl>
                <Input type="number" placeholder="Enter amount in cents" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="mt-2 col-span-full">
          {children}

          <FormButton isPending={isPending}>{isEditing ? "Update" : "Create"} Booking</FormButton>
        </DialogFooter>
      </form>
    </Form>
  )
}
