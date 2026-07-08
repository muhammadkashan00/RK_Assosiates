import { useEffect, useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts"
import { api } from "../../lib/api"
import { formatNumber } from "../../lib/format"

interface Analytics {
  totals: {
    properties: number
    available: number
    totalViews: number
    leads: number
    visits30d: number
  }
  visitsByDay: { date: string; visits: number }[]
  topProperties: { _id: string; title: string; views: number }[]
  leadsByDay: { date: string; leads: number }[]
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 shadow-card ring-1 ${accent ? "bg-navy text-beige ring-navy" : "bg-white text-navy ring-navy/5"}`}>
      <p className={`text-sm ${accent ? "text-beige/70" : "text-slate/60"}`}>{label}</p>
      <p className="mt-1 font-serif text-3xl font-bold">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Analytics>("/analytics/overview")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white/60" />
  }

  if (!data) {
    return <p className="text-slate/70">Could not load analytics.</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-navy">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Properties" value={formatNumber(data.totals.properties)} accent />
        <StatCard label="Available" value={formatNumber(data.totals.available)} />
        <StatCard label="Total Views" value={formatNumber(data.totals.totalViews)} />
        <StatCard label="Leads" value={formatNumber(data.totals.leads)} />
        <StatCard label="Visits (30d)" value={formatNumber(data.totals.visits30d)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy/5">
          <h2 className="mb-4 font-serif text-lg font-semibold text-navy">Visits — last 30 days</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.visitsByDay}>
              <defs>
                <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a24b" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#c9a24b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d8" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="visits" stroke="#a9852f" fill="url(#v)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy/5">
          <h2 className="mb-4 font-serif text-lg font-semibold text-navy">Leads — last 30 days</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.leadsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d8" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="leads" fill="#1e2a44" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy/5">
        <h2 className="mb-4 font-serif text-lg font-semibold text-navy">Most viewed properties</h2>
        {data.topProperties.length === 0 ? (
          <p className="text-sm text-slate/60">No data yet.</p>
        ) : (
          <ul className="divide-y divide-slate/10">
            {data.topProperties.map((p, i) => (
              <li key={p._id} className="flex items-center justify-between py-3">
                <span className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-gold-dark">
                    {i + 1}
                  </span>
                  <span className="font-medium text-navy">{p.title}</span>
                </span>
                <span className="text-sm text-slate/70">{formatNumber(p.views)} views</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
