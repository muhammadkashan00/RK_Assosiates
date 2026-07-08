import { Router } from "express"
import {
  listPublic,
  getPublicOne,
  nearby,
  distinctTags,
  listAdmin,
  getAdminOne,
  createProperty,
  updateProperty,
  togglePublish,
  deleteProperty,
} from "../controllers/propertyController.js"
import { requireAuth } from "../middleware/auth.js"
import { upload } from "../middleware/upload.js"

const router = Router()

// Public
router.get("/", listPublic)
router.get("/tags", distinctTags)
router.get("/nearby", nearby)
router.get("/:id", getPublicOne)

// Admin (protected)
router.get("/admin/all", requireAuth, listAdmin)
router.get("/admin/:id", requireAuth, getAdminOne)
router.post("/admin", requireAuth, upload.array("media", 20), createProperty)
router.put("/admin/:id", requireAuth, upload.array("media", 20), updateProperty)
router.patch("/admin/:id/publish", requireAuth, togglePublish)
router.delete("/admin/:id", requireAuth, deleteProperty)

export default router
