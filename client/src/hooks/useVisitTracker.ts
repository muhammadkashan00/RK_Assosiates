import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { api } from "../lib/api"

// Persist a lightweight session id for the browser session.
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

/**
 * FR-09: self-hosted visit tracking. Sends one beacon per page view and a
 * duration beacon on unload. Skips the admin area for cleaner analytics.
 */
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
      // Best-effort duration update using sendBeacon-friendly payload.
      const payload = JSON.stringify({
        pageVisited: location.pathname,
        sessionId,
        durationMs,
        visitorLocation: getStoredGeo(),
      })
      const url = (import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
        : "/api") + "/analytics/track"
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }))
      }
    }
  }, [location.pathname])
}
