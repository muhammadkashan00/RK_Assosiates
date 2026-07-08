import mongoose from "mongoose"

const { Schema } = mongoose

const leadSchema = new Schema(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", index: true },
    ipAddress: { type: String }, // anonymized
    status: {
      type: String,
      enum: ["initiated", "converted"],
      default: "initiated",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

leadSchema.index({ timestamp: -1 })

export const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema)
