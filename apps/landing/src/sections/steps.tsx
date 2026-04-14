import { Container } from "~/components/container"
import { H3 } from "~/components/heading"
import { SectionHeading } from "~/components/section-heading"

const steps = [
  {
    title: "Create your zones",
    description: "Define where ads appear on your site and what they cost.",
  },
  {
    title: "Customize fields",
    description: "Choose what info advertisers need to provide for each zone.",
  },
  {
    title: "Embed the widget",
    description: "Drop one snippet into your site. Pick a theme. Done.",
  },
  {
    title: "Get paid",
    description: "Advertisers purchase campaigns. Money hits your Stripe instantly.",
  },
]

export function Steps() {
  return (
    <section className="py-12 md:py-28">
      <Container>
        <SectionHeading subtitle="One embed snippet. Five minutes. That's all it takes to start selling ad space on your site.">
          From setup to revenue in four&nbsp;steps
        </SectionHeading>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 sm:gap-10 md:gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="pt-6 border-t border-border"
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="block text-4xl/none font-semibold text-foreground/8 tabular-nums select-none">
                0{i + 1}
              </span>
              <H3 className="mt-4 mb-3">{step.title}</H3>
              <p className="text-foreground/50 text-[0.9375rem]/relaxed text-pretty">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
