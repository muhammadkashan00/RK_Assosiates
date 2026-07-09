import { MapContainer, TileLayer, Polygon, Marker, Popup } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"
import { markerIcon } from "./markerIcon"

interface AreaMapProps {
  ring?: number[][]
  center?: { lat: number; lng: number }
  title?: string
  className?: string
}

export function AreaMap({ ring, center, title, className }: AreaMapProps) {
  const positions: LatLngExpression[] = (ring ?? []).map(([lng, lat]) => [lat, lng])

  let mapCenter: LatLngExpression = center ? [center.lat, center.lng] : [24.8607, 67.0011]
  if (!center && positions.length) {
    const avgLat = positions.reduce((s, p) => s + (p as number[])[0], 0) / positions.length
    const avgLng = positions.reduce((s, p) => s + (p as number[])[1], 0) / positions.length
    mapCenter = [avgLat, avgLng]
  }

  return (
    <div className={className ?? "h-80 w-full overflow-hidden rounded-2xl ring-1 ring-navy/10"}>
      <MapContainer center={mapCenter} zoom={15} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positions.length >= 3 && (
          <Polygon
            positions={positions}
            pathOptions={{ color: "#c9a24b", weight: 2, fillColor: "#c9a24b", fillOpacity: 0.15 }}
          />
        )}
        {center && (
          <Marker position={[center.lat, center.lng]} icon={markerIcon}>
            {title && <Popup>{title}</Popup>}
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
