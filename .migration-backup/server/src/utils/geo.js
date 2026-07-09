/**
 * Validate and normalize a GeoJSON Polygon coming from the client.
 * Returns a closed-ring polygon in [lng, lat] order, or null if invalid.
 */
export function normalizePolygon(polygon) {
  if (!polygon || polygon.type !== "Polygon" || !Array.isArray(polygon.coordinates)) {
    return null
  }
  const ring = polygon.coordinates[0]
  if (!Array.isArray(ring) || ring.length < 3) return null

  const cleaned = ring
    .filter((pt) => Array.isArray(pt) && pt.length === 2 && pt.every((n) => typeof n === "number"))
    .map(([lng, lat]) => [lng, lat])

  if (cleaned.length < 3) return null

  // Ensure the ring is closed.
  const first = cleaned[0]
  const last = cleaned[cleaned.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) {
    cleaned.push([first[0], first[1]])
  }

  return { type: "Polygon", coordinates: [cleaned] }
}

/**
 * Lightweight IP geolocation using the free ipapi.co service.
 * Falls back gracefully to empty fields on failure.
 */
export async function lookupIpLocation(ip) {
  const empty = { city: "", region: "", country: "" }
  if (!ip || ip.startsWith("127.") || ip === "::1" || ip.startsWith("192.168.")) {
    return empty
  }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: controller.signal })
    clearTimeout(t)
    if (!res.ok) return empty
    const data = await res.json()
    return {
      city: data.city || "",
      region: data.region || "",
      country: data.country_name || "",
    }
  } catch {
    return empty
  }
}
