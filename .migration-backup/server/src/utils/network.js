/**
 * Extract the client IP from the request, honoring common proxy headers
 * (Render / Vercel sit behind proxies).
 */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"]
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim()
  }
  return req.socket?.remoteAddress || req.ip || ""
}

/**
 * Anonymize an IP for GDPR compliance by removing the last octet (IPv4)
 * or the last segments (IPv6). We never store the full address.
 */
export function anonymizeIp(ip) {
  if (!ip) return ""
  // Normalize IPv4-mapped IPv6 (e.g. ::ffff:1.2.3.4)
  const cleaned = ip.replace(/^::ffff:/, "")
  if (cleaned.includes(".")) {
    const parts = cleaned.split(".")
    if (parts.length === 4) {
      parts[3] = "0"
      return parts.join(".")
    }
  }
  if (cleaned.includes(":")) {
    const segments = cleaned.split(":")
    // Keep only the first 3 hextets, zero the rest.
    return segments.slice(0, 3).join(":") + "::"
  }
  return cleaned
}
