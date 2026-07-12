/**
 * Format a PKR price as a human-readable string with K / M suffix.
 *
 * Examples:
 *   500_000   → "PKR 500K"
 *   2_500_000 → "PKR 2.5M"
 *   10_000_000→ "PKR 10M"
 *
 * Used on both public pages (listings, detail) and the admin form preview.
 */
export function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "—"
  if (value === 0) return "PKR 0"
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    return `PKR ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (value >= 1_000) {
    const k = value / 1_000
    return `PKR ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`
  }
  return `PKR ${new Intl.NumberFormat("en-US").format(value)}`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

export const statusLabels: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
}

export const statusStyles: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-800",
  reserved: "bg-amber-100 text-amber-800",
  sold: "bg-rose-100 text-rose-800",
}
