import { Router } from "express"
import {
  listProperties,
  nearby,
  getOne,
  uploadMedia,
  createProperty,
  updateProperty,
  setPublish,
  deleteProperty,
} from "../controllers/propertyController.js"
import { requireAuth, optionalAuth } from "../middleware/auth.js"
import { upload } from "../middleware/upload.js"

const router = Router()

// List: public by default; `?all=1` with a valid admin token returns everything.
router.get("/", optionalAuth, listProperties)
router.get("/near", nearby)

// Media upload (admin only). Accepts `images` (multiple) and `video` (single).
router.post(
  "/upload",
  requireAuth,
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "video", maxCount: 1 },
  ]),
  uploadMedia,
)

// Create / update / publish / delete (admin only).
router.post("/", requireAuth, createProperty)
router.patch("/:id/publish", requireAuth, setPublish)
router.put("/:id", requireAuth, updateProperty)
router.delete("/:id", requireAuth, deleteProperty)

// Get one: public increments views; `?admin=1` with token skips that.
router.get("/:id", optionalAuth, getOne)

export default router
