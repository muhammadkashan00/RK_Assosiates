import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../../lib/api"

interface Lead {
  _id: string
  name: string
  phone: string
  message: string
  status: "new" | "contacted" | "closed"
  property?: { _id: string; title: string }
  createdAt: string
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  new: { label: "New", classes: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", classes: "bg-amber-100 text-amber-700" },
  closed: { label: "Closed", classes: "bg-slate/10 text-slate/60" },
  initiated: { label: "New", classes: "bg-blue-100 text-blue-700" },
  converted: { label: "Closed", classes: "bg-slate/10 text-slate/60" },
}
const defaultStatus = statusConfig["new"]

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ leads: Lead[] }>("/leads")
      .then((res) => setLeads(res.leads))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(lead: Lead, status: Lead["status"]) {
    setBusyId(lead._id)
    try {
      await api.patch(`/leads/${lead._id}/status`, { status })
      setLeads((prev) => prev.map((l) => (l._id === lead._id ? { ...l, status } : l)))
    } catch {
      /* ignore */
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-navy">Leads</h1>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/5">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate/10" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <p className="p-10 text-center text-slate/60">No leads yet.</p>
        ) : (
          <ul className="divide-y divide-slate/10">
            {leads.map((lead) => (
              <li key={lead._id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy">{lead.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          statusConfig[lead.status ?? "new"].classes
                        }`}
                      >
                        {statusConfig[lead.status ?? "new"].label}
                      </span>
                    </div>
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-sm text-gold-dark hover:underline"
                    >
                      {lead.phone}
                    </a>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate/80">
                      {lead.message}
                    </p>
                    {lead.property && (
                      <Link
                        to={`/property/${lead.property._id}`}
                        className="mt-2 inline-block text-xs font-medium text-slate/60 hover:text-navy"
                      >
                        Re: {lead.property.title}
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <time className="text-xs text-slate/50">
                      {new Date(lead.createdAt).toLocaleString()}
                    </time>
                    <select
                      value={lead.status ?? "new"}
                      disabled={busyId === lead._id}
                      onChange={(e) => updateStatus(lead, e.target.value as Lead["status"])}
                      className="rounded-lg border border-slate/20 bg-white px-2 py-1 text-xs text-navy outline-none focus:border-gold disabled:opacity-50"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
