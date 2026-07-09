// @ts-nocheck
import { Router } from "express";
import { createLead, listLeads, updateLeadStatus } from "../controllers/leadController";
import { requireAuth } from "../middleware/auth";
import { whatsappLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/", whatsappLimiter, createLead);
router.get("/", requireAuth, listLeads);
router.patch("/:id", requireAuth, updateLeadStatus);

export default router;
