import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type { Property } from "../../lib/api"
import { formatPrice, formatNumber, statusLabels, statusStyles } from "../../lib/format"
import { FavoriteButton } from "./FavoriteButton"

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-black sm:text-xs dark:text-white">
      <span className="text-gold-dark">{icon}</span>
      {label}
    </span>
  )
}

export function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const cover = property.images[0]

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      className="group overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-navy/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <Link to={`/property/${property._id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-slate/10">
          {cover ? (
            <img
              src={cover}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-slate/40">
              No image
            </div>
          )}
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              statusStyles[property.status]
            }`}
          >
            {statusLabels[property.status]}
          </span>
          <FavoriteButton
            propertyId={property._id}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-navy/5 transition dark:bg-navy-light/90 dark:ring-white/10"
          />
          <span className="absolute bottom-2 right-2 rounded-md bg-navy/90 px-2 py-1 font-serif text-xs font-semibold text-beige">
            {formatPrice(property.price)}
          </span>
        </div>

        <div className="p-2 sm:p-3">
          <h3 className="line-clamp-1 font-serif text-sm font-semibold text-navy">
            {property.title}
          </h3>
          {property.address && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate/60 dark:text-beige/60">
              {property.address}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-slate/10 pt-2">
            {property.rooms > 0 && (
              <Spec
                icon={
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 21V8l9-5 9 5v13" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                }
                label={`${formatNumber(property.rooms)} bd`}
              />
            )}
            {property.baths > 0 && (
              <Spec
                icon={
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path d="M7 12V6a2 2 0 0 1 4 0" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                }
                label={`${formatNumber(property.baths)} ba`}
              />
            )}
            {(property.areaText || property.areaSqft > 0) && (
              <Spec
                icon={
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                }
                label={property.areaText || `${formatNumber(property.areaSqft)} ft²`}
              />
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
