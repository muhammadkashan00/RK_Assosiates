import mongoose from "mongoose"

const { Schema } = mongoose

// GeoJSON Polygon following the spec: coordinates are [lng, lat] and the outer
// ring must be closed (first point === last point). A 2dsphere index enables
// $geoIntersects queries for "Properties Near You" (FR-11).
const polygonSchema = new Schema(
  {
    type: { type: String, enum: ["Polygon"], default: "Polygon" },
    coordinates: { type: [[[Number]]], default: undefined },
  },
  { _id: false },
)

const propertySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    buildingName: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    rooms: { type: Number, default: 0, min: 0 },
    baths: { type: Number, default: 0, min: 0 },
    areaSqft: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
    },
    published: { type: Boolean, default: true },
    images: { type: [String], default: [] },
    video: { type: String, default: "" },
    // Highlighted coverage area (never the exact address) drawn by the admin.
    area: { type: polygonSchema, default: undefined },
    // Approximate center, derived from the polygon on the client.
    marker: {
      lat: { type: Number },
      lng: { type: Number },
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
)

propertySchema.index({ title: "text", buildingName: "text", address: "text" })
propertySchema.index({ area: "2dsphere" })
propertySchema.index({ published: 1, createdAt: -1 })

export const Property = mongoose.models.Property || mongoose.model("Property", propertySchema)
