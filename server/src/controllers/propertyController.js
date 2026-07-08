import { Property } from "../models/Property.js"
import { asyncHandler } from "../middleware/error.js"
import { uploadBuffer, cloudinaryConfigured } from "../config/cloudinary.js"

const SORTS = {
  newest: { createdAt: -1 },
  views: { views: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "area-desc": { areaSqft: -1 },
}

/* ------------------------------ List (public + admin) --------------------- */

// The client always sends the Bearer token; `optionalAuth` populates req.user
// when it is valid. `?all=1` returns every property but ONLY for authed admins.
export const listProperties = asyncHandler(async (req, res) => {
  const wantAll = req.query.all === "1"
  const isAdmin = wantAll && req.user

  const filter = {}
  if (!isAdmin) filter.published = true

  if (!isAdmin) {
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {}
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice)
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice)
    }
    if (req.query.minRooms) filter.rooms = { $gte: Number(req.query.minRooms) }
    if (req.query.status) filter.status = req.query.status
    if (req.query.q) {
      const rx = new RegExp(String(req.query.q).trim(), "i")
      filter.$or = [{ title: rx }, { buildingName: rx }, { address: rx }]
    }
  }

  const limit = Math.min(200, Number(req.query.limit) || 24)
  const sort = SORTS[req.query.sort] || SORTS.newest

  const properties = await Property.find(filter).sort(sort).limit(limit).lean()
  res.json({ properties })
})

// FR-11: properties whose highlighted area contains the visitor's location.
export const nearby = asyncHandler(async (req, res) => {
  const lng = Number(req.query.lng)
  const lat = Number(req.query.lat)
  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return res.status(400).json({ message: "lat and lng are required." })
  }
  const properties = await Property.find({
    published: true,
    area: {
      $geoIntersects: { $geometry: { type: "Point", coordinates: [lng, lat] } },
    },
  })
    .limit(24)
    .lean()
  res.json({ properties })
})

/* ------------------------------- Get one --------------------------------- */

export const getOne = asyncHandler(async (req, res) => {
  const isAdmin = req.query.admin === "1" && req.user
  const query = isAdmin ? { _id: req.params.id } : { _id: req.params.id, published: true }
  const property = await Property.findOne(query)
  if (!property) return res.status(404).json({ message: "Property not found." })

  if (isAdmin) {
    return res.json({ property })
  }

  // Count a public view.
  property.views = (property.views || 0) + 1
  await property.save()

  // "Nearby" related = other published properties whose area intersects this
  // property's marker; fall back to most recent listings.
  let related = []
  if (property.marker?.lng != null && property.marker?.lat != null) {
    related = await Property.find({
      _id: { $ne: property._id },
      published: true,
      area: {
        $geoIntersects: {
          $geometry: { type: "Point", coordinates: [property.marker.lng, property.marker.lat] },
        },
      },
    })
      .limit(3)
      .lean()
  }
  if (related.length === 0) {
    related = await Property.find({ _id: { $ne: property._id }, published: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
  }

  res.json({ property: property.toObject(), related })
})

/* ------------------------------- Admin CRUD ------------------------------ */

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured) {
    return res.status(400).json({ message: "Media uploads are not configured (Cloudinary keys missing)." })
  }
  const files = [...(req.files?.images || []), ...(req.files?.video || [])]
  if (files.length === 0) return res.status(400).json({ message: "No files uploaded." })

  const urls = []
  for (const file of files) {
    const type = file.mimetype.startsWith("video/") ? "video" : "image"
    const result = await uploadBuffer(file.buffer, type)
    urls.push(result.secure_url)
  }
  res.json({ urls })
})

export const createProperty = asyncHandler(async (req, res) => {
  const data = req.body || {}
  if (!data.title || data.price === undefined || data.price === "") {
    return res.status(400).json({ message: "Title and price are required." })
  }
  const property = await Property.create(data)
  res.status(201).json({ property })
})

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!property) return res.status(404).json({ message: "Property not found." })
  res.json({ property })
})

export const setPublish = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
  if (!property) return res.status(404).json({ message: "Property not found." })
  property.published =
    typeof req.body?.published === "boolean" ? req.body.published : !property.published
  await property.save()
  res.json({ property })
})

export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id)
  if (!property) return res.status(404).json({ message: "Property not found." })
  res.json({ ok: true })
})
