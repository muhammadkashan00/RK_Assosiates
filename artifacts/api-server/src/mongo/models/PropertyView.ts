import mongoose, { Schema } from "mongoose";

const PropertyViewSchema = new Schema(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    ip: { type: String, required: true },
    /**
     * SHA-256 hex of canvas + userAgent + screen + timezone + language (first 16 chars).
     * When present, this is the primary deduplication key (preferred over IP).
     */
    fingerprintHash: { type: String },
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // TTL: 24 h
  },
  { versionKey: false },
);

// Fingerprint-based deduplication (primary) — one device per property per 24 h
// sparse: true so documents without fingerprintHash don't collide on null
PropertyViewSchema.index(
  { propertyId: 1, fingerprintHash: 1 },
  { unique: true, sparse: true },
);

// IP-based fallback — one IP per property per 24 h (catches fingerprint-less clients)
PropertyViewSchema.index({ propertyId: 1, ip: 1 }, { unique: true });

export const PropertyView = mongoose.model("PropertyView", PropertyViewSchema);
