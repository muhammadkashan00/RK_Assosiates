import { Lead } from "../models/Lead.js"
import { Property } from "../models/Property.js"
import { asyncHandler } from "../middleware/error.js"
import { env } from "../config/env.js"
import { getClientIp, anonymizeIp } from "../utils/network.js"

/**
 * FR-07: Secure WhatsApp inquiry.
 * The number is NEVER sent in listing/detail responses. The client calls this
 * endpoint on click; the server records the lead and returns a ready-to-open
 * wa.me deep link containing a prefilled message. Rate limited upstream.
 */
export const createWhatsAppInquiry = asyncHandler(async (req, res) => {
  const propertyId = req.params.id
  const property = await Property.findOne({ _id: propertyId, isPublished: true }).lean()
  if (!property) return res.status(404).json({ error: "Property not found." })

  if (!env.WHATSAPP_NUMBER) {
    return res.status(503).json({ error: "WhatsApp contact is not configured yet." })
  }

  const ip = anonymizeIp(getClientIp(req))
  await Lead.create({ propertyId, ipAddress: ip, status: "initiated" })

  const message = `Hello RK Associates, I'm interested in this property: ${property.title} (ID: ${property._id}).`
  const url = `https://wa.me/${env.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  res.json({ url })
})

export const listLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find()
    .sort({ timestamp: -1 })
    .limit(200)
    .populate("propertyId", "title buildingName")
    .lean()
  res.json({ leads })
})

export const updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {}
  if (!["initiated", "converted"].includes(status)) {
    return res.status(400).json({ error: "Invalid status." })
  }
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!lead) return res.status(404).json({ error: "Lead not found." })
  res.json({ lead })
})
