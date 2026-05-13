import { Container } from "~/components/container"
import { H3 } from "~/components/heading"
import { SectionHeading } from "~/components/section-heading"

const features = [
  {
    title: "Your tiers, your prices",
    description:
      "Create the tiers you want to sell — banner, sidebar, sponsored card. Set weights and monthly prices, then let advertisers subscribe.",
  },
  {
    title: "Self-service subscriptions",
    description:
      "Advertisers pick a tier, pay through Stripe, and submit creative for review. No invoicing, no chasing — recurring revenue on autopilot.",
  },
  {
    title: "Instant Stripe payouts",
    description:
      "Payments go straight from advertiser to your Stripe account via Connect. No 30-day net terms. You set the price, you get the price.",
  },
]

export function Features() {
  return (
    <section className="py-12 md:py-28">
      <Container>
        <SectionHeading subtitle="No ad networks, no rev-share surprises. Define your tiers, set your prices, and let advertisers subscribe directly.">
          Direct ad sales, simplified
        </SectionHeading>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-12">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="pt-6 border-t border-border"
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <H3 className="mb-3">{feature.title}</H3>
              <p className="text-foreground/50 text-[0.9375rem]/relaxed text-pretty">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
