import { createS3BucketClientFromEnv } from "@openads/s3"
import { fetchAndUploadFavicon } from "@openads/s3/favicon"
import { db } from "../src/index"

/**
 * Dev-only seed. Creates a fully-populated "Acme Directory" workspace owned by
 * every existing user, so each dashboard module has data: tiers (incl. an
 * archived one), tier prices (incl. an archived grandfathered one), all six
 * field types, advertisers, subscriptions in every interesting status, ads in
 * every status (incl. a long-content stress-test ad), custom field meta, and
 * 30 days of stats.
 *
 * Idempotent: re-running deletes the seed workspace (by slug) and recreates it.
 * Stripe IDs are fakes (`*_seed*`) — actions that call Stripe (reject, price
 * changes) will fail against this workspace; use it for browsing/layout work.
 */

const WORKSPACE_SLUG = "acme"

const DAY = 24 * 60 * 60 * 1000

// Deterministic PRNG so stats are stable across re-runs
const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const utcDate = (daysAgo: number) => {
  const d = new Date(Date.now() - daysAgo * DAY)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

const s3 = createS3BucketClientFromEnv()

/**
 * Runs the same favicon pipeline as the create procedures: fetch from the
 * logo service, re-host on R2, return the CDN URL. Keys are domain-based
 * (not id-based) so re-runs overwrite instead of orphaning objects. Returns
 * "" when offline or unconfigured — the UI falls back to initials.
 */
const seedFavicon = async (websiteUrl: string): Promise<string> => {
  const logoLinkClientId = process.env.LOGO_LINK_CLIENT_ID
  if (!logoLinkClientId) {
    console.warn("LOGO_LINK_CLIENT_ID not set — seeding without favicons")
    return ""
  }

  const url = await fetchAndUploadFavicon(s3, {
    websiteUrl,
    logoLinkClientId,
    key: `seed/favicons/${new URL(websiteUrl).hostname}.png`,
  }).catch(() => null)

  return url ?? ""
}

const seed = async () => {
  const users = await db.user.findMany({ select: { id: true, email: true } })

  if (users.length === 0) {
    console.warn("No users found — log in once via the app first, then re-run the seed.")
  }

  // Wipe a previous seed run (children first — relationMode "prisma")
  const existing = await db.workspace.findUnique({ where: { slug: WORKSPACE_SLUG } })

  if (existing) {
    const workspaceId = existing.id
    const subs = await db.subscription.findMany({ where: { workspaceId }, select: { id: true } })
    const ads = await db.ad.findMany({
      where: { subscriptionId: { in: subs.map(s => s.id) } },
      select: { id: true },
    })
    const adIds = ads.map(a => a.id)

    await db.adStat.deleteMany({ where: { adId: { in: adIds } } })
    await db.meta.deleteMany({ where: { adId: { in: adIds } } })
    await db.ad.deleteMany({ where: { id: { in: adIds } } })
    await db.subscription.deleteMany({ where: { workspaceId } })
    await db.advertiser.deleteMany({ where: { workspaceId } })
    await db.tierPrice.deleteMany({ where: { tier: { workspaceId } } })
    await db.tier.deleteMany({ where: { workspaceId } })
    await db.field.deleteMany({ where: { workspaceId } })
    await db.workspaceMember.deleteMany({ where: { workspaceId } })
    await db.workspace.delete({ where: { id: workspaceId } })
    console.info("Removed previous seed workspace")
  }

  const workspace = await db.workspace.create({
    data: {
      name: "Acme Directory",
      slug: WORKSPACE_SLUG,
      websiteUrl: "https://acme.directory",
      faviconUrl: await seedFavicon("https://acme.directory"),
      stripeConnectId: "acct_seed0000000000000001",
      stripeConnectStatus: "Active",
    },
  })

  for (const user of users) {
    await db.workspaceMember.create({
      data: { userId: user.id, workspaceId: workspace.id, role: "Owner" },
    })
  }

  // Re-runs recreate the workspace under a new id, so repoint any default
  // that is unset or left dangling by the wipe above.
  const workspaceIds = (await db.workspace.findMany({ select: { id: true } })).map(w => w.id)
  await db.user.updateMany({
    where: { OR: [{ defaultWorkspaceId: null }, { defaultWorkspaceId: { notIn: workspaceIds } }] },
    data: { defaultWorkspaceId: workspace.id },
  })

  // ---------------------------------------------------------------- Fields
  const fieldData = [
    { type: "Text", name: "Tagline", placeholder: "One-liner shown on the card", isRequired: true },
    { type: "Textarea", name: "Description", placeholder: "Longer pitch, 2–3 sentences" },
    { type: "Image", name: "Banner image", placeholder: "1200×630 recommended" },
    { type: "Url", name: "Docs URL", placeholder: "https://docs.example.com" },
    { type: "Text", name: "CTA label", default: "Learn more" },
    { type: "Number", name: "Discount percent", placeholder: "e.g. 20" },
    { type: "Switch", name: "Show sponsored badge", default: "true" },
  ] as const

  const fields: Record<string, { id: string }> = {}
  for (const [order, data] of fieldData.entries()) {
    fields[data.name] = await db.field.create({
      data: { ...data, order, workspaceId: workspace.id },
    })
  }

  // ----------------------------------------------------------------- Tiers
  const tierData = [
    {
      name: "Silver",
      description: "Standard listing in the directory rotation.",
      weight: 1,
      features: ["Standard rotation", "Impression & click stats", "Cancel anytime"],
      prices: [
        { interval: "Month", amount: 2900 },
        { interval: "Year", amount: 29000 },
      ],
    },
    {
      name: "Gold",
      description: "Boosted rotation weight and newsletter mention.",
      weight: 2.5,
      features: ["2.5× rotation weight", "Newsletter mention", "Impression & click stats"],
      prices: [
        { interval: "Month", amount: 7900 },
        { interval: "Year", amount: 79000 },
        // Grandfathered price kept for an old subscriber
        { interval: "Month", amount: 5900, isActive: false },
      ],
    },
    {
      name: "Platinum",
      description: "Top placement, homepage banner eligibility, priority review.",
      weight: 4,
      features: [
        "4× rotation weight",
        "Homepage banner eligible",
        "Priority review",
        "Dedicated support",
      ],
      prices: [{ interval: "Month", amount: 19900 }],
    },
    {
      name: "Launch Special",
      description: "Retired launch promo — kept for existing subscribers.",
      weight: 1.5,
      isActive: false,
      features: ["1.5× rotation weight"],
      prices: [{ interval: "Month", amount: 1900, isActive: false }],
    },
  ] as const

  const tiers: Record<string, { id: string }> = {}
  const prices: Record<string, { id: string }> = {}
  let priceSeq = 0

  for (const [order, { prices: tierPrices, features, ...data }] of tierData.entries()) {
    const tier = await db.tier.create({
      data: {
        ...data,
        features: [...features],
        order,
        workspaceId: workspace.id,
        stripeProductId: `prod_seed${String(order + 1).padStart(4, "0")}`,
      },
    })
    tiers[data.name] = tier

    for (const price of tierPrices) {
      priceSeq += 1
      const created = await db.tierPrice.create({
        data: {
          ...price,
          tierId: tier.id,
          stripePriceId: `price_seed${String(priceSeq).padStart(4, "0")}`,
        },
      })
      prices[`${data.name}/${price.interval}/${price.amount}`] = created
    }
  }

  // ----------------------------------------------- Advertisers + subs + ads
  type AdSeed = {
    advertiser: { name: string; email?: string }
    price: string // key into `prices`
    subscription: {
      status: "Trialing" | "Active" | "PastDue" | "Canceled"
      cancelAtPeriodEnd?: boolean
    }
    ad: {
      name: string
      websiteUrl: string
      status: "Pending" | "Approved" | "Rejected"
      rejectionNote?: string
      approvedDaysAgo?: number
      stats?: boolean
    }
    meta: Record<string, unknown>
  }

  const adSeeds: AdSeed[] = [
    {
      advertiser: { name: "Resend", email: "ads@resend.com" },
      price: "Platinum/Month/19900",
      subscription: { status: "Active" },
      ad: {
        name: "Resend",
        websiteUrl: "https://resend.com",
        status: "Approved",
        approvedDaysAgo: 28,
        stats: true,
      },
      meta: {
        Tagline: "Email for developers",
        Description:
          "The best API to reach humans instead of spam folders. Build, test, and deliver transactional emails at scale.",
        "Banner image": "https://picsum.photos/seed/resend/1200/630",
        "Docs URL": "https://resend.com/docs",
        "CTA label": "Start sending",
        "Discount percent": 20,
        "Show sponsored badge": true,
      },
    },
    {
      advertiser: { name: "Polar", email: "growth@polar.sh" },
      price: "Gold/Month/7900",
      subscription: { status: "Active" },
      ad: {
        name: "Polar",
        websiteUrl: "https://polar.sh",
        status: "Pending",
      },
      meta: {
        Tagline: "Payment infrastructure for the 21st century",
        Description: "Sell SaaS and digital products with 4 lines of code.",
        "Banner image": "https://picsum.photos/seed/polar/1200/630",
        "CTA label": "Get started",
        "Show sponsored badge": false,
      },
    },
    {
      advertiser: { name: "Trigger.dev", email: "hello@trigger.dev" },
      price: "Gold/Year/79000",
      subscription: { status: "Trialing" },
      ad: {
        name: "Trigger.dev",
        websiteUrl: "https://trigger.dev",
        status: "Pending",
      },
      meta: {
        Tagline: "Background jobs for TypeScript",
        "Docs URL": "https://trigger.dev/docs",
        "Discount percent": 10,
      },
    },
    {
      advertiser: { name: "ShadyVPN", email: "marketing@shadyvpn.example" },
      price: "Silver/Month/2900",
      // Rejecting an ad cancels its subscription — keep the pair consistent
      subscription: { status: "Canceled" },
      ad: {
        name: "ShadyVPN",
        websiteUrl: "https://shadyvpn.example",
        status: "Rejected",
        rejectionNote:
          "Creative claims '100% anonymous browsing' which we can't substantiate. Please remove absolute claims and resubmit.",
      },
      meta: {
        Tagline: "100% anonymous browsing, guaranteed",
        "Show sponsored badge": true,
      },
    },
    {
      advertiser: { name: "Cal.com", email: "partnerships@cal.com" },
      price: "Silver/Year/29000",
      subscription: { status: "PastDue" },
      ad: {
        name: "Cal.com",
        websiteUrl: "https://cal.com",
        status: "Approved",
        approvedDaysAgo: 45,
        stats: true,
      },
      meta: {
        Tagline: "Scheduling infrastructure for everyone",
        Description: "The open-source Calendly alternative.",
        "Banner image": "https://picsum.photos/seed/cal/1200/630",
        "CTA label": "Book a demo",
      },
    },
    {
      advertiser: { name: "Churned Co" },
      price: "Launch Special/Month/1900",
      subscription: { status: "Canceled" },
      ad: {
        name: "Churned Co",
        websiteUrl: "https://churned.example",
        status: "Approved",
        approvedDaysAgo: 90,
        stats: true,
      },
      meta: {
        Tagline: "We were here once",
      },
    },
    {
      advertiser: { name: "Grandfathered Inc", email: "ads@grandfathered.example" },
      price: "Gold/Month/5900",
      subscription: { status: "Active", cancelAtPeriodEnd: true },
      ad: {
        name: "Grandfathered Inc",
        websiteUrl: "https://grandfathered.example",
        status: "Approved",
        approvedDaysAgo: 120,
        stats: true,
      },
      meta: {
        Tagline: "Still on the old $59 Gold price",
        "Show sponsored badge": true,
      },
    },
    // Layout stress test: long unbroken strings everywhere
    {
      advertiser: {
        name: "Extremely Long Advertiser Name That Tests Truncation Behavior In Lists GmbH & Co. KG",
        email:
          "very.long.email.address.for.testing.overflow@subdomain.extremely-long-domain-name-example.international",
      },
      price: "Silver/Month/2900",
      subscription: { status: "Active" },
      ad: {
        name: "SuperCaliFragilisticExpialidocious Enterprise Platform Suite Professional Edition 2026 — Now With AI",
        websiteUrl:
          "https://www.extremely-long-domain-name-example.international/very/deep/path/segments/that/never/end/landing-page?utm_source=openads&utm_medium=display&utm_campaign=q2-2026-extremely-long-campaign-name&utm_content=variant-b",
        status: "Pending",
      },
      meta: {
        Tagline:
          "Pneumonoultramicroscopicsilicovolcanoconiosis-grade reliability for hyperconverged multicloud infrastructure orchestration",
        Description: "Word ".repeat(120).trim(),
        "Banner image": "https://picsum.photos/seed/stress/1200/630",
        "Docs URL":
          "https://docs.extremely-long-domain-name-example.international/getting-started/installation/prerequisites/system-requirements",
        "CTA label": "Click this unreasonably long call to action button label",
        "Discount percent": 99,
        "Show sponsored badge": true,
      },
    },
  ]

  // Prefetch all ad favicons concurrently (real domains get logos, fake
  // `.example` domains get generated monograms).
  const faviconUrls = new Map(
    await Promise.all(
      adSeeds.map(
        async item => [item.ad.websiteUrl, await seedFavicon(item.ad.websiteUrl)] as const,
      ),
    ),
  )

  let subSeq = 0
  let totalStats = 0

  for (const item of adSeeds) {
    subSeq += 1

    // Submission always predates the review decision, and the advertiser
    // record is created at checkout time alongside the subscription.
    const reviewedDaysAgo = item.ad.status === "Approved" ? (item.ad.approvedDaysAgo ?? 7) : 2
    const submittedAt = new Date(Date.now() - (reviewedDaysAgo + 3) * DAY)

    const advertiser = await db.advertiser.create({
      data: { ...item.advertiser, createdAt: submittedAt, workspaceId: workspace.id },
    })

    const price = prices[item.price]
    if (!price) throw new Error(`Unknown price key: ${item.price}`)

    const tierName = item.price.split("/")[0] as string
    const periodStart = new Date(Date.now() - 10 * DAY)
    const periodEnd = new Date(periodStart.getTime() + 30 * DAY)

    const subscription = await db.subscription.create({
      data: {
        stripeSubscriptionId: `sub_seed${String(subSeq).padStart(4, "0")}`,
        stripeCustomerId: `cus_seed${String(subSeq).padStart(4, "0")}`,
        status: item.subscription.status,
        cancelAtPeriodEnd: item.subscription.cancelAtPeriodEnd ?? false,
        createdAt: submittedAt,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        workspaceId: workspace.id,
        tierId: tiers[tierName]!.id,
        tierPriceId: price.id,
        advertiserId: advertiser.id,
      },
    })

    const ad = await db.ad.create({
      data: {
        name: item.ad.name,
        websiteUrl: item.ad.websiteUrl,
        faviconUrl: faviconUrls.get(item.ad.websiteUrl) ?? "",
        status: item.ad.status,
        createdAt: submittedAt,
        approvedAt:
          item.ad.status === "Approved" ? new Date(Date.now() - reviewedDaysAgo * DAY) : null,
        rejectedAt: item.ad.status === "Rejected" ? new Date(Date.now() - 2 * DAY) : null,
        rejectionNote: item.ad.rejectionNote,
        subscriptionId: subscription.id,
      },
    })

    for (const [fieldName, value] of Object.entries(item.meta)) {
      const field = fields[fieldName]
      if (!field) throw new Error(`Unknown field: ${fieldName}`)
      await db.meta.create({ data: { adId: ad.id, fieldId: field.id, value: value as object } })
    }

    if (item.ad.stats) {
      const rand = mulberry32(subSeq)
      const stats = Array.from({ length: 30 }, (_, i) => {
        const impressions = Math.floor(200 + rand() * 1800)
        return {
          adId: ad.id,
          date: utcDate(29 - i),
          impressions,
          clicks: Math.floor(impressions * (0.005 + rand() * 0.04)),
        }
      })
      await db.adStat.createMany({ data: stats })
      totalStats += stats.length
    }
  }

  console.info(
    `Seeded workspace "${workspace.name}" (${workspace.slug}): ` +
      `${users.length} member(s), ${fieldData.length} fields, ${tierData.length} tiers, ` +
      `${priceSeq} prices, ${adSeeds.length} advertisers/subscriptions/ads, ${totalStats} stat rows`,
  )
}

await seed()
process.exit(0)
