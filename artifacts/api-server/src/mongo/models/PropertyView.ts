import mongoose, { Schema } from "mongoose";

const PropertyViewSchema = new Schema(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    ip: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // TTL: 24h
  },
  { versionKey: false },
);

PropertyViewSchema.index({ propertyId: 1, ip: 1 }, { unique: true });

export const PropertyView = mongoose.model("PropertyView", PropertyViewSchema);
