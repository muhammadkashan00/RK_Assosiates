import type { Request, Response, NextFunction } from "express";

/**
 * Adds hardening headers to every API response:
 *   X-Content-Type-Options  — prevents MIME sniffing
 *   X-Frame-Options         — prevents clickjacking
 *   Referrer-Policy         — limits referrer leakage
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}

/**
 * Rejects POST / PUT / PATCH requests whose Content-Type is neither
 * `application/json` nor `multipart/form-data` (file uploads).
 * Returns 415 Unsupported Media Type for everything else.
 */
export function requireJsonContentType(req: Request, res: Response, next: NextFunction) {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const ct = (req.headers["content-type"] ?? "").toLowerCase();
    if (!ct.includes("application/json") && !ct.includes("multipart/form-data")) {
      return res
        .status(415)
        .json({ message: "Unsupported Media Type. Use application/json." });
    }
  }
  next();
}
