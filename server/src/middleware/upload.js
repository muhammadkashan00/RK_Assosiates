import multer from "multer"

// Keep files in memory and stream them straight to Cloudinary.
const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file (videos)
    files: 20,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      return cb(null, true)
    }
    cb(new Error("Only image and video files are allowed."))
  },
})
