// @ts-nocheck
import { Router } from "express";
import {
  listProperties,
  nearby,
  getOne,
  uploadMedia,
  createProperty,
  updateProperty,
  setPublish,
  deleteProperty,
} from "../controllers/propertyController";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", optionalAuth, listProperties);
router.get("/near", nearby);

router.post(
  "/upload",
  requireAuth,
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "video", maxCount: 1 },
  ]),
  uploadMedia,
);

router.post("/", requireAuth, createProperty);
router.patch("/:id/publish", requireAuth, setPublish);
router.put("/:id", requireAuth, updateProperty);
router.delete("/:id", requireAuth, deleteProperty);

router.get("/:id", optionalAuth, getOne);

export default router;
