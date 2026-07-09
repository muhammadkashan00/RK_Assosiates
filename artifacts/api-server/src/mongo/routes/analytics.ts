// @ts-nocheck
import { Router } from "express";
import { trackVisit, overview } from "../controllers/analyticsController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/track", trackVisit);
router.get("/overview", requireAuth, overview);

export default router;
