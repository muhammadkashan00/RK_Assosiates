import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, type Property } from "../../lib/api"
import { formatPrice, statusLabels, statusStyles } from "../../lib/format"

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await api.get<{ properties: Property[] }>("/properties?all=1&limit=200")
      setProperties(res.properties)
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function togglePublish(p: Property) {
    setBusyId(p._id)
    try {
      await api.patch(`/properties/${p._id}/publish`, { published: !p.published })
      setProperties((prev) => prev.map((x) => (x._id === p._id ? { ...x, published: !x.published } : x)))
    } finally {
      setBusyId(null)
    }
  }

  async function remove(p: Property) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return
    setBusyId(p._id)
    try {
      await api.del(`/properties/${p._id}`)
      setProperties((prev) => prev.filter((x) => x._id !== p._id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-navy">Properties</h1>
        <Link
          to="/admin/properties/new"
          className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:bg-gold-light"
        >
          + Add Property
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/5">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate/10" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <p className="p-10 text-center text-slate/60">No properties yet. Add your first listing.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate/10 bg-beige/40 text-xs uppercase tracking-wide text-slate/60">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Visible</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {properties.map((p) => (
                  <tr key={p._id} className="hover:bg-beige/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate/10">
                          {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />}
                        </div>
                        <div>
                          <p className="font-medium text-navy">{p.title}</p>
                          <p className="text-xs text-slate/60">{p.buildingName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-navy">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[p.status]}`}>
                        {statusLabels[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(p)}
                        disabled={busyId === p._id}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                          p.published ? "bg-green-100 text-green-700" : "bg-slate/10 text-slate/60"
                        }`}
                      >
                        {p.published ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/properties/${p._id}/edit`}
                          className="rounded-lg border border-slate/20 px-3 py-1.5 text-xs font-medium text-slate transition hover:bg-slate/5"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => remove(p)}
                          disabled={busyId === p._id}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
