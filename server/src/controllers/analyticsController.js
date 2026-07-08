import { Visit } from "../models/Visit.js"
import { Lead } from "../models/Lead.js"
import { Property } from "../models/Property.js"
import { asyncHandler } from "../middleware/error.js"
import { getClientIp, anonymizeIp } from "../utils/network.js"
import { lookupIpLocation } from "../utils/geo.js"

/**
 * FR-09: lightweight, self-hosted visitor tracking. Public endpoint.
 * IP is anonymized before storage. Geolocation is best-effort.
 */
export const trackVisit = asyncHandler(async (req, res) => {
  const { pageVisited, referrer, sessionId, durationMs, visitorLocation } = req.body || {}
  const rawIp = getClientIp(req)
  const ip = anonymizeIp(rawIp)

  // Best-effort IP geolocation (non-blocking failure).
  const location = await lookupIpLocation(rawIp)

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
    location,
    visitorLocation: point,
    referrer: referrer || req.headers.referer || "",
    userAgent: req.headers["user-agent"] || "",
    pageVisited: pageVisited || "",
    sessionId: sessionId || "",
    durationMs: Number(durationMs) || 0,
  })

  res.status(204).end()
})

/**
 * Admin analytics summary: totals, time series, top pages, geo breakdown.
 */
export const analyticsSummary = asyncHandler(async (req, res) => {
  const days = Math.min(90, Number(req.query.days) || 30)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [totalVisits, recentVisits, totalLeads, recentLeads, published, drafts] = await Promise.all([
    Visit.countDocuments(),
    Visit.countDocuments({ timestamp: { $gte: since } }),
    Lead.countDocuments(),
    Lead.countDocuments({ timestamp: { $gte: since } }),
    Property.countDocuments({ isPublished: true }),
    Property.countDocuments({ isPublished: false }),
  ])

  const timeseries = await Visit.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        visits: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const topPages = await Visit.aggregate([
    { $match: { timestamp: { $gte: since } } },
    { $group: { _id: "$pageVisited", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ])

  const byCountry = await Visit.aggregate([
    { $match: { timestamp: { $gte: since }, "location.country": { $ne: "" } } },
    { $group: { _id: "$location.country", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ])

  const topReferrers = await Visit.aggregate([
    { $match: { timestamp: { $gte: since }, referrer: { $ne: "" } } },
    { $group: { _id: "$referrer", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ])

  res.json({
    days,
    totals: { totalVisits, recentVisits, totalLeads, recentLeads, published, drafts },
    timeseries,
    topPages,
    byCountry,
    topReferrers,
  })
})
