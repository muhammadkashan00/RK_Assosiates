import { Property } from "../models/Property.js"
import { asyncHandler } from "../middleware/error.js"
import { uploadBuffer, cloudinaryConfigured } from "../config/cloudinary.js"
import { normalizePolygon } from "../utils/geo.js"

/* ----------------------------- Public queries ---------------------------- */

// Build a filter for public listing (only published properties).
function buildPublicFilter(query) {
  const filter = { isPublished: true }

  if (query.minPrice || query.maxPrice) {
    filter.price = {}
    if (query.minPrice) filter.price.$gte = Number(query.minPrice)
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice)
  }
  if (query.rooms) filter.rooms = { $gte: Number(query.rooms) }
  if (query.minArea || query.maxArea) {
    filter.areaSqft = {}
    if (query.minArea) filter.areaSqft.$gte = Number(query.minArea)
    if (query.maxArea) filter.areaSqft.$lte = Number(query.maxArea)
  }
  if (query.status) filter.status = query.status
  if (query.tag) filter.tags = query.tag
  if (query.q) filter.$text = { $search: String(query.q) }
  return filter
}

export const listPublic = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(48, Number(req.query.limit) || 12)
  const filter = buildPublicFilter(req.query)

  const [items, total] = await Promise.all([
    Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Property.countDocuments(filter),
  ])

  res.json({ items, total, page, pages: Math.ceil(total / limit) })
})

export const getPublicOne = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, isPublished: true }).lean()
  if (!property) return res.status(404).json({ error: "Property not found." })
  res.json({ property })
})

// FR-11: properties whose highlighted area contains the visitor's location.
export const nearby = asyncHandler(async (req, res) => {
  const lng = Number(req.query.lng)
  const lat = Number(req.query.lat)
  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return res.status(400).json({ error: "lng and lat are required." })
  }
  const items = await Property.find({
    isPublished: true,
    areaHighlight: {
      $geoIntersects: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
      },
    },
  })
    .limit(12)
    .lean()
  res.json({ items })
})

export const distinctTags = asyncHandler(async (req, res) => {
  const tags = await Property.distinct("tags", { isPublished: true })
  res.json({ tags: tags.filter(Boolean).sort() })
})

/* ------------------------------- Admin CRUD ------------------------------ */

function parseBody(body) {
  const data = { ...body }
  // Numbers can arrive as strings from multipart forms.
  for (const key of ["price", "areaSqft", "rooms", "baths"]) {
    if (data[key] !== undefined && data[key] !== "") data[key] = Number(data[key])
  }
  if (typeof data.tags === "string") {
    data.tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  }
  if (typeof data.areaHighlight === "string" && data.areaHighlight) {
    try {
      data.areaHighlight = JSON.parse(data.areaHighlight)
    } catch {
      data.areaHighlight = undefined
    }
  }
  if (data.areaHighlight) {
    const normalized = normalizePolygon(data.areaHighlight)
    data.areaHighlight = normalized || undefined
  }
  if (typeof data.isPublished === "string") {
    data.isPublished = data.isPublished === "true"
  }
  if (typeof data.existingImages === "string") {
    try {
      data.existingImages = JSON.parse(data.existingImages)
    } catch {
      data.existingImages = []
    }
  }
  if (typeof data.existingVideos === "string") {
    try {
      data.existingVideos = JSON.parse(data.existingVideos)
    } catch {
      data.existingVideos = []
    }
  }
  return data
}

async function handleUploads(files) {
  const images = []
  const videos = []
  if (!files || files.length === 0) return { images, videos }
  if (!cloudinaryConfigured) {
    throw Object.assign(new Error("Media uploads are not configured (Cloudinary keys missing)."), {
      status: 400,
      expose: true,
    })
  }
  for (const file of files) {
    const type = file.mimetype.startsWith("video/") ? "video" : "image"
    const result = await uploadBuffer(file.buffer, type)
    if (type === "video") videos.push(result.secure_url)
    else images.push(result.secure_url)
  }
  return { images, videos }
}

export const listAdmin = asyncHandler(async (req, res) => {
  const items = await Property.find().sort({ createdAt: -1 }).lean()
  res.json({ items })
})

export const getAdminOne = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).lean()
  if (!property) return res.status(404).json({ error: "Property not found." })
  res.json({ property })
})

export const createProperty = asyncHandler(async (req, res) => {
  const data = parseBody(req.body)
  if (!data.title || data.price === undefined || data.areaSqft === undefined) {
    return res.status(400).json({ error: "Title, price and area are required." })
  }
  const { images, videos } = await handleUploads(req.files)
  const property = await Property.create({
    ...data,
    images: [...(data.existingImages || []), ...images],
    videos: [...(data.existingVideos || []), ...videos],
  })
  res.status(201).json({ property })
})

export const updateProperty = asyncHandler(async (req, res) => {
  const data = parseBody(req.body)
  const { images, videos } = await handleUploads(req.files)

  const update = { ...data }
  delete update.existingImages
  delete update.existingVideos
  update.images = [...(data.existingImages || []), ...images]
  update.videos = [...(data.existingVideos || []), ...videos]

  const property = await Property.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  })
  if (!property) return res.status(404).json({ error: "Property not found." })
  res.json({ property })
})

export const togglePublish = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
  if (!property) return res.status(404).json({ error: "Property not found." })
  property.isPublished = !property.isPublished
  await property.save()
  res.json({ property })
})

export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id)
  if (!property) return res.status(404).json({ error: "Property not found." })
  res.json({ ok: true })
})
