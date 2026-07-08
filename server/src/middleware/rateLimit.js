import rateLimit from "express-rate-limit"

// General API limiter to reduce abuse across all endpoints.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
})

// Strict limiter for login (FR-01): 5 attempts per 15 minutes per IP.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
})

// WhatsApp inquiry limiter (FR-07): max 1 request per IP per hour, per property.
export const whatsappLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.params.id || req.body?.propertyId || "any"}`,
  message: { error: "You have already requested this property recently. Please try later." },
})
