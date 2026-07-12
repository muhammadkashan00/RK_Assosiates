// @ts-nocheck
import { Router } from "express";
import {
  listProperties,
  nearby,
  getOne,
  trackView,
  uploadMedia,
  createProperty,
  updateProperty,
  setPublish,
  deleteProperty,
} from "../controllers/propertyController";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { upload, validateFileSizes } from "../middleware/upload";
import { adminLimiter } from "../middleware/rateLimit";

const router = Router();

// Public reads
router.get("/", optionalAuth, listProperties);
router.get("/near", nearby);
router.get("/:id", optionalAuth, getOne);

// Explicit view event — fingerprint-based deduplication, no auth required
router.post("/:id/view", trackView);

// Admin writes — tight rate limit (10 req/min per IP)
router.post(
  "/upload",
  requireAuth,
  adminLimiter,
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "video", maxCount: 1 },
  ]),
  validateFileSizes,
  uploadMedia,
);
router.post("/", requireAuth, adminLimiter, createProperty);
router.patch("/:id/publish", requireAuth, adminLimiter, setPublish);
router.put("/:id", requireAuth, adminLimiter, updateProperty);
router.delete("/:id", requireAuth, adminLimiter, deleteProperty);

export default router;
