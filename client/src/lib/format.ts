export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "-"
  // Compact currency-style formatting suited to real estate (PKR-agnostic).
  if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(2)} Cr`
  if (value >= 100_000) return `${(value / 100_000).toFixed(2)} Lac`
  return new Intl.NumberFormat("en-US").format(value)
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
