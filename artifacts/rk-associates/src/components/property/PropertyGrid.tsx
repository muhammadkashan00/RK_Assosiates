import { PropertyCard } from "./PropertyCard"
import type { Property } from "../../lib/api"

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-navy/5">
      <div className="aspect-video animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-slate/10 via-slate/5 to-slate/10 bg-[length:200%_100%]" />
      <div className="space-y-2 p-2 sm:p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate/10" />
        <div className="flex gap-2 border-t border-slate/10 pt-2">
          <div className="h-3 w-10 animate-pulse rounded bg-slate/10" />
          <div className="h-3 w-10 animate-pulse rounded bg-slate/10" />
          <div className="h-3 w-12 animate-pulse rounded bg-slate/10" />
        </div>
      </div>
    </div>
  )
}

export function PropertyGrid({
  properties,
  loading,
  emptyMessage = "No properties match your search yet.",
}: {
  properties: Property[]
  loading?: boolean
  emptyMessage?: string
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!properties.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate/20 bg-white/50 p-12 text-center">
        <p className="font-serif text-lg text-navy">{emptyMessage}</p>
        <p className="mt-1 text-sm text-slate/70">
          Try adjusting your filters or check back soon.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, i) => (
        <PropertyCard key={property._id} property={property} index={i} />
      ))}
    </div>
  )
}
