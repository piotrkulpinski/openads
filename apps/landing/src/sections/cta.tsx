import { Orb } from "~/components/orb"

export function CTA() {
  return (
    <section className="relative overflow-clip py-20 md:py-28">
      <div
        className="relative max-w-3xl mx-auto px-6 flex flex-col items-center text-center gap-6 md:px-8"
        data-reveal
      >
        <h2 className="text-3xl/tight font-semibold tracking-tight text-balance md:text-4xl/tight">
          Your traffic. Your prices. Your&nbsp;advertisers.
        </h2>

        <p className="max-w-md text-base/relaxed text-foreground/55 text-pretty">
          Join the waitlist and be the first to know when we launch.
        </p>

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
