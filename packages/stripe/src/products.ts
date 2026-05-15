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
  connectedAccountId: string
  name: string
  description?: string
  metadata: TierMetadata
  features?: string[]
}

export async function createTierProduct(
  stripe: StripeClient,
  props: ProductCreateProps,
): Promise<Stripe.Product> {
  return stripe.products.create(
    {
      name: props.name,
      description: props.description || undefined,
      metadata: props.metadata,
      marketing_features: props.features?.map(name => ({ name })),
    },
    { stripeAccount: props.connectedAccountId },
  )
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
  connectedAccountId: string,
  productId: string,
  props: ProductUpdateProps,
): Promise<Stripe.Product> {
  return stripe.products.update(
    productId,
    {
      name: props.name,
      description: props.description ?? undefined,
      active: props.active,
      metadata: props.metadata as Record<string, string> | undefined,
      marketing_features: props.features?.map(name => ({ name })),
    },
    { stripeAccount: connectedAccountId },
  )
}

export async function archiveTierProduct(
  stripe: StripeClient,
  connectedAccountId: string,
  productId: string,
): Promise<Stripe.Product> {
  return stripe.products.update(productId, { active: false }, { stripeAccount: connectedAccountId })
}

export interface TierPriceCreateProps {
  connectedAccountId: string
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
  return stripe.prices.create(
    {
      product: props.productId,
      unit_amount: props.unitAmount,
      currency: props.currency,
      recurring: {
        interval: toStripeInterval(props.interval),
        interval_count: props.intervalCount,
      },
      metadata: props.metadata,
    },
    { stripeAccount: props.connectedAccountId },
  )
}

export async function archivePrice(
  stripe: StripeClient,
  connectedAccountId: string,
  priceId: string,
): Promise<Stripe.Price> {
  return stripe.prices.update(priceId, { active: false }, { stripeAccount: connectedAccountId })
}
