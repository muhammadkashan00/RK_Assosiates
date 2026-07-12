import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { WhatsAppInquiry } from "../property/WhatsAppInquiry"

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function HomeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <line x1="8" y1="7" x2="8" y2="7.01" />
      <line x1="12" y1="7" x2="12" y2="7.01" />
      <line x1="16" y1="7" x2="16" y2="7.01" />
      <line x1="8" y1="11" x2="8" y2="11.01" />
      <line x1="12" y1="11" x2="12" y2="11.01" />
      <line x1="16" y1="11" x2="16" y2="11.01" />
      <line x1="9" y1="21" x2="9" y2="17" />
      <line x1="15" y1="21" x2="15" y2="17" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8.9-1 1.1c-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.6s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.1 2.2.9 3 1 4.1.9.7-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4z" />
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.7-.2-.3A8 8 0 1 1 12 20z" />
    </svg>
  )
}

export function BottomNav() {
  const location = useLocation()
  const [waOpen, setWaOpen] = useState(false)

  const tabs = [
    { to: "/", label: "Home", icon: <HomeIcon />, match: (p: string) => p === "/" },
    {
      to: "/listings",
      label: "Properties",
      icon: <BuildingIcon />,
      match: (p: string) => p === "/listings",
    },
    {
      to: "/listings?near=1",
      label: "Near By",
      icon: <PinIcon />,
      match: (p: string) => p === "/listings" && location.search.includes("near=1"),
    },
    {
      to: "/favorites",
      label: "Favorites",
      icon: <HeartIcon />,
      match: (p: string) => p === "/favorites",
    },
  ]

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch border-t border-navy/10 bg-white/95 backdrop-blur sm:hidden dark:border-white/10 dark:bg-navy/95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        {tabs.map((tab) => {
          const active = tab.match(location.pathname)
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className={`flex min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
                active ? "text-gold-dark dark:text-gold" : "text-slate/60 dark:text-beige/60"
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          )
        })}
        <button
          onClick={() => setWaOpen(true)}
          className="flex min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-[#25D366] transition"
        >
          <WhatsAppIcon />
          WhatsApp
        </button>
      </nav>

      {waOpen && (
        <div className="sm:hidden">
          <GenericWhatsAppModal onClose={() => setWaOpen(false)} />
        </div>
      )}
    </>
  )
}

function GenericWhatsAppModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-navy/50 p-0"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full rounded-t-2xl bg-white p-2 dark:bg-navy-light">
        <WhatsAppInquiryTrigger onClose={onClose} />
      </div>
    </div>
  )
}

function WhatsAppInquiryTrigger({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-navy dark:text-beige">
          Chat with us
        </h3>
        <button onClick={onClose} aria-label="Close" className="text-slate/60 dark:text-beige/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
      <div className="mt-3">
        <WhatsAppInquiry
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-semibold text-white shadow-sm transition hover:brightness-95"
        />
      </div>
    </div>
  )
}
