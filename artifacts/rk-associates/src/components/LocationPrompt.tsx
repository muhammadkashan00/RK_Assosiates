import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"

const DISMISS_KEY = "rk_geo_prompt_dismissed"
const GEO_KEY = "rk_geo"

type GeoErrorType = "denied" | "unavailable" | "timeout" | null

const geoErrorMessages: Record<NonNullable<GeoErrorType>, { title: string; body: string }> = {
  denied: {
    title: "Location access denied",
    body: "To use 'Near You', allow location access in your browser settings, then refresh.",
  },
  unavailable: {
    title: "Location unavailable",
    body: "Your device couldn't determine your position. Check your connection or GPS.",
  },
  timeout: {
    title: "Location timed out",
    body: "It took too long to get your location. Please try again.",
  },
}

export function LocationPrompt() {
  const [open, setOpen] = useState(false)
  const [geoError, setGeoError] = useState<GeoErrorType>(null)

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    const alreadyHas = localStorage.getItem(GEO_KEY)
    if (!dismissed && !alreadyHas) {
      const t = setTimeout(() => setOpen(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  function enable() {
    if (!navigator.geolocation) {
      setGeoError("unavailable")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        localStorage.setItem(
          GEO_KEY,
          JSON.stringify({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
        )
        window.dispatchEvent(new Event("rk-geo-updated"))
        closePrompt()
      },
      (err) => {
        if (err.code === 1) setGeoError("denied")
        else if (err.code === 2) setGeoError("unavailable")
        else setGeoError("timeout")
      },
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  function closePrompt() {
    localStorage.setItem(DISMISS_KEY, "1")
    setOpen(false)
    setGeoError(null)
  }

  const errorInfo = geoError ? geoErrorMessages[geoError] : null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md sm:inset-x-auto sm:right-6"
          role="dialog"
          aria-label="Enable location"
        >
          <div className="glass-card p-5">
            {errorInfo ? (
              /* Error state */
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">{errorInfo.title}</p>
                  <p className="mt-0.5 text-xs text-slate/70">{errorInfo.body}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      to="/listings"
                      onClick={closePrompt}
                      className="text-xs font-semibold text-gold-dark underline-offset-2 hover:underline"
                    >
                      Browse all properties
                    </Link>
                    <button
                      onClick={closePrompt}
                      className="text-xs text-slate/60 hover:text-slate"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Default prompt */
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 21s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">See properties near you</p>
                  <p className="mt-0.5 text-xs text-slate/70">
                    Allow location access to find listings closest to where you are.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={enable}
                      className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-gold-dark hover:text-white"
                    >
                      Enable Location
                    </button>
                    <button
                      onClick={closePrompt}
                      className="text-xs text-slate/60 hover:text-slate"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
