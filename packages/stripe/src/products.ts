import type Stripe from "stripe"
import type { StripeClient } from "./index"

// Mirrors the Prisma BillingInterval enum without depending on the db package.
export type LocalBillingInterval = "Day" | "Week" | "Month" | "Year"

function toStripeInterval(b: LocalBillingInterval): Stripe.Price.Recurring["interval"] {
  switch (b) {
    case "Day":
      return "day"
    case "Week":
      return "week"
    case "Month":
      return "month"
    case "Year":
      return "year"
  }
}

export interface TierMetadata extends Record<string, string> {
  workspaceId: string
  tierId: string
  weight: string
}

export interface TierPriceMetadata extends Record<string, string> {
  workspaceId: string
  tierId: string
  tierPriceId: string
  interval: LocalBillingInterval
  intervalCount: string
}

export interface ProductCreateProps {
  name: string
  description?: string
  metadata: TierMetadata
  features?: string[]
}

export async function createTierProduct(
  stripe: StripeClient,
  props: ProductCreateProps,
): Promise<Stripe.Product> {
  return stripe.products.create({
    name: props.name,
    description: props.description || undefined,
    metadata: props.metadata,
    marketing_features: props.features?.map(name => ({ name })),
  })
}

export interface ProductUpdateProps {
  name?: string
  description?: string
  active?: boolean
  metadata?: Partial<TierMetadata>
  features?: string[]
}

export async function updateTierProduct(
  stripe: StripeClient,
  productId: string,
  props: ProductUpdateProps,
): Promise<Stripe.Product> {
  return stripe.products.update(productId, {
    name: props.name,
    description: props.description ?? undefined,
    active: props.active,
    metadata: props.metadata as Record<string, string> | undefined,
    marketing_features: props.features?.map(name => ({ name })),
  })
}

export async function archiveTierProduct(
  stripe: StripeClient,
  productId: string,
): Promise<Stripe.Product> {
  return stripe.products.update(productId, { active: false })
}

export interface TierPriceCreateProps {
  productId: string
  unitAmount: number
  currency: string
  interval: LocalBillingInterval
  intervalCount: number
  metadata?: TierPriceMetadata
}

export async function createTierPrice(
  stripe: StripeClient,
  props: TierPriceCreateProps,
): Promise<Stripe.Price> {
  return stripe.prices.create({
    product: props.productId,
    unit_amount: props.unitAmount,
    currency: props.currency,
    recurring: {
      interval: toStripeInterval(props.interval),
      interval_count: props.intervalCount,
    },
    metadata: props.metadata,
  })
}

export async function archivePrice(stripe: StripeClient, priceId: string): Promise<Stripe.Price> {
  return stripe.prices.update(priceId, { active: false })
}
