import type Stripe from "stripe"
import type { StripeClient } from "./index"

export interface TierMetadata extends Record<string, string> {
  workspaceId: string
  tierId: string
  weight: string
}

export interface ProductCreateProps {
  name: string
  description?: string
  metadata: TierMetadata
}

export async function createTierProduct(
  stripe: StripeClient,
  props: ProductCreateProps,
): Promise<Stripe.Product> {
  return stripe.products.create({
    name: props.name,
    description: props.description || undefined,
    metadata: props.metadata,
  })
}

export interface ProductUpdateProps {
  name?: string
  description?: string
  active?: boolean
  metadata?: Partial<TierMetadata>
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
  })
}

export async function archiveTierProduct(
  stripe: StripeClient,
  productId: string,
): Promise<Stripe.Product> {
  return stripe.products.update(productId, { active: false })
}

export interface PriceCreateProps {
  productId: string
  unitAmount: number
  currency: string
  metadata?: TierMetadata
}

export async function createMonthlyPrice(
  stripe: StripeClient,
  props: PriceCreateProps,
): Promise<Stripe.Price> {
  return stripe.prices.create({
    product: props.productId,
    unit_amount: props.unitAmount,
    currency: props.currency,
    recurring: { interval: "month" },
    metadata: props.metadata,
  })
}

export async function archivePrice(stripe: StripeClient, priceId: string): Promise<Stripe.Price> {
  return stripe.prices.update(priceId, { active: false })
}
