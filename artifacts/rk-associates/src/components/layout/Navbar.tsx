import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useTheme } from "../../context/ThemeContext"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-navy/95 shadow-xl backdrop-blur" : "bg-navy"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="RK Associates home">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-gold to-gold-dark font-serif text-lg font-bold text-navy shadow-sm">
            RK
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold text-beige">RK Associates</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">
              Estate Agency
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          <Link
            to="/listings"
            className="hidden text-sm font-medium text-beige/80 transition hover:text-gold sm:block"
          >
            Properties
          </Link>
          <Link
            to="/listings?near=1"
            className="hidden text-sm font-medium text-beige/80 transition hover:text-gold sm:block"
          >
            Near You
          </Link>

          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-beige/70 transition hover:bg-white/10 hover:text-gold"
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <Link to="/admin/login" className="btn-gold px-3 py-1.5 text-xs hidden sm:inline-flex">
            Admin
          </Link>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-beige/70 hover:bg-white/10 sm:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-navy px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/listings" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-beige/80 hover:bg-white/10 hover:text-gold">Properties</Link>
            <Link to="/listings?near=1" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-beige/80 hover:bg-white/10 hover:text-gold">Near You</Link>
            <Link to="/admin/login" onClick={() => setMenuOpen(false)} className="rounded-lg bg-gold px-3 py-2.5 text-sm font-semibold text-navy text-center">Admin</Link>
          </div>
        </div>
      )}
    </header>
  )
}
