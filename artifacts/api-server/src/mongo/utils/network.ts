// @ts-nocheck
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "";
}

export function anonymizeIp(ip) {
  if (!ip) return "";
  const cleaned = ip.replace(/^::ffff:/, "");
  if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    if (parts.length === 4) {
      parts[3] = "0";
      return parts.join(".");
    }
  }
  if (cleaned.includes(":")) {
    const segments = cleaned.split(":");
    return segments.slice(0, 3).join(":") + "::";
  }
  return cleaned;
}
