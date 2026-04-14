import { H2 } from "~/components/heading"
import { Orb } from "~/components/orb"

export function CTA() {
  return (
    <section className="relative overflow-clip py-12 md:py-28">
      <div
        className="relative max-w-3xl mx-auto px-6 flex flex-col gap-5 items-start text-left sm:items-center sm:text-center md:px-8"
        data-reveal
      >
        <div className="flex flex-col items-start text-left sm:items-center sm:text-center gap-5">
          <H2>Your traffic. Your prices. Your&nbsp;advertisers.</H2>

          <p className="max-w-xl text-lg/relaxed text-foreground/55 text-pretty">
            Sell ad space directly, set your own prices, and keep 100% of what you earn. Join the
            waitlist to know when we launch.
          </p>
        </div>

        <a
          href="#waitlist"
          className="inline-flex items-center px-8 py-3 text-base font-medium bg-foreground text-background rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:shadow-md hover:shadow-foreground/15 hover:-translate-y-px active:scale-[0.96]"
        >
          Join the Waitlist
        </a>
      </div>

      <Orb className="absolute top-[60%] left-1/2 -translate-x-1/2 -z-1 opacity-50" />
    </section>
  )
}
