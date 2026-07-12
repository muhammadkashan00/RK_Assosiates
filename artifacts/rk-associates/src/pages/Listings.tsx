import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { api, type Property } from "../lib/api"
import { PropertyGrid } from "../components/property/PropertyGrid"
import { FilterBar, emptyFilters, type Filters } from "../components/property/FilterBar"
import { Pagination } from "../components/property/Pagination"

const PAGE_SIZE = 12

type GeoErrorType = "denied" | "unavailable" | "timeout" | null

const geoErrorMessages: Record<NonNullable<GeoErrorType>, { title: string; body: string }> = {
  denied: {
    title: "Location access denied",
    body: "Allow location in your browser settings to use 'Near You', or browse all properties below.",
  },
  unavailable: {
    title: "Location unavailable",
    body: "Your device couldn't determine your position. Showing all properties instead.",
  },
  timeout: {
    title: "Location timed out",
    body: "It took too long to get your location. Showing all properties instead.",
  },
}

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
  const [page, setPage] = useState(1)
  const [geoError, setGeoError] = useState<GeoErrorType>(null)

  // Starts false when near=1 so we don't fire an empty fetch before coords arrive.
  const [geoReady, setGeoReady] = useState(!near)

  useEffect(() => {
    if (!near) {
      setGeoReady(true)
      setNearMode(false)
      setGeoError(null)
      return
    }
    if (!("geolocation" in navigator)) {
      setGeoError("unavailable")
      setGeoReady(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearMode(true)
        setGeoError(null)
        setGeoReady(true)
      },
      (err) => {
        if (err.code === 1) setGeoError("denied")
        else if (err.code === 2) setGeoError("unavailable")
        else setGeoError("timeout")
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

  useEffect(() => {
    setPage(1)
  }, [filters, nearMode, coords])

  const totalPages = Math.max(1, Math.ceil(properties.length / PAGE_SIZE))
  const pagedProperties = useMemo(
    () => properties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [properties, page],
  )

  function goToPage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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

      {/* Geo error banner */}
      {geoError && geoErrorMessages[geoError] && (
        <div className="mb-6 flex flex-col gap-1 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">{geoErrorMessages[geoError].title}</p>
            <p className="mt-0.5 text-xs text-amber-700">{geoErrorMessages[geoError].body}</p>
          </div>
          <Link
            to="/listings"
            className="mt-2 shrink-0 text-sm font-semibold text-gold-dark hover:underline sm:mt-0"
          >
            Browse all →
          </Link>
        </div>
      )}

      {/* Near You active banner */}
      {nearMode && coords && !geoError && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-gold/10 px-4 py-3 ring-1 ring-gold/30">
          <span className="text-sm text-navy">Showing results near your location.</span>
          <button
            onClick={() => setNearMode(false)}
            className="text-sm font-semibold text-gold-dark hover:underline"
          >
            Show all instead
          </button>
        </div>
      )}

      {!nearMode && !geoError && (
        <FilterBar filters={filters} onChange={(f) => { setFilters(f); setPage(1) }} />
      )}

      <PropertyGrid
        properties={pagedProperties}
        loading={loading}
        emptyMessage={
          nearMode
            ? "No properties found near your location."
            : "No properties match your search yet."
        }
      />

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      )}
    </div>
  )
}
