import { z } from "zod"
import { BillingInterval } from "../client"

// Curated list of Stripe-supported, 2-decimal currencies. All entries are settleable
// on Stripe Connect across the most common publisher countries. Zero-decimal currencies
// (JPY / KRW / VND / etc.) are intentionally excluded — `wholeToCents` and `formatPrice`
// assume ×100 / ÷100 conversion, which is wrong for zero-decimal codes. Add support
// (with a per-currency subunit divisor) when a publisher actually asks for one.
export const SUPPORTED_CURRENCIES = [
  { code: "usd", name: "US Dollar" },
  { code: "eur", name: "Euro" },
  { code: "gbp", name: "British Pound" },
  { code: "cad", name: "Canadian Dollar" },
  { code: "aud", name: "Australian Dollar" },
  { code: "chf", name: "Swiss Franc" },
  { code: "sek", name: "Swedish Krona" },
  { code: "nzd", name: "New Zealand Dollar" },
  { code: "nok", name: "Norwegian Krone" },
  { code: "dkk", name: "Danish Krone" },
] as const

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"]

const SUPPORTED_CURRENCY_CODES = SUPPORTED_CURRENCIES.map(c => c.code) as [
  CurrencyCode,
  ...CurrencyCode[],
]

// `amount` is in CENTS. The form collects whole units (integer) and multiplies
// by 100 before submitting; readers like `formatPrice` divide by 100. DB + Stripe
// both see cents.
export const tierPriceSchema = z.object({
  interval: z.enum(BillingInterval),
  intervalCount: z.number().int().positive().default(1),
  amount: z.number().int().nonnegative(),
  currency: z.enum(SUPPORTED_CURRENCY_CODES).default("usd"),
})

export type TierPriceSchema = z.infer<typeof tierPriceSchema>
