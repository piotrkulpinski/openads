import { Link } from "@tanstack/react-router"

export function Header() {
  return (
    <header className="flex justify-center py-6 md:py-8">
      <Link to="/" className="group">
        <img
          src="/logo.svg"
          alt="OpenAds"
          className="h-6 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </Link>
    </header>
  )
}
