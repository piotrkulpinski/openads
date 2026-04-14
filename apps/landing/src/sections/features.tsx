import { Container } from "~/components/container"
import { H3 } from "~/components/heading"
import { SectionHeading } from "~/components/section-heading"

const features = [
  {
    title: "Your zones, your prices",
    description:
      "Create ad zones that match your layout — sidebars, banners, sponsored listings. Set pricing and let advertisers fill in the rest.",
  },
  {
    title: "Self-service campaigns",
    description:
      "Advertisers pick a zone, choose their dates, and pay. No back-and-forth emails. No invoicing headaches. Revenue on autopilot.",
  },
  {
    title: "Instant Stripe payouts",
    description:
      "Payments go straight from advertiser to your Stripe account. No 30-day net terms. You set the price, you get the price.",
  },
]

export function Features() {
  return (
    <section className="py-12 md:py-28">
      <Container>
        <SectionHeading subtitle="No ad networks, no rev-share surprises. Define your zones, set your prices, and let advertisers purchase directly.">
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
