import { Lead } from "../models/Lead.js"
import { Property } from "../models/Property.js"
import { asyncHandler } from "../middleware/error.js"
import { env } from "../config/env.js"
import { getClientIp, anonymizeIp } from "../utils/network.js"

/**
 * FR-07: Secure WhatsApp inquiry.
 * The business number is NEVER included in any listing/detail response or the
 * client bundle. The client posts the visitor's details on click; the server
 * records the lead and returns a ready-to-open wa.me deep link with the
 * message prefilled. Rate limited upstream.
 */
export const createLead = asyncHandler(async (req, res) => {
  const { propertyId, name, phone, message } = req.body || {}
  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required." })
  }

  let property = null
  if (propertyId) {
    property = await Property.findOne({ _id: propertyId, published: true }).lean()
    if (!property) return res.status(404).json({ message: "Property not found." })
  }

  if (!env.WHATSAPP_NUMBER) {
    return res.status(503).json({ message: "WhatsApp contact is not configured yet." })
  }

  const ip = anonymizeIp(getClientIp(req))
  await Lead.create({
    property: property?._id,
    name: String(name).trim(),
    phone: String(phone).trim(),
    message: String(message || "").trim(),
    ip,
  })

  // Compose the message the visitor will send to the business.
  const lines = [`Hello RK Associates, I'm ${name}.`]
  if (property) lines.push(`I'm interested in: ${property.title} (ID: ${property._id}).`)
  if (message) lines.push(message)
  lines.push(`My contact: ${phone}`)
  const text = lines.join("\n")

  const number = env.WHATSAPP_NUMBER.replace(/[^\d]/g, "")
  const redirectUrl = `https://wa.me/${number}?text=${encodeURIComponent(text)}`

  res.status(201).json({ redirectUrl })
})

export const listLeads = asyncHandler(async (_req, res) => {
  const leads = await Lead.find()
    .sort({ createdAt: -1 })
    .limit(300)
    .populate("property", "title")
    .lean()
  res.json({ leads })
})

export const updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {}
  if (!["initiated", "converted"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." })
  }
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!lead) return res.status(404).json({ message: "Lead not found." })
  res.json({ lead })
})
