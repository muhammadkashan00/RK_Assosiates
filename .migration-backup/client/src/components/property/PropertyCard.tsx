import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type { Property } from "../../lib/api"
import { formatPrice, formatNumber, statusLabels, statusStyles } from "../../lib/format"

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate/80">
      <span className="text-gold-dark">{icon}</span>
      {label}
    </span>
  )
}

export function PropertyCard({ property }: { property: Property }) {
  const cover = property.images[0]

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="group overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/5 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Link to={`/property/${property._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate/10">
          {cover ? (
            <img
              src={cover}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate/40">No image</div>
          )}
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
              statusStyles[property.status]
            }`}
          >
            {statusLabels[property.status]}
          </span>
          <span className="absolute bottom-3 right-3 rounded-lg bg-navy/90 px-3 py-1.5 font-serif text-sm font-semibold text-beige">
            {formatPrice(property.price)}
          </span>
        </div>

        <div className="p-5">
          <h3 className="line-clamp-1 font-serif text-lg font-semibold text-navy">
            {property.title}
          </h3>
          {property.buildingName && (
            <p className="mt-0.5 line-clamp-1 text-sm text-slate/70">{property.buildingName}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate/10 pt-4">
            <Spec
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 21V8l9-5 9 5v13" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              }
              label={`${formatNumber(property.rooms)} Rooms`}
            />
            <Spec
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M7 12V6a2 2 0 0 1 4 0" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              }
              label={`${formatNumber(property.baths)} Baths`}
            />
            <Spec
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              }
              label={`${formatNumber(property.areaSqft)} sqft`}
            />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
