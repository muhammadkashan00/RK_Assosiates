// @ts-nocheck
import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

// Thresholds above which extra compression is applied
const IMAGE_COMPRESS_THRESHOLD = 2 * 1024 * 1024;  // 2 MB
const VIDEO_COMPRESS_THRESHOLD = 10 * 1024 * 1024; // 10 MB

export function uploadBuffer(
  buffer: Buffer,
  resourceType: "image" | "video" | "raw",
  folder = "rk-associates",
) {
  const fileSize = buffer.length;
  const options: Record<string, unknown> = { resource_type: resourceType, folder };

  if (resourceType === "image") {
    // Always apply format + quality optimisation; cap width at 1920 px (never upscale).
    // Use "auto:good" for large files, "auto:best" for small ones to preserve detail.
    options.transformation = [
      {
        quality: fileSize > IMAGE_COMPRESS_THRESHOLD ? "auto:good" : "auto:best",
        fetch_format: "auto",   // serves WebP/AVIF to supporting browsers automatically
        width: 1920,
        crop: "limit",          // downscale only, never upscale
      },
    ];
  } else if (resourceType === "video") {
    // Compress videos that exceed the threshold; leave small ones at original quality.
    if (fileSize > VIDEO_COMPRESS_THRESHOLD) {
      options.transformation = [
        {
          quality: "auto:good",
          video_codec: "auto",  // Cloudinary picks the best codec (H.264/H.265/VP9)
          width: 1280,
          crop: "limit",
        },
      ];
    }
  }

  return new Promise<unknown>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options as Parameters<typeof cloudinary.uploader.upload_stream>[0],
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export { cloudinary };
