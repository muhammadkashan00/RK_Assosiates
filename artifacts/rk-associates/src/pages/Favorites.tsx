import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, type Property } from "../lib/api"
import { useFavorites } from "../context/FavoritesContext"
import { PropertyGrid } from "../components/property/PropertyGrid"

export default function Favorites() {
  const { favorites } = useFavorites()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (favorites.length === 0) {
      setProperties([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all(
      favorites.map((id) =>
        api
          .get<{ property: Property }>(`/properties/${id}`)
          .then((res) => res.property)
          .catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return
      setProperties(results.filter((p): p is Property => p !== null))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [favorites])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-navy dark:text-beige">Your Favorites</h1>
        <p className="mt-1 text-slate/70 dark:text-beige/60">
          Properties you've saved for later. Saved right here on this device.
        </p>
      </div>

      {!loading && properties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate/20 bg-white/50 p-12 text-center dark:border-white/10 dark:bg-navy-light/40">
          <p className="font-serif text-lg text-navy dark:text-beige">No favorites yet.</p>
          <p className="mt-1 text-sm text-slate/70 dark:text-beige/60">
            Tap the heart icon on any property to save it here.
          </p>
          <Link
            to="/listings"
            className="mt-6 inline-block rounded-xl bg-navy px-6 py-3 font-semibold text-beige dark:bg-gold dark:text-navy"
          >
            Browse properties
          </Link>
        </div>
      ) : (
        <PropertyGrid properties={properties} loading={loading} />
      )}
    </div>
  )
}
