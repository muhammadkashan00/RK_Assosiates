import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="font-serif text-6xl font-bold text-gold">404</p>
      <h1 className="mt-4 font-serif text-3xl font-bold text-navy">Page not found</h1>
      <p className="mt-2 text-slate/70">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-navy px-6 py-3 font-semibold text-beige transition hover:bg-navy-light"
      >
        Go home
      </Link>
    </div>
  )
}
