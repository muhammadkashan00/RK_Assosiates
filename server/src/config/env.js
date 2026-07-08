import dotenv from "dotenv"
import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// The monorepo root is two levels up from server/src/config.
const monorepoRoot = path.resolve(__dirname, "../../..")

// Load env from the project-local files. In this environment the framework
// mirrors all managed env vars into .env.development.local at the repo root.
// On Render (production) real environment variables take precedence and these
// files simply will not exist.
dotenv.config({ path: path.join(monorepoRoot, ".env.development.local") })
dotenv.config({ path: path.join(monorepoRoot, ".env") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

function required(name) {
  const value = process.env[name]
  if (!value) {
    console.warn(`[env] Warning: ${name} is not set. Some features may not work.`)
  }
  return value
}

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: required("MONGODB_CONNECTION_STRING"),
  JWT_SECRET: required("JWT_SECRET") || "dev-insecure-secret-change-me",
  WHATSAPP_NUMBER: (process.env.WHATSAPP_NUMBER || "").replace(/[^0-9]/g, ""),
  CLOUDINARY_CLOUD_NAME: required("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "",
  // Default admin seed credentials (override in production).
  SEED_ADMIN_USERNAME: process.env.SEED_ADMIN_USERNAME || "admin",
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || "",
}

export const isProd = env.NODE_ENV === "production"
