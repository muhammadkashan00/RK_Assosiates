// @ts-nocheck
import mongoose from "mongoose";

const { Schema } = mongoose;

const leadSchema = new Schema(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, default: "" },
    ip: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "closed", "initiated", "converted"],
      default: "new",
    },
  },
  { timestamps: true },
);

leadSchema.index({ createdAt: -1 });

export const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
