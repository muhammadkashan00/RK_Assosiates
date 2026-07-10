import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { api, type Property } from "../lib/api"
import { PropertyGrid } from "../components/property/PropertyGrid"
import { FilterBar, emptyFilters, type Filters } from "../components/property/FilterBar"

function buildQuery(filters: Filters): string {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.status) params.set("status", filters.status)
  if (filters.sort) params.set("sort", filters.sort)
  return params.toString()
}

export default function Listings() {
  const [searchParams] = useSearchParams()
  const near = searchParams.get("near") === "1"

  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [nearMode, setNearMode] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Use state (not ref) so the load effect re-fires once GPS resolves.
  // Starts false when near=1 so we don't fire an empty fetch before coords arrive.
  const [geoReady, setGeoReady] = useState(!near)

  useEffect(() => {
    if (!near) {
      setGeoReady(true)
      setNearMode(false)
      return
    }
    if (!("geolocation" in navigator)) {
      setGeoReady(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearMode(true)
        setGeoReady(true)
      },
      () => {
        setNearMode(false)
        setGeoReady(true)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [near])

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
    if (!geoReady) return
    load()
  }, [load, geoReady])

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

      {!geoReady ? (
        <div className="flex flex-col items-center gap-3 py-20 text-slate/60">
          <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-sm">Getting your location…</span>
        </div>
      ) : (
        <PropertyGrid properties={properties} loading={loading} />
      )}
    </div>
  )
}
