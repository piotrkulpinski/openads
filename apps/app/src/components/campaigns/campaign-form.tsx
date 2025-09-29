import { campaignSchema } from "@openads/db/schema"
import type { AppRouter } from "@openads/trpc/router"
import { Button } from "@openads/ui/button"
import { Calendar } from "@openads/ui/calendar"
import { cx } from "@openads/ui/cva"
import { DialogFooter } from "@openads/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@openads/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import type { NavigateOptions } from "@tanstack/react-router"
import { useNavigate } from "@tanstack/react-router"
import type { TRPCClientErrorLike } from "@trpc/client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { init } from "zod-empty"
import { FormButton } from "~/components/form-button"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { useZodForm } from "~/hooks/use-zod-form"
import type { RouterOutputs } from "~/lib/trpc"
import { trpc } from "~/lib/trpc"
import type { router } from "~/main"

type CampaignFormProps = HTMLAttributes<HTMLFormElement> & {
  workspaceId: string

  /**
   * The zone to edit
   */
  campaign?: RouterOutputs["campaign"]["getAll"][number]

  /**
   * Allows to redirect to a url after the mutation is successful
   */
  nextUrl?: NavigateOptions<typeof router>

  /**
   * A callback to call when the mutation is successful
   */
  onSuccess?: (data: RouterOutputs["campaign"]["create"]) => void
}

export const CampaignForm = ({
  children,
  className,
  workspaceId,
  campaign,
  nextUrl,
  onSuccess: onSuccessCallback,
  ...props
}: CampaignFormProps) => {
  const utils = trpc.useUtils()
  const navigate = useNavigate()
  const handleError = useMutationErrorHandler()
  const isEditing = !!campaign?.id

  const zonesQuery = trpc.zone.getAll.useQuery({ workspaceId })

  const form = useZodForm(campaignSchema, {
    defaultValues: {
      ...init(campaignSchema),
      ...campaign,
    },
  })

  const onSuccess = async (data: RouterOutputs["campaign"]["create"]) => {
    // If we have a nextUrl, navigate to it
    nextUrl && navigate(nextUrl)

    // Show a success toast
    toast.success(`Campaign ${isEditing ? "updated" : "created"} successfully`)

    // Invalidate the campaigns cache
    await utils.campaign.getAll.invalidate({ workspaceId })
    await utils.campaign.getById.invalidate({ id: campaign?.id, workspaceId })

    // Reset the `isDirty` state of the form while keeping the values for optimistic UI
    form.reset({}, { keepValues: true })

    // Call the callback if provided
    onSuccessCallback?.(data)
  }

  const onError = (error: TRPCClientErrorLike<AppRouter>) => {
    handleError({ error, form })
  }

  const createCampaign = trpc.campaign.create.useMutation({ onSuccess, onError })
  const updateCampaign = trpc.campaign.update.useMutation({ onSuccess, onError })
  const isPending = createCampaign.isPending || updateCampaign.isPending

  // Handle the form submission
  const handleSubmit = form.handleSubmit(data => {
    if (isEditing) {
      return updateCampaign.mutate({ ...data, id: campaign.id, workspaceId })
    }

    return createCampaign.mutate({ ...data, workspaceId })
  })

  const [startsAt, endsAt] = form.watch(["startsAt", "endsAt"])

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className={cx("grid gap-6 items-start lg:grid-cols-3", className)}
        noValidate
        {...props}
      >
        <div className="grid gap-4 col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
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
                          variant="secondary"
                          prefix={<CalendarIcon />}
                          className="w-full justify-start text-left font-normal"
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
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
                          variant="secondary"
                          prefix={<CalendarIcon />}
                          className="w-full justify-start text-left font-normal"
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
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
            name="zoneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zone</FormLabel>

                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a zone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {zonesQuery.data?.map(zone => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
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
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter amount in cents"
                    min={0}
                    onChange={e => onChange?.(Number.parseInt(e.target.value, 10))}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="mt-2 col-span-full">
            {children}

            <FormButton isPending={isPending}>
              {isEditing ? "Update" : "Create"} Campaign
            </FormButton>
          </DialogFooter>
        </div>

        <Calendar
          mode="range"
          selected={{ from: startsAt, to: endsAt }}
          onSelect={selected => {
            selected?.from && form.setValue("startsAt", selected.from)
            selected?.to && form.setValue("endsAt", selected.to)
          }}
          defaultMonth={startsAt || new Date()}
          className="border rounded-lg p-4"
        />
      </form>
    </Form>
  )
}
