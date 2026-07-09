import { useMemo } from "react"
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet"
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

  return (
    <div className="space-y-2">
      <div className="h-80 w-full overflow-hidden rounded-xl ring-1 ring-navy/10">
        <MapContainer center={mapCenter} zoom={15} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
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
