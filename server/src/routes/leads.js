import { Router } from "express"
import {
  createWhatsAppInquiry,
  listLeads,
  updateLeadStatus,
} from "../controllers/leadController.js"
import { requireAuth } from "../middleware/auth.js"
import { whatsappLimiter } from "../middleware/rateLimit.js"

const router = Router()

// Public: generate a WhatsApp deep link (number never exposed elsewhere).
router.post("/whatsapp/:id", whatsappLimiter, createWhatsAppInquiry)

// Admin
router.get("/", requireAuth, listLeads)
router.patch("/:id", requireAuth, updateLeadStatus)

export default router
