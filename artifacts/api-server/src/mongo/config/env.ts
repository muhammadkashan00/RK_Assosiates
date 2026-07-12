// @ts-nocheck
function required(name) {
  const value = process.env[name];
  if (!value) {
    console.warn(`[env] Warning: ${name} is not set. Some features may not work.`);
  }
  return value;
}

export const env = {
  MONGODB_URI: required("MONGODB_CONNECTION_STRING"),
  JWT_SECRET: required("JWT_SECRET") || "dev-insecure-secret-change-me",
  WHATSAPP_NUMBER: (process.env.WHATSAPP_NUMBER || "").replace(/[^0-9]/g, ""),
  CLOUDINARY_CLOUD_NAME: required("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || "admin@rkassociates.com",
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || "",
};
