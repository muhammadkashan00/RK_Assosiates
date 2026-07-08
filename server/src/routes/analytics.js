import { Router } from "express"
import { trackVisit, analyticsSummary } from "../controllers/analyticsController.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

// Public tracking beacon.
router.post("/track", trackVisit)

// Admin dashboard data.
router.get("/summary", requireAuth, analyticsSummary)

export default router
