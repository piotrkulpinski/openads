import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { Footer } from "~/components/footer"
import { Header } from "~/components/header"
import { CTA } from "~/sections/cta"
import { Features } from "~/sections/features"
import { Hero } from "~/sections/hero"
import { Steps } from "~/sections/steps"

export const Route = createFileRoute("/")({ component: HomePage })

function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    )

    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Steps />
      <CTA />
      <Footer />
    </>
  )
}
