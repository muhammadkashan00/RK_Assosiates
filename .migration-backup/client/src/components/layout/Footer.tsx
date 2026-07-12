export function Footer() {
  return (
    <footer className="mt-20 bg-navy text-beige/80">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold font-serif text-lg font-bold text-navy">
              RK
            </span>
            <span className="font-serif text-lg font-semibold text-beige">RK Associates</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-beige/70">
            Curated premium properties with verified area highlights. Your privacy and ours are
            protected: exact addresses are never shared publicly.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>About RK Associates</li>
            <li>Why choose us</li>
            <li>Area highlights, not addresses</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Contact</h4>
          <p className="mt-4 text-sm leading-relaxed text-beige/70">
            All inquiries are handled securely through WhatsApp on each property page. We never
            display phone numbers publicly to keep communication safe.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-beige/50 sm:flex-row">
          <span>© {new Date().getFullYear()} RK Associates. All rights reserved.</span>
          <span>Built for a bypass-proof, privacy-first property experience.</span>
        </div>
      </div>
    </footer>
  )
}
