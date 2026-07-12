// @ts-nocheck
import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

// Per-type size ceilings
export const IMAGE_MAX_MB = 20;
export const VIDEO_MAX_MB = 100;
const IMAGE_MAX_BYTES = IMAGE_MAX_MB * 1024 * 1024;
const VIDEO_MAX_BYTES = VIDEO_MAX_MB * 1024 * 1024;

export const upload = multer({
  storage,
  limits: {
    // Overall ceiling is the video limit; per-type enforcement is in validateFileSizes
    fileSize: VIDEO_MAX_BYTES,
    files: 20,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      return cb(null, true);
    }
    cb(new Error("Only image and video files are allowed."));
  },
});

/**
 * Run after multer. Enforces per-mimetype size ceilings:
 *   • images → 20 MB each
 *   • videos → 100 MB each
 */
export function validateFileSizes(req: Request, res: Response, next: NextFunction) {
  const imageFiles: Express.Multer.File[] = (req.files as any)?.images ?? [];
  const videoFiles: Express.Multer.File[] = (req.files as any)?.video ?? [];

  for (const file of imageFiles) {
    if (file.size > IMAGE_MAX_BYTES) {
      return res.status(413).json({
        message: `"${file.originalname}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — images must be under ${IMAGE_MAX_MB} MB.`,
      });
    }
  }

  for (const file of videoFiles) {
    if (file.size > VIDEO_MAX_BYTES) {
      return res.status(413).json({
        message: `"${file.originalname}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — videos must be under ${VIDEO_MAX_MB} MB.`,
      });
    }
  }

  next();
}
