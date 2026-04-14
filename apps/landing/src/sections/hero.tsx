import { Link } from "@tanstack/react-router"
import { Container } from "~/components/container"
import { H1 } from "~/components/heading"
import { Orb } from "~/components/orb"
import { WaitlistForm } from "~/components/waitlist-form"

const logos = [
  { href: "https://openalternative.co", src: "/logos/openalternative.svg", alt: "OpenAlternative" },
  { href: "https://euroalternative.co", src: "/logos/euroalternative.svg", alt: "EuroAlternative" },
  { href: "https://dirstarter.com", src: "/logos/dirstarter.svg", alt: "DirStarter" },
]

export function Hero() {
  return (
    <section className="relative border-b overflow-clip py-6 md:py-8">
      <Orb className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-1" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-background -z-1 pointer-events-none" />

      <Container className="flex flex-col items-start text-left sm:items-center sm:text-center gap-12 md:gap-16 lg:gap-20">
        <Link to="/" className="group">
          <img
            src="/logo.svg"
            alt="OpenAds"
            className="h-6 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </Link>

        <div className="flex flex-col items-start text-left sm:items-center sm:text-center gap-5">
          <span
            className="px-3 py-1 bg-background/50 font-medium text-xs -tracking-tight text-foreground/60 rounded-full animate-fade-up -mb-2 md:-mb-4"
            style={{ animationDelay: "0s" }}
          >
            Waitlist is now open!
          </span>

          <H1 className="max-w-[22ch] animate-fade-up" style={{ animationDelay: "80ms" }}>
            Sell ad space on your website. Without the ad&nbsp;network.
          </H1>

          <p
            className="max-w-xl text-lg/relaxed text-foreground/55 text-pretty animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            Define your ad zones, set your prices, embed a widget — and let advertisers purchase
            directly. No middlemen. No rev-share surprises.
          </p>

          <div
            className="w-full max-w-md pt-2 scroll-mt-24 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <WaitlistForm />

            <p className="mt-3 text-xs text-foreground/40 text-left sm:text-center">
              We respect your privacy. No spam, ever.
            </p>
          </div>
        </div>

        <div
          className="flex flex-col items-start text-left sm:items-center sm:text-center gap-6"
          data-reveal
        >
          <p className="text-xs font-medium text-foreground/35 uppercase tracking-widest">
            Trusted by leading content websites
          </p>

          <div className="flex flex-wrap items-center justify-start sm:justify-center gap-4 md:gap-x-8 lg:gap-x-10">
            {logos.map(({ href, src, alt }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <img src={src} alt={alt} className="h-5 w-auto sm:h-6" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
