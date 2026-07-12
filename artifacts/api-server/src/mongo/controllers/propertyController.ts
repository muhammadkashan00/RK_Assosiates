// @ts-nocheck
import { Property } from "../models/Property";
import { PropertyView } from "../models/PropertyView";
import { asyncHandler } from "../middleware/error";
import { uploadBuffer, cloudinaryConfigured } from "../config/cloudinary";

const SORTS = {
  newest: { createdAt: -1 },
  views: { views: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "area-desc": { areaSqft: -1 },
};

export const listProperties = asyncHandler(async (req, res) => {
  const wantAll = req.query.all === "1";
  const isAdmin = wantAll && req.user;

  const filter: any = {};
  if (!isAdmin) filter.published = true;

  if (!isAdmin) {
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.minRooms) filter.rooms = { $gte: Number(req.query.minRooms) };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      const rx = new RegExp(String(req.query.q).trim(), "i");
      filter.$or = [{ title: rx }, { buildingName: rx }, { address: rx }];
    }
  }

  const limit = Math.min(200, Number(req.query.limit) || 24);
  const sort = SORTS[req.query.sort as string] || SORTS.newest;

  const properties = await Property.find(filter).sort(sort).limit(limit).lean();
  res.json({ properties });
});

export const nearby = asyncHandler(async (req, res) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);
  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return res.status(400).json({ message: "lat and lng are required." });
  }
  const properties = await Property.find({
    published: true,
    area: {
      $geoIntersects: { $geometry: { type: "Point", coordinates: [lng, lat] } },
    },
  })
    .limit(24)
    .lean();
  res.json({ properties });
});

export const getOne = asyncHandler(async (req, res) => {
  const isAdmin = req.query.admin === "1" && req.user;
  const query = isAdmin ? { _id: req.params.id } : { _id: req.params.id, published: true };
  const property = await Property.findOne(query);
  if (!property) return res.status(404).json({ message: "Property not found." });

  if (isAdmin) {
    return res.json({ property });
  }

  let related = [];
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
      .lean();
  }
  if (related.length === 0) {
    related = await Property.find({ _id: { $ne: property._id }, published: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
  }

  res.json({ property: property.toObject(), related });
});

/**
 * POST /properties/:id/view
 * Explicit view-tracking endpoint. Accepts an optional `fingerprintHash`
 * (16-char hex from the frontend's Web Crypto fingerprint). Deduplicates
 * within 24 h using the fingerprint when provided, IP address otherwise.
 * Returns 200 whether the view is new or deduplicated (client doesn't need to know).
 */
export const trackView = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, published: true }).select("_id");
  if (!property) return res.status(404).json({ message: "Property not found." });

  // Accept fingerprint from body (preferred) or header fallback
  const raw = req.body?.fingerprintHash ?? req.headers["x-device-fingerprint"] ?? "";
  const fingerprintHash =
    typeof raw === "string" && /^[0-9a-f]{8,64}$/i.test(raw) ? raw.toLowerCase() : null;

  const ip = String(
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );

  try {
    const doc: Record<string, unknown> = { propertyId: property._id, ip };
    if (fingerprintHash) doc.fingerprintHash = fingerprintHash;
    await PropertyView.create(doc);
    // New unique view — increment counter atomically
    await Property.findByIdAndUpdate(property._id, { $inc: { views: 1 } });
  } catch (err: any) {
    // E11000 duplicate key = already viewed within 24 h — silently ignore
    if (err?.code !== 11000) throw err;
  }

  res.json({ ok: true });
});

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured) {
    return res.status(400).json({ message: "Media uploads are not configured (Cloudinary keys missing)." });
  }
  const files = [...(req.files?.images || []), ...(req.files?.video || [])];
  if (files.length === 0) return res.status(400).json({ message: "No files uploaded." });

  const urls = [];
  for (const file of files) {
    const type = file.mimetype.startsWith("video/") ? "video" : "image";
    const result: any = await uploadBuffer(file.buffer, type);
    urls.push(result.secure_url);
  }
  res.json({ urls });
});

export const createProperty = asyncHandler(async (req, res) => {
  const data = req.body || {};
  if (!data.title || data.price === undefined || data.price === "") {
    return res.status(400).json({ message: "Title and price are required." });
  }
  const property = await Property.create(data);
  res.status(201).json({ property });
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!property) return res.status(404).json({ message: "Property not found." });
  res.json({ property });
});

export const setPublish = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found." });
  property.published =
    typeof req.body?.published === "boolean" ? req.body.published : !property.published;
  await property.save();
  res.json({ property });
});

export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found." });
  res.json({ ok: true });
});
