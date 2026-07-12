import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../../lib/api"

interface Lead {
  _id: string
  name: string
  phone: string
  message: string
  property?: { _id: string; title: string }
  createdAt: string
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ leads: Lead[] }>("/leads")
      .then((res) => setLeads(res.leads))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false))
  }, [])

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
                  <div>
                    <p className="font-semibold text-navy">{lead.name}</p>
                    <a href={`tel:${lead.phone}`} className="text-sm text-gold-dark hover:underline">
                      {lead.phone}
                    </a>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate/80">{lead.message}</p>
                    {lead.property && (
                      <Link to={`/property/${lead.property._id}`} className="mt-2 inline-block text-xs font-medium text-slate/60 hover:text-navy">
                        Re: {lead.property.title}
                      </Link>
                    )}
                  </div>
                  <time className="text-xs text-slate/50">
                    {new Date(lead.createdAt).toLocaleString()}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
