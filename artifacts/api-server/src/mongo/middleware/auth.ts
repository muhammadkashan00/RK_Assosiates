// @ts-nocheck
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const TOKEN_TTL_SECONDS = 30 * 60;

export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

export function requireAuth(req, res, next) {
  try {
    let token: string | undefined;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice(7);
    }
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

    // Strict structure check: reject tokens that were not issued with exp/iat
    if (
      typeof decoded !== "object" ||
      typeof decoded.iat !== "number" ||
      typeof decoded.exp !== "number"
    ) {
      return res.status(401).json({ message: "Invalid token structure." });
    }

    // Reject tokens issued in the future (clock skew > 5 s)
    const nowSec = Math.floor(Date.now() / 1000);
    if (decoded.iat > nowSec + 5) {
      return res.status(401).json({ message: "Token issued in the future." });
    }

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
      const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
      if (
        typeof decoded === "object" &&
        typeof decoded.iat === "number" &&
        typeof decoded.exp === "number"
      ) {
        req.user = { id: decoded.sub, email: decoded.email };
      }
    }
  } catch {
    /* ignore invalid token for optional auth */
  }
  next();
}
