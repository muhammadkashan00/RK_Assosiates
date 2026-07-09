import mongoose from "mongoose"

const { Schema } = mongoose

const pointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: undefined }, // [lng, lat]
  },
  { _id: false },
)

const visitSchema = new Schema(
  {
    ip: { type: String }, // anonymized (last octet / segment removed)
    location: {
      city: { type: String, default: "" },
      region: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    visitorLocation: { type: pointSchema, default: undefined },
    referrer: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    pageVisited: { type: String, default: "" },
    sessionId: { type: String, index: true },
    durationMs: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

visitSchema.index({ timestamp: -1 })
visitSchema.index({ visitorLocation: "2dsphere" })

export const Visit = mongoose.models.Visit || mongoose.model("Visit", visitSchema)
