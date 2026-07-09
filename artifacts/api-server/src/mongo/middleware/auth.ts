// @ts-nocheck
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const TOKEN_TTL_SECONDS = 30 * 60;

export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

export function requireAuth(req, res, next) {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice(7);
    }
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

export function optionalAuth(req, _res, next) {
  try {
    if (req.headers.authorization?.startsWith("Bearer ")) {
      const token = req.headers.authorization.slice(7);
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = { id: decoded.sub, email: decoded.email };
    }
  } catch {
    /* ignore invalid token for optional auth */
  }
  next();
}
