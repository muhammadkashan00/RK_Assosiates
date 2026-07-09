import { useState } from "react"
import { api } from "../../lib/api"

export function WhatsAppInquiry({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState(`Hi, I'm interested in "${propertyTitle}". Please share more details.`)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      // Server records the lead and returns a wa.me redirect URL.
      // The business number is never sent to or stored in the client bundle.
      const res = await api.post<{ redirectUrl: string }>(`/leads`, {
        propertyId,
        name,
        phone,
        message,
      })
      window.open(res.redirectUrl, "_blank", "noopener,noreferrer")
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-semibold text-white shadow-sm transition hover:brightness-95"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8.9-1 1.1c-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.6s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.1 2.2.9 3 1 4.1.9.7-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4z" />
          <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.7-.2-.3A8 8 0 1 1 12 20z" />
        </svg>
        Inquire on WhatsApp
      </button>

      {open && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-navy/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-xl font-semibold text-navy">Send an inquiry</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-slate/60 hover:text-navy">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" /></svg>
              </button>
            </div>
            <p className="mt-1 text-sm text-slate/70">
              We&apos;ll open WhatsApp with your message pre-filled.
            </p>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">Your name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate/20 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">Your phone</label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate/20 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate/70">Message</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-slate/20 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
              >
                {submitting ? "Opening WhatsApp..." : "Continue to WhatsApp"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
