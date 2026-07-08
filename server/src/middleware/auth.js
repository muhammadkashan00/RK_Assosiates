import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

export const TOKEN_COOKIE = "rk_token"
// 30 minutes of inactivity => token lifetime (FR-01 session timeout).
export const TOKEN_TTL_SECONDS = 30 * 60

export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS })
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: TOKEN_TTL_SECONDS * 1000,
    path: "/",
  }
}

/**
 * Require a valid admin JWT. Reads the token from the httpOnly cookie
 * (never exposed to JS) or the Authorization header as a fallback.
 */
export function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.[TOKEN_COOKIE]
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice(7)
    }
    if (!token) {
      return res.status(401).json({ error: "Authentication required." })
    }
    const decoded = jwt.verify(token, env.JWT_SECRET)
    req.user = { id: decoded.sub, username: decoded.username }
    next()
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." })
  }
}
