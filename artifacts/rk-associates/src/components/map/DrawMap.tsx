import { useCallback, useMemo, useRef, useState } from "react"
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
    map.flyTo(coord, 16, { duration: 1.2 })
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
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)

  const positions: LatLngExpression[] = useMemo(
    () => points.map(([lng, lat]) => [lat, lng] as LatLngExpression),
    [points],
  )

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

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Karachi")}&limit=5&viewbox=66.8,25.2,67.5,24.5&bounded=1`
      const res = await fetch(url, { headers: { "Accept-Language": "en" } })
      const data: NominatimResult[] = await res.json()
      setResults(data)
    } catch {
      /* ignore */
    } finally {
      setSearching(false)
    }
  }, [query])

  function pickResult(r: NominatimResult) {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)
    setFlyTarget([lat, lng])
    setResults([])
    setQuery(r.display_name.split(",")[0])
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/40"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="w-full rounded-lg border border-slate/20 bg-white py-2 pl-9 pr-3 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              placeholder="Search location in Karachi..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setResults([]) }}
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-beige transition hover:bg-navy-light disabled:opacity-60"
          >
            {searching ? "..." : "Go"}
          </button>
        </div>
        {results.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-xl border border-slate/10 bg-white shadow-lg">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pickResult(r)}
                  className="w-full px-4 py-2.5 text-left text-sm text-navy hover:bg-gold/10 first:rounded-t-xl last:rounded-b-xl"
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="h-80 w-full overflow-hidden rounded-xl ring-1 ring-navy/10">
        <MapContainer center={mapCenter} zoom={15} scrollWheelZoom className="h-full w-full">
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
          {points.length} point{points.length === 1 ? "" : "s"} — click the map to add, drag to
          adjust
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={removeLast}
            disabled={!points.length}
            className="rounded-lg border border-slate/20 px-3 py-1.5 font-medium text-slate transition hover:bg-slate/5 disabled:opacity-40"
          >
            Undo point
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
