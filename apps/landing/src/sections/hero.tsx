import { Container } from "~/components/container"
import { Orb } from "~/components/orb"
import { WaitlistForm } from "~/components/waitlist-form"

const logos = [
  { href: "https://openalternative.co", src: "/logos/openalternative.svg", alt: "OpenAlternative" },
  { href: "https://euroalternative.co", src: "/logos/euroalternative.svg", alt: "EuroAlternative" },
  { href: "https://dirstarter.com", src: "/logos/dirstarter.svg", alt: "DirStarter" },
]

export function Hero() {
  return (
    <section className="relative border-b py-12 sm:pb-16 md:pb-24 lg:pb-32" id="waitlist">
      <Orb className="absolute -top-1/2 left-1/2 -translate-x-1/2 -z-1" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-background -z-1 pointer-events-none" />

      <Container className="flex flex-col items-center gap-5 text-center">
        <span
          className="px-3 py-1 bg-background/50 font-medium text-xs -tracking-tight text-foreground/60 rounded-full animate-fade-up -mb-4"
          style={{ animationDelay: "0s" }}
        >
          Waitlist is now open!
        </span>

        <h1
          className="max-w-[22ch] text-5xl/[1.05] font-semibold tracking-tight text-balance animate-fade-up sm:text-6xl/[1.05]"
          style={{ animationDelay: "80ms" }}
        >
          Sell ad space on your website. Without the ad&nbsp;network.
        </h1>

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

          <p className="mt-3 text-xs text-foreground/40 text-center">
            We respect your privacy. No spam, ever.
          </p>
        </div>
      </Container>

      <Container
        className="flex flex-col items-center text-center gap-6 translate-y-12 md:translate-y-16 lg:translate-y-24"
        data-reveal
      >
        <p className="text-xs font-medium text-foreground/35 uppercase tracking-widest">
          Trusted by leading content websites
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
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
      </Container>
    </section>
  )
}
