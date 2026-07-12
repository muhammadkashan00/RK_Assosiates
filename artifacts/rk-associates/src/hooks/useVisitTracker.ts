import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { api } from "../lib/api"

// ─── Device fingerprinting ────────────────────────────────────────────────────

/**
 * Computes a 16-char hex device fingerprint using:
 *   canvas rendering, userAgent, screen resolution + depth,
 *   timezone, language, and CPU concurrency.
 *
 * Uses the Web Crypto API (SHA-256) — no external SDK required.
 * Returns an empty string if the browser blocks canvas or crypto.
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    // Canvas fingerprint: rendering differences reveal GPU/font/driver combos
    let canvasData = ""
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 200
      canvas.height = 40
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.textBaseline = "top"
        ctx.font = "14px 'Arial'"
        ctx.fillStyle = "#f60"
        ctx.fillRect(125, 1, 62, 20)
        ctx.fillStyle = "#069"
        ctx.fillText("RK\u2603fp", 2, 15)
        ctx.fillStyle = "rgba(102,204,0,0.7)"
        ctx.fillText("RK\u2603fp", 4, 17)
        canvasData = canvas.toDataURL()
      }
    } catch {
      /* sandboxed iframe — skip canvas */
    }

    const raw = [
      canvasData,
      navigator.userAgent,
      navigator.language,
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.hardwareConcurrency ?? 0,
      navigator.platform ?? "",
    ].join("|")

    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw))
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    return hex.slice(0, 16) // 16-char prefix is enough entropy for dedup
  } catch {
    return ""
  }
}

/**
 * Sends an explicit view event for a property to the backend.
 * Includes the device fingerprint so the server can deduplicate
 * repeat visits from the same device within 24 hours.
 * Fails silently — never affects the user experience.
 */
export async function trackPropertyView(propertyId: string): Promise<void> {
  try {
    const fingerprintHash = await getDeviceFingerprint()
    await api.post(`/properties/${propertyId}/view`, { fingerprintHash })
  } catch {
    /* silent — view tracking must never break the page */
  }
}

// ─── Session helpers ──────────────────────────────────────────────────────────

function getSessionId(): string {
  const key = "rk_session_id"
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

function getStoredGeo(): { type: "Point"; coordinates: [number, number] } | undefined {
  try {
    const raw = localStorage.getItem("rk_geo")
    if (!raw) return undefined
    const { lng, lat } = JSON.parse(raw)
    if (typeof lng === "number" && typeof lat === "number") {
      return { type: "Point", coordinates: [lng, lat] }
    }
  } catch {
    /* ignore */
  }
  return undefined
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useVisitTracker() {
  const location = useLocation()
  const enterTime = useRef<number>(Date.now())

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return

    enterTime.current = Date.now()
    const sessionId = getSessionId()

    api
      .post("/analytics/track", {
        pageVisited: location.pathname,
        referrer: document.referrer,
        sessionId,
        visitorLocation: getStoredGeo(),
      })
      .catch(() => {})

    return () => {
      const durationMs = Date.now() - enterTime.current
      if (durationMs < 1000) return
      const payload = JSON.stringify({
        pageVisited: location.pathname,
        sessionId,
        durationMs,
        visitorLocation: getStoredGeo(),
      })
      const url =
        (import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
          : "/api") + "/analytics/track"
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }))
      }
    }
  }, [location.pathname])
}
