import { Router } from "express"
import { createLead, listLeads, updateLeadStatus } from "../controllers/leadController.js"
import { requireAuth } from "../middleware/auth.js"
import { whatsappLimiter } from "../middleware/rateLimit.js"

const router = Router()

// Public: record a lead and return a WhatsApp deep link (number never exposed).
router.post("/", whatsappLimiter, createLead)

// Admin
router.get("/", requireAuth, listLeads)
router.patch("/:id", requireAuth, updateLeadStatus)

export default router
