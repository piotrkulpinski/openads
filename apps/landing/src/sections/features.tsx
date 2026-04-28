import { Container } from "~/components/container"
import { H3 } from "~/components/heading"
import { SectionHeading } from "~/components/section-heading"

const features = [
  {
    title: "Your zones, your packages",
    description:
      "Create ad zones that match your layout — sidebars, banners, sponsored listings. Define tiered subscription packages and let advertisers pick their level.",
  },
  {
    title: "Self-service subscriptions",
    description:
      "Advertisers pick a package and subscribe. No back-and-forth emails, no invoicing — recurring revenue on autopilot.",
  },
  {
    title: "Stripe payouts on rails",
    description:
      "Payments route from advertiser to your Stripe Connect account every month. You set the price, you keep the price.",
  },
]

export function Features() {
  return (
    <section className="py-12 md:py-28">
      <Container>
        <SectionHeading subtitle="No ad networks, no rev-share surprises. Define your zones, package up your inventory, and let advertisers subscribe directly.">
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
