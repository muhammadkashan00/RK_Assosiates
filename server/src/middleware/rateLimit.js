import rateLimit from "express-rate-limit"

// General API limiter to reduce abuse across all endpoints.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
})

// Strict limiter for login (FR-01): 5 attempts per 15 minutes per IP.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
})

// WhatsApp / lead inquiry limiter (FR-07): guard against spam while allowing
// a visitor to inquire about several properties in a session.
export const whatsappLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many inquiries. Please try again later." },
})
