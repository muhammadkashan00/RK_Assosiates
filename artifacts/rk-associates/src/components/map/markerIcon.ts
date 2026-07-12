import L from "leaflet"

const svg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
  <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26C32 7.2 24.8 0 16 0z" fill="#1e2a44"/>
  <circle cx="16" cy="16" r="6" fill="#c9a24b"/>
</svg>`)

export const markerIcon = L.icon({
  iconUrl: `data:image/svg+xml,${svg}`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
})
