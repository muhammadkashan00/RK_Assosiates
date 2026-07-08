import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "bg-navy/95 shadow-lg backdrop-blur" : "bg-navy"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="RK Associates home">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold font-serif text-lg font-bold text-navy">
            RK
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold text-beige">RK Associates</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">
              Estate Agency
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <a
            href="#listings"
            className="hidden text-sm font-medium text-beige/80 transition hover:text-gold sm:block"
          >
            Properties
          </a>
          <a
            href="#near-you"
            className="hidden text-sm font-medium text-beige/80 transition hover:text-gold sm:block"
          >
            Near You
          </a>
          <Link to="/admin/login" className="btn-gold px-4 py-2 text-xs">
            Admin
          </Link>
        </div>
      </nav>
    </header>
  )
}
