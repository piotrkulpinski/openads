import { BillingInterval } from "@openads/db/client"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@openads/ui/form"
import { Input } from "@openads/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@openads/ui/select"
import { type Control, type FieldValues, type Path, useWatch } from "react-hook-form"
import { CurrencySelect } from "~/components/tiers/currency-select"

export const intervalLabels: Record<BillingInterval, string> = {
  [BillingInterval.Day]: "Per day",
  [BillingInterval.Week]: "Per week",
  [BillingInterval.Month]: "Per month",
  [BillingInterval.Year]: "Per year",
}

type TierPriceFieldsProps<T extends FieldValues> = {
  control: Control<T>
  // Field paths differ per form (top-level vs `initialPrices.${index}.*`),
  // so callers map their own paths onto the shared fieldset.
  names: {
    interval: Path<T>
    amountWhole: Path<T>
    currency: Path<T>
  }
}

/**
 * The interval/amount/currency fieldset shared by TierPriceForm and TierForm's
 * initial-price rows. Renders only the three FormFields — grid wrappers and
 * add/remove buttons stay at the call sites.
 */
export const TierPriceFields = <T extends FieldValues>({
  control,
  names,
}: TierPriceFieldsProps<T>) => {
  const currency = useWatch({ control, name: names.currency }) as string | undefined
  const currencyLabel = currency?.toUpperCase()

  return (
    <>
      <FormField
        control={control}
        name={names.interval}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Interval</FormLabel>
            <FormControl>
              <Select value={field.value as string} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BillingInterval).map(value => (
                    <SelectItem key={value} value={value}>
                      {intervalLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={names.amountWhole}
        render={({ field: { value, onChange, ...field } }) => (
          <FormItem>
            <FormLabel className="text-xs">
              Price{currencyLabel ? ` (${currencyLabel})` : ""}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                placeholder="19"
                value={value as number}
                onChange={e => onChange(Number.parseInt(e.target.value, 10))}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={names.currency}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Currency</FormLabel>
            <FormControl>
              <CurrencySelect value={field.value as string} onValueChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
