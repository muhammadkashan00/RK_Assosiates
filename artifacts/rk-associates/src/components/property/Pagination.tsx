function pageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "...")[] = [1]
  if (current > 3) pages.push("...")
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push("...")
  pages.push(total)
  return pages
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1.5 sm:gap-2"
      aria-label="Pagination"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-slate/20 px-3 text-sm font-medium text-slate transition hover:bg-slate/5 disabled:opacity-40 disabled:hover:bg-transparent dark:border-white/10 dark:text-beige/80 dark:hover:bg-white/5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {pageList(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-slate/50 dark:text-beige/40">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-11 min-w-[44px] items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
              p === page
                ? "bg-gold text-navy"
                : "border border-slate/20 text-slate hover:bg-slate/5 dark:border-white/10 dark:text-beige/80 dark:hover:bg-white/5"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-slate/20 px-3 text-sm font-medium text-slate transition hover:bg-slate/5 disabled:opacity-40 disabled:hover:bg-transparent dark:border-white/10 dark:text-beige/80 dark:hover:bg-white/5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </nav>
  )
}
