import { useEffect, useState } from "react"

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

function FilterFields({
  local,
  set,
}: {
  local: Filters
  set: <K extends keyof Filters>(key: K, v: Filters[K]) => void
}) {
  return (
    <>
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
        <select className={inputClass} value={local.status} onChange={(e) => set("status", e.target.value)}>
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
        <select className={inputClass} value={local.sort} onChange={(e) => set("sort", e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>
    </>
  )
}

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
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [drawerOpen])

  function set<K extends keyof Filters>(key: K, v: Filters[K]) {
    setLocal((prev) => ({ ...prev, [key]: v }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onChange(local)
    setDrawerOpen(false)
  }

  const activeCount = [value.q, value.status].filter(Boolean).length

  return (
    <>
      {/* Desktop / tablet inline bar */}
      <form
        onSubmit={submit}
        className="hidden rounded-2xl bg-white dark:bg-navy-light p-4 shadow-card ring-1 ring-navy/5 dark:ring-white/10 sm:block sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FilterFields local={local} set={set} />
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

      {/* Mobile trigger */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white dark:bg-navy-light px-4 text-sm font-semibold text-navy dark:text-beige shadow-card ring-1 ring-navy/5 dark:ring-white/10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-navy">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-[1100] flex items-end justify-center bg-navy/50 sm:hidden"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false)
          }}
        >
          <form
            onSubmit={submit}
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-beige dark:bg-navy p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-navy dark:text-beige">Filters</h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center text-slate/60 dark:text-beige/60"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <FilterFields local={local} set={set} />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setLocal(emptyFilters)
                  onReset()
                  setDrawerOpen(false)
                }}
                className="flex-1 rounded-xl border border-slate/20 dark:border-white/10 px-4 py-3 text-sm font-medium text-slate dark:text-beige/70"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-navy shadow-sm"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
