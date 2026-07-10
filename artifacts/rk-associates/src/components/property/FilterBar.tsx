import { useState } from "react"

export interface Filters {
  q: string
  status: string
  sort: string
}

export const emptyFilters: Filters = {
  q: "",
  status: "",
  sort: "newest",
}

const inputClass =
  "w-full rounded-xl border border-slate/20 bg-white dark:bg-navy-light dark:border-white/10 dark:text-beige px-4 py-2.5 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"

export function FilterBar({
  value,
  onChange,
  onReset,
}: {
  value: Filters
  onChange: (next: Filters) => void
  onReset: () => void
}) {
  const [local, setLocal] = useState(value)

  function set<K extends keyof Filters>(key: K, v: Filters[K]) {
    setLocal((prev) => ({ ...prev, [key]: v }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onChange(local)
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-white dark:bg-navy-light p-4 shadow-card ring-1 ring-navy/5 dark:ring-white/10 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate/60 dark:text-beige/50">
            Search
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/40 dark:text-beige/30"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className={inputClass + " pl-9"}
              placeholder="Search by title or area..."
              value={local.q}
              onChange={(e) => set("q", e.target.value)}
            />
          </div>
        </div>

        <div className="sm:w-40">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate/60 dark:text-beige/50">
            Status
          </label>
          <select
            className={inputClass}
            value={local.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="sm:w-44">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate/60 dark:text-beige/50">
            Sort By
          </label>
          <select
            className={inputClass}
            value={local.sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setLocal(emptyFilters)
              onReset()
            }}
            className="rounded-xl border border-slate/20 dark:border-white/10 px-4 py-2.5 text-sm font-medium text-slate dark:text-beige/70 transition hover:bg-slate/5 dark:hover:bg-white/5"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-navy shadow-sm transition hover:bg-gold-dark"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  )
}
