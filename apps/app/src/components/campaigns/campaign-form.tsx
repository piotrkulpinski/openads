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
import { Link, useNavigate } from "@tanstack/react-router"
import type { TRPCClientErrorLike } from "@trpc/client"
import { format } from "date-fns"
import { CalendarIcon, InfoIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { toast } from "sonner"
import { init } from "zod-empty"
import { FormButton } from "~/components/form-button"
import { Callout, CalloutText } from "~/components/ui/callout"
import { useWorkspace } from "~/contexts/workspace-context"
import { useMutationErrorHandler } from "~/hooks/use-mutation-error-handler"
import { useZodForm } from "~/hooks/use-zod-form"
import type { RouterOutputs } from "~/lib/trpc"
import { trpc } from "~/lib/trpc"
import type { router } from "~/main"

type CampaignFormProps = HTMLAttributes<HTMLFormElement> & {
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
  campaign,
  nextUrl,
  onSuccess: onSuccessCallback,
  ...props
}: CampaignFormProps) => {
  const utils = trpc.useUtils()
  const workspace = useWorkspace()
  const navigate = useNavigate()
  const handleError = useMutationErrorHandler()
  const isEditing = !!campaign?.id

  const { data: zones, isFetched: isZonesFetched } = trpc.zone.getAll.useQuery(
    { workspaceId: workspace.id },
    { initialData: [] },
  )

  const hasZones = zones.length > 0
  const canSubmit = isEditing || hasZones

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
    await utils.campaign.getAll.invalidate({ workspaceId: workspace.id })
    await utils.campaign.getById.invalidate({ id: campaign?.id, workspaceId: workspace.id })

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
    if (!canSubmit) {
      if (!isZonesFetched) {
        toast.error("Create an ad zone before creating a campaign.")
      }

      return
    }

    if (isEditing) {
      return updateCampaign.mutate({ ...data, id: campaign.id, workspaceId: workspace.id })
    }

    return createCampaign.mutate({ ...data, workspaceId: workspace.id })
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
          {!isEditing && isZonesFetched && !hasZones && (
            <Callout variant="warning" prefix={<InfoIcon />}>
              <CalloutText>
                Create an ad zone before scheduling campaigns. You can{" "}
                <Link to="/$workspace/zones/new" params={{ workspace: workspace.slug }}>
                  create your first zone
                </Link>
                .
              </CalloutText>
            </Callout>
          )}

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

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!hasZones}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={hasZones ? "Select a zone" : "No ad zones available"}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {zones.map(zone => (
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

            <FormButton isPending={isPending} disabled={!canSubmit}>
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
