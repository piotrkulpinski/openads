import { Container } from "~/components/container"

export function Footer() {
  return (
    <footer className="py-8 border-t">
      <Container className="flex items-center justify-between text-sm text-foreground/40">
        <img src="/logo.svg" alt="OpenAds" className="h-5 w-auto" />

        <p>
          Made by{" "}
          <a
            href="https://kulpinski.pl"
            target="_blank"
            rel="noopener"
            className="hover:text-foreground/70 transition-colors"
          >
            @piotrkulpinski
          </a>
        </p>
      </Container>
    </footer>
  )
}
