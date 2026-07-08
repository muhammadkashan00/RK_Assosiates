import { Router } from "express"
import { trackVisit, overview } from "../controllers/analyticsController.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

// Public tracking beacon.
router.post("/track", trackVisit)

// Admin dashboard data.
router.get("/overview", requireAuth, overview)

export default router
