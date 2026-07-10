import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MapContainer, TileLayer, Polygon, Marker, useMap, useMapEvents } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const vertexIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#c9a24b;border:2px solid #1e2a44;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function ClickCapture({ onAdd }: { onAdd: (lng: number, lat: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lng, e.latlng.lat)
    },
  })
  return null
}

function FlyTo({ coord }: { coord: [number, number] | null }) {
  const map = useMap()
  const prev = useRef<[number, number] | null>(null)
  if (coord && coord !== prev.current) {
    prev.current = coord
    map.flyTo(coord, 15, { duration: 1.2 })
  }
  return null
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

export function DrawMap({
  points,
  onChange,
  center,
}: {
  points: number[][]
  onChange: (points: number[][]) => void
  center?: { lat: number; lng: number }
}) {
  const mapCenter: LatLngExpression = center ? [center.lat, center.lng] : [24.8607, 67.0011]
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const positions: LatLngExpression[] = useMemo(
    () => points.map(([lng, lat]) => [lat, lng] as LatLngExpression),
    [points],
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    setLoading(true)
    try {
      // Karachi bounding box: lon 66.8–67.5, lat 24.5–25.2
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", Karachi")}&limit=6&viewbox=66.8,25.2,67.5,24.5&bounded=1&addressdetails=0`
      const res = await fetch(url, { headers: { "Accept-Language": "en" } })
      const data: NominatimResult[] = await res.json()
      setSuggestions(data)
      setShowDropdown(data.length > 0)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350)
  }

  function pickSuggestion(r: NominatimResult) {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)
    setFlyTarget([lat, lng])
    setSuggestions([])
    setShowDropdown(false)
    setQuery(r.display_name.split(",")[0])
  }

  function addPoint(lng: number, lat: number) {
    onChange([...points, [lng, lat]])
  }

  function movePoint(index: number, lat: number, lng: number) {
    const next = points.map((p, i) => (i === index ? [lng, lat] : p))
    onChange(next)
  }

  function removeLast() {
    onChange(points.slice(0, -1))
  }

  return (
    <div className="space-y-2">
      {/* Search bar with live suggestions */}
      <div ref={wrapperRef} className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-slate/20 bg-white px-3 py-2 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30 transition">
          {loading ? (
            <svg className="animate-spin text-slate/40 flex-shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
            </svg>
          ) : (
            <svg className="text-slate/40 flex-shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          <input
            className="flex-1 text-sm text-navy outline-none bg-transparent placeholder:text-slate/40"
            placeholder="Search area in Karachi..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSuggestions([]); setShowDropdown(false) }}
              className="text-slate/40 hover:text-slate/70 transition flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-[9999] mt-1.5 w-full rounded-xl border border-slate/10 bg-white shadow-xl overflow-hidden">
            {suggestions.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSuggestion(r)}
                  className="flex items-start gap-2.5 w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-gold/10 transition"
                >
                  <svg className="mt-0.5 flex-shrink-0 text-gold" width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="currentColor" />
                  </svg>
                  <span className="line-clamp-2 text-sm leading-snug">
                    <span className="font-medium">{r.display_name.split(",")[0]}</span>
                    <span className="text-slate/50">{r.display_name.split(",").slice(1, 3).join(",")}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-80 w-full overflow-hidden rounded-xl ring-1 ring-navy/10">
        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo coord={flyTarget} />
          <ClickCapture onAdd={addPoint} />
          {positions.length >= 2 && (
            <Polygon
              positions={positions}
              pathOptions={{ color: "#c9a24b", weight: 2, fillColor: "#c9a24b", fillOpacity: 0.15 }}
            />
          )}
          {positions.map((pos, i) => (
            <Marker
              key={i}
              position={pos}
              icon={vertexIcon}
              draggable
              eventHandlers={{
                dragend(e) {
                  const m = e.target as L.Marker
                  const ll = m.getLatLng()
                  movePoint(i, ll.lat, ll.lng)
                },
              }}
            />
          ))}
        </MapContainer>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate/70">
          {points.length} point{points.length === 1 ? "" : "s"} — click map to add, drag to adjust
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={removeLast}
            disabled={!points.length}
            className="rounded-lg border border-slate/20 px-3 py-1.5 font-medium text-slate transition hover:bg-slate/5 disabled:opacity-40"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={!points.length}
            className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
