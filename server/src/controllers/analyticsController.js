import { Visit } from "../models/Visit.js"
import { Lead } from "../models/Lead.js"
import { Property } from "../models/Property.js"
import { asyncHandler } from "../middleware/error.js"
import { getClientIp, anonymizeIp } from "../utils/network.js"

/**
 * FR-09: lightweight, self-hosted visitor tracking. Public endpoint.
 * IP is anonymized before storage. Geolocation is best-effort and opt-in.
 */
export const trackVisit = asyncHandler(async (req, res) => {
  const { pageVisited, referrer, sessionId, durationMs, visitorLocation } = req.body || {}
  const ip = anonymizeIp(getClientIp(req))

  let point
  if (
    visitorLocation &&
    Array.isArray(visitorLocation.coordinates) &&
    visitorLocation.coordinates.length === 2
  ) {
    const [lng, lat] = visitorLocation.coordinates.map(Number)
    if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
      point = { type: "Point", coordinates: [lng, lat] }
    }
  }

  await Visit.create({
    ip,
    visitorLocation: point,
    referrer: referrer || req.headers.referer || "",
    userAgent: req.headers["user-agent"] || "",
    pageVisited: pageVisited || "",
    sessionId: sessionId || "",
    durationMs: Number(durationMs) || 0,
  })

  res.status(204).end()
})

// Build a zero-filled day series so charts render continuously.
function fillDays(rows, days, valueKey) {
  const map = new Map(rows.map((r) => [r._id, r.count]))
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    out.push({ date: key.slice(5), [valueKey]: map.get(key) || 0 })
  }
  return out
}

/**
 * Admin analytics overview consumed by the dashboard.
 */
export const overview = asyncHandler(async (_req, res) => {
  const days = 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [properties, available, viewsAgg, leads, visits30d] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ status: "available", published: true }),
    Property.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
    Lead.countDocuments(),
    Visit.countDocuments({ timestamp: { $gte: since } }),
  ])

  const [visitRows, leadRows, topProperties] = await Promise.all([
    Visit.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    ]),
    Property.find().sort({ views: -1 }).limit(5).select("title views").lean(),
  ])

  res.json({
    totals: {
      properties,
      available,
      totalViews: viewsAgg[0]?.total || 0,
      leads,
      visits30d,
    },
    visitsByDay: fillDays(visitRows, days, "visits"),
    leadsByDay: fillDays(leadRows, days, "leads"),
    topProperties,
  })
})
