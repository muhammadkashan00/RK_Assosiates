import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { api, type Property } from "../lib/api"
import { PropertyGrid } from "../components/property/PropertyGrid"
import { FilterBar, emptyFilters, type Filters } from "../components/property/FilterBar"

function buildQuery(filters: Filters): string {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.status) params.set("status", filters.status)
  if (filters.minPrice) params.set("minPrice", filters.minPrice)
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)
  if (filters.minRooms) params.set("minRooms", filters.minRooms)
  if (filters.sort) params.set("sort", filters.sort)
  return params.toString()
}

export default function Listings() {
  const [searchParams] = useSearchParams()
  const near = searchParams.get("near") === "1"

  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [nearMode, setNearMode] = useState(near)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (nearMode && coords) {
        const res = await api.get<{ properties: Property[] }>(
          `/properties/near?lat=${coords.lat}&lng=${coords.lng}`,
        )
        setProperties(res.properties)
      } else {
        const res = await api.get<{ properties: Property[] }>(`/properties?${buildQuery(filters)}`)
        setProperties(res.properties)
      }
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [filters, nearMode, coords])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (near && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setNearMode(true)
        },
        () => setNearMode(false),
        { enableHighAccuracy: true, timeout: 8000 },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-navy">
          {nearMode && coords ? "Properties Near You" : "All Properties"}
        </h1>
        <p className="mt-1 text-slate/70">
          {nearMode && coords
            ? "Sorted by distance from your current location."
            : "Browse our full portfolio and filter to find the right fit."}
        </p>
      </div>

      {nearMode && coords ? (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-gold/10 px-4 py-3 ring-1 ring-gold/30">
          <span className="text-sm text-navy">Showing results near your location.</span>
          <button
            onClick={() => setNearMode(false)}
            className="text-sm font-semibold text-gold-dark hover:underline"
          >
            Show all instead
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <FilterBar value={filters} onChange={setFilters} onReset={() => setFilters(emptyFilters)} />
        </div>
      )}

      <PropertyGrid properties={properties} loading={loading} />
    </div>
  )
}
