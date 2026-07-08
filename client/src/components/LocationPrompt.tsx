import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

const DISMISS_KEY = "rk_geo_prompt_dismissed"
const GEO_KEY = "rk_geo"

/**
 * FR-10: prompt the visitor to enable location for area-based suggestions.
 * On accept we store precise coords in localStorage (used by the tracker and
 * the "Properties Near You" section). On deny we fall back to IP-based location.
 */
export function LocationPrompt() {
  const [open, setOpen] = useState(false)

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
      close()
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        localStorage.setItem(
          GEO_KEY,
          JSON.stringify({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
        )
        window.dispatchEvent(new Event("rk-geo-updated"))
        close()
      },
      () => close(),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  function close() {
    localStorage.setItem(DISMISS_KEY, "1")
    setOpen(false)
  }

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
              <div className="flex-1">
                <h3 className="font-serif text-lg text-navy">See properties near you</h3>
                <p className="mt-1 text-sm text-slate/80">
                  Enable location to discover listings in your area. We use it only for suggestions
                  and never share your exact position.
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={enable} className="btn-gold flex-1 py-2 text-sm">
                    Enable location
                  </button>
                  <button onClick={close} className="btn-outline py-2 text-sm">
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
