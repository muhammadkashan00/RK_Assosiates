import { useState } from "react"

export interface Filters {
  q: string
  status: string
  minPrice: string
  maxPrice: string
  minRooms: string
  sort: string
}

export const emptyFilters: Filters = {
  q: "",
  status: "",
  minPrice: "",
  maxPrice: "",
  minRooms: "",
  sort: "newest",
}

const inputClass =
  "w-full rounded-lg border border-slate/20 bg-white px-3 py-2 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"

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
      className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-navy/5 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <label className="mb-1 block text-xs font-medium text-slate/70">Search</label>
          <input
            className={inputClass}
            placeholder="Title, building, address..."
            value={local.q}
            onChange={(e) => set("q", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate/70">Status</label>
          <select
            className={inputClass}
            value={local.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="">Any</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate/70">Min Price</label>
          <input
            type="number"
            className={inputClass}
            placeholder="0"
            value={local.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate/70">Max Price</label>
          <input
            type="number"
            className={inputClass}
            placeholder="Any"
            value={local.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate/70">Min Rooms</label>
          <input
            type="number"
            className={inputClass}
            placeholder="Any"
            value={local.minRooms}
            onChange={(e) => set("minRooms", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate/70">Sort</label>
          <select
            className="rounded-lg border border-slate/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold"
            value={local.sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
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
            className="rounded-lg border border-slate/20 px-4 py-2 text-sm font-medium text-slate transition hover:bg-slate/5"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-beige transition hover:bg-navy-light"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  )
}
