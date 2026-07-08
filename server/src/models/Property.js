import mongoose from "mongoose"

const { Schema } = mongoose

// GeoJSON Polygon sub-schema. Coordinates follow the GeoJSON spec: [lng, lat].
// The outer ring must be closed (first point === last point). A 2dsphere index
// enables $geoIntersects queries for "Properties Near You".
const polygonSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Polygon"],
      default: "Polygon",
    },
    coordinates: {
      type: [[[Number]]],
      default: undefined,
    },
  },
  { _id: false },
)

const propertySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    markdownDescription: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    areaSqft: { type: Number, required: true, min: 0 },
    rooms: { type: Number, default: 0, min: 0 },
    baths: { type: Number, default: 0, min: 0 },
    buildingName: { type: String, default: "", trim: true },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    // Area highlight polygon (general neighborhood, never the exact address).
    areaHighlight: { type: polygonSchema, default: undefined },
    // Approximate center used only for sorting/labeling, derived from polygon.
    areaLabel: { type: String, default: "" },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["available", "under-construction", "sold"],
      default: "available",
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// Text index for search on title, building name and tags.
propertySchema.index({ title: "text", buildingName: "text", areaLabel: "text", tags: "text" })
// Geospatial index for polygon containment queries.
propertySchema.index({ areaHighlight: "2dsphere" })
propertySchema.index({ isPublished: 1, createdAt: -1 })

export const Property = mongoose.models.Property || mongoose.model("Property", propertySchema)
