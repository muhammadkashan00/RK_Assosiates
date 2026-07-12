import mongoose, { Schema } from "mongoose";

/**
 * Tracks unique property views for deduplication within a 24-hour window.
 *
 * deduplicationKey is always populated — it is either:
 *   • the device fingerprint hash sent by the frontend (16-char hex), or
 *   • "ip:<anonymized-ip>" as a fallback for clients that don't send a fingerprint.
 *
 * A single unique compound index on (propertyId, deduplicationKey) ensures
 * one view increment per device (or per IP when no fingerprint is available)
 * per property per 24 hours. This avoids the prior dual-index design where
 * an IP constraint would collapse views from different devices on the same NAT.
 */
const PropertyViewSchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    deduplicationKey: {
      type: String,
      required: true,
    },
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // TTL: 24 h
  },
  { versionKey: false },
);

// One view per device/IP per property per 24 h
PropertyViewSchema.index({ propertyId: 1, deduplicationKey: 1 }, { unique: true });

export const PropertyView = mongoose.model("PropertyView", PropertyViewSchema);
