import { useRef } from "react"
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip, useMap } from "react-leaflet"
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { markerIcon } from "./markerIcon"

interface AreaMapProps {
  ring?: number[][]
  center?: { lat: number; lng: number }
  title?: string
  className?: string
}

function CenterControl({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap()
  if (!bounds) return null
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        right: 10,
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => map.fitBounds(bounds as LatLngBoundsExpression, { padding: [32, 32], maxZoom: 17 })}
        title="Center on coverage area"
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          background: "white",
          border: "2px solid rgba(0,0,0,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
    </div>
  )
}

export function AreaMap({ ring, center, title, className }: AreaMapProps) {
  // GeoJSON stores [lng, lat]; Leaflet needs [lat, lng]
  const positions: LatLngExpression[] = (ring ?? []).map(([lng, lat]) => [lat, lng])

  let mapCenter: LatLngExpression = center ? [center.lat, center.lng] : [24.8607, 67.0011]
  if (!center && positions.length) {
    const avgLat = positions.reduce((s, p) => s + (p as number[])[0], 0) / positions.length
    const avgLng = positions.reduce((s, p) => s + (p as number[])[1], 0) / positions.length
    mapCenter = [avgLat, avgLng]
  }

  // Build bounds for the center button
  const bounds: LatLngBoundsExpression | null =
    positions.length >= 2
      ? (positions as [number, number][])
      : center
      ? [[center.lat - 0.002, center.lng - 0.002], [center.lat + 0.002, center.lng + 0.002]]
      : null

  // Centroid of the polygon for the tooltip label
  const labelPos: LatLngExpression | null =
    positions.length >= 3
      ? [
          positions.reduce((s, p) => s + (p as number[])[0], 0) / positions.length,
          positions.reduce((s, p) => s + (p as number[])[1], 0) / positions.length,
        ]
      : null

  // Key changes whenever ring or center changes, forcing MapContainer to remount
  // and correctly display the updated polygon. This fixes the stale-render bug
  // where the polygon only appeared after multiple saves.
  const mapKey = JSON.stringify(ring ?? []) + JSON.stringify(center ?? {})

  return (
    <div className={className ?? "h-80 w-full overflow-hidden rounded-2xl ring-1 ring-navy/10"}>
      <div className="relative h-full w-full">
        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {positions.length >= 3 && (
            <Polygon
              positions={positions}
              pathOptions={{ color: "#c9a74b", weight: 2.5, fillColor: "#c9a74b", fillOpacity: 0.18 }}
            >
              {title && (
                <Tooltip
                  permanent
                  direction="center"
                  className="area-label-tooltip"
                  offset={[0, 0]}
                >
                  <span style={{ fontWeight: 600, fontSize: 12, color: "#1a2a3a", whiteSpace: "nowrap" }}>
                    {title}
                  </span>
                </Tooltip>
              )}
            </Polygon>
          )}
          {center && (
            <Marker position={[center.lat, center.lng]} icon={markerIcon}>
              {title && <Popup>{title}</Popup>}
            </Marker>
          )}
          <CenterControl bounds={bounds} />
        </MapContainer>
      </div>
    </div>
  )
}
