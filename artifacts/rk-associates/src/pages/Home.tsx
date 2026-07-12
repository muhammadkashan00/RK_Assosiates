import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, type Property } from "../lib/api"
import { PropertyGrid } from "../components/property/PropertyGrid"

export default function Home() {
  const [featured, setFeatured] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ properties: Property[] }>("/properties?sort=views&limit=6")
      .then((res) => setFeatured(res.properties))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-gradient-to-br from-navy via-navy-light to-navy/80" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <span className="inline-block rounded-full bg-gold/20 px-4 py-1.5 text-sm font-medium text-gold ring-1 ring-gold/30">
            RK Associates — Trusted Real Estate
          </span>
          <h1 className="mt-5 max-w-2xl text-balance font-serif text-4xl font-bold leading-tight text-beige sm:text-5xl">
            Find a home in the neighborhood you&apos;ll love
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-beige/80">
            Explore verified listings with real coverage areas on the map. See exactly where each
            property sits before you reach out.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/listings"
              className="rounded-xl bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold-dark"
            >
              Browse Properties
            </Link>
            <Link
              to="/listings?near=1"
              className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-beige ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
            >
              Properties Near Me
            </Link>
          </div>
        </div>
      </section>

      <section id="listings" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-navy">Featured Listings</h2>
            <p className="mt-1 text-slate/70">Our most-viewed properties this week.</p>
          </div>
          <Link
            to="/listings"
            className="hidden text-sm font-semibold text-gold-dark hover:underline sm:block"
          >
            View all →
          </Link>
        </div>
        <PropertyGrid properties={featured} loading={loading} />
      </section>

      <section id="near-you" className="bg-navy py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-3">
          {[
            {
              title: "Mapped Coverage",
              body: "Every listing shows its exact area drawn on an interactive map.",
            },
            {
              title: "Near You",
              body: "Allow location access to instantly see properties around you.",
            },
            {
              title: "Direct Contact",
              body: "Reach our team on WhatsApp in one tap, no forms lost in inboxes.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <h3 className="font-serif text-xl font-semibold text-gold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-beige/75">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
